function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-paystack-signature",
    },
  });
}

const buckets = globalThis.__cfRateLimitBuckets || new Map();
globalThis.__cfRateLimitBuckets = buckets;

function applyRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const current = buckets.get(key);
  let bucket = current;
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return bucket.count <= limit;
}

function safeCompare(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  const len = Math.max(left.length, right.length, 1);
  let diff = left.length === right.length ? 0 : 1;

  for (let i = 0; i < len; i += 1) {
    const lc = left.charCodeAt(i) || 0;
    const rc = right.charCodeAt(i) || 0;
    diff |= lc ^ rc;
  }

  return diff === 0;
}

function getClientIp(request) {
  const ip =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (!ip) return "unknown";
  return String(ip).split(",")[0].trim() || "unknown";
}

async function sha512HmacHex(secret, message) {
  const keyData = new TextEncoder().encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function fetchOrderByReference(reference, env) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}&select=id,total,currency,customer_email,status&limit=1`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 502, error: `Failed to load order: ${message}` };
  }

  const rows = await response.json().catch(() => []);
  return { ok: true, order: rows?.[0] || null };
}

async function updateOrderPaid(reference, env) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status: "paid" }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 502, error: `Failed to update order status: ${message}` };
  }

  const rows = await response.json().catch(() => []);
  return { ok: true, updated: rows.length };
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const clientIp = getClientIp(request);
    if (!applyRateLimit(`paystack:webhook:${clientIp}`, 120, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many webhook requests." }, 429);
    }

    if (!env.PAYSTACK_SECRET_KEY) {
      return json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, 500);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: "Supabase environment variables are missing." }, 500);
    }

    const rawBody = await request.text();
    const signature = String(request.headers.get("x-paystack-signature") || "").trim();
    const computed = await sha512HmacHex(env.PAYSTACK_SECRET_KEY, rawBody);

    if (!signature || !safeCompare(signature, computed)) {
      return json({ ok: false, error: "Invalid webhook signature." }, 401);
    }

    const event = JSON.parse(rawBody || "{}");
    if (event?.event !== "charge.success") {
      return json({ ok: true, ignored: true });
    }

    const transaction = event?.data || {};
    if (transaction?.status !== "success") {
      return json({ ok: true, ignored: true });
    }

    const orderReference = String(transaction?.metadata?.order_reference || "").trim();
    if (!orderReference) {
      return json({ ok: true, ignored: true, reason: "Missing metadata.order_reference" });
    }

    const orderResult = await fetchOrderByReference(orderReference, env);
    if (!orderResult.ok) {
      return json({ ok: false, error: orderResult.error }, orderResult.status);
    }

    if (!orderResult.order) {
      return json({ ok: true, ignored: true, reason: "Order not found" });
    }

    const expectedAmountKobo = Math.round(Number(orderResult.order.total || 0) * 100);
    const settledAmount = Number(transaction?.amount || 0);
    const expectedCurrency = String(orderResult.order.currency || "").toUpperCase();
    const settledCurrency = String(transaction?.currency || "").toUpperCase();
    const expectedEmail = normalizeEmail(orderResult.order.customer_email);
    const settledEmail = normalizeEmail(transaction?.customer?.email);

    if (expectedAmountKobo > 0 && settledAmount !== expectedAmountKobo) {
      return json({ ok: false, error: "Amount mismatch." }, 409);
    }

    if (expectedCurrency && settledCurrency && expectedCurrency !== settledCurrency) {
      return json({ ok: false, error: "Currency mismatch." }, 409);
    }

    if (expectedEmail && settledEmail && expectedEmail !== settledEmail) {
      return json({ ok: false, error: "Customer email mismatch." }, 409);
    }

    if (orderResult.order.status === "paid") {
      return json({ ok: true, updated: 0, reference: orderReference, idempotent: true });
    }

    const updated = await updateOrderPaid(orderReference, env);
    if (!updated.ok) {
      return json({ ok: false, error: updated.error }, updated.status);
    }

    return json({ ok: true, updated: updated.updated, reference: orderReference });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
