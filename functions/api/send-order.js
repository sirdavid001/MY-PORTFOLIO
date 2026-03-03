function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

const buckets = globalThis.__cfSendOrderRateLimitBuckets || new Map();
globalThis.__cfSendOrderRateLimitBuckets = buckets;

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

function getClientIp(request) {
  const ip =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  return String(ip || "").split(",")[0].trim() || "unknown";
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}

function validateOrderPayload(order) {
  if (!order || typeof order !== "object") return "Invalid order payload.";
  if (!order.reference || typeof order.reference !== "string" || order.reference.trim().length < 5) {
    return "Invalid order reference.";
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return "Order items are required.";
  }

  const itemsValid = order.items.every((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof item.name === "string" &&
      item.name.trim().length > 0 &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );
  });
  if (!itemsValid) return "Invalid order items.";

  if (!order.checkout || typeof order.checkout !== "object") {
    return "Checkout data is required.";
  }

  if (!isValidEmail(order.checkout.email)) {
    return "Valid customer email is required.";
  }

  const total = Number(order.total);
  if (!Number.isFinite(total) || total <= 0) {
    return "Invalid order total.";
  }

  return null;
}

async function saveOrderToSupabase(order, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRole) return { ok: true, skipped: true };

  const payload = {
    reference: order.reference,
    customer_name: order.checkout?.fullName || null,
    customer_email: order.checkout?.email || null,
    customer_phone: order.checkout?.phone || null,
    address: order.checkout?.address || null,
    city: order.checkout?.city || null,
    country: order.checkout?.country || null,
    payment_method: order.checkout?.paymentMethod || null,
    currency: order.currency || "USD",
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    total: Number(order.total || 0),
    notes: order.checkout?.notes || null,
    items: order.items || [],
    status: "new",
    created_at: new Date().toISOString(),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?on_conflict=reference`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRole,
      Authorization: `Bearer ${supabaseServiceRole}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, error: normalizeSupabaseError(message, "Supabase insert") };
  }

  return { ok: true };
}

function normalizeSupabaseError(rawText, action) {
  const text = String(rawText || "").trim();
  if (!text) return `${action} failed.`;

  try {
    const parsed = JSON.parse(text);
    if (parsed?.code === "PGRST205") {
      return "Supabase table public.orders is missing. Create it in Supabase SQL Editor using the schema in README.md.";
    }

    if (parsed?.message) {
      return `${action} failed: ${parsed.message}`;
    }
  } catch {
    // Keep fallback below.
  }

  return `${action} failed: ${text}`;
}

function formatOrder(order) {
  const lines = (order.items || [])
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");

  return `Order Reference: ${order.reference}
Customer: ${order.checkout?.fullName || ""}
Email: ${order.checkout?.email || ""}
Phone: ${order.checkout?.phone || ""}
Address: ${order.checkout?.address || ""}, ${order.checkout?.city || ""}, ${order.checkout?.country || ""}
Payment Method: ${order.checkout?.paymentMethod || ""}
Currency: ${order.currency || ""}

Items:
${lines}

Subtotal: ${order.subtotal || 0}
Shipping: ${order.shipping || 0}
Total: ${order.total || 0}
Notes: ${order.checkout?.notes || "N/A"}`;
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const clientIp = getClientIp(request);
    if (!applyRateLimit(`orders:${clientIp}`, 30, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many order requests. Try again later." }, 429);
    }

    const payload = await request.json();
    const order = payload?.order;
    const validationError = validateOrderPayload(order);
    if (validationError) {
      return json({ ok: false, error: validationError }, 400);
    }

    const supabaseResult = await saveOrderToSupabase(order, env);
    if (!supabaseResult.ok) {
      return json({ ok: false, error: supabaseResult.error }, 502);
    }

    const resendKey = env.RESEND_API_KEY;
    const toEmail = env.ORDER_RECEIVER_EMAIL || "itssirdavid@gmail.com";
    const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    if (!resendKey) {
      return json({
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: false,
        warning: "RESEND_API_KEY is not configured. Order was saved without email notification.",
      });
    }

    const emailPayload = {
      from: fromEmail,
      to: [toEmail],
      subject: `New Store Order ${order.reference}`,
      text: formatOrder(order),
      reply_to: order.checkout?.email || undefined,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      return json({
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: false,
        warning: resendData?.message || "Resend request failed. Order was saved without email notification.",
      });
    }

    return json({
      ok: true,
      id: resendData?.id || null,
      persisted: !supabaseResult.skipped,
      emailSent: true,
    });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
