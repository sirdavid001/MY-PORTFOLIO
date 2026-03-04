function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, x-admin-key",
    },
  });
}

const buckets = globalThis.__cfAdminRateLimitBuckets || new Map();
globalThis.__cfAdminRateLimitBuckets = buckets;

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

function isIpAllowed(ip, allowListRaw) {
  const allowList = String(allowListRaw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowList.length === 0) return true;
  return allowList.some((rule) => {
    if (rule.endsWith("*")) return ip.startsWith(rule.slice(0, -1));
    return ip === rule;
  });
}

function isAuthorized(request, env) {
  const provided = String(request.headers.get("x-admin-key") || "").trim();
  const expected = String(env.ADMIN_DASHBOARD_KEY || "").trim();
  return Boolean(expected) && safeCompare(provided, expected);
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

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const clientIp = getClientIp(request);

    if (!applyRateLimit(`admin:get:${clientIp}`, 60, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many requests. Try again later." }, 429);
    }

    if (!env.ADMIN_DASHBOARD_KEY || !String(env.ADMIN_DASHBOARD_KEY).trim()) {
      return json({ ok: false, error: "ADMIN_DASHBOARD_KEY is not configured." }, 500);
    }

    if (!isIpAllowed(clientIp, env.ADMIN_ALLOWED_IPS)) {
      return json({ ok: false, error: "Access denied from this IP." }, 403);
    }

    if (!isAuthorized(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: "Supabase environment variables are missing." }, 500);
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?select=id,reference,customer_name,customer_email,customer_phone,address,city,country,payment_method,subtotal,shipping,total,currency,notes,status,created_at,items&order=created_at.desc&limit=200`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const message = await response.text();
      return json({ ok: false, error: normalizeSupabaseError(message, "Load orders") }, 502);
    }

    const orders = await response.json();
    return json({ ok: true, orders });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
