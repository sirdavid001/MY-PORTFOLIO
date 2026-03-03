function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

const buckets = globalThis.__cfPaystackPublicKeyRateLimitBuckets || new Map();
globalThis.__cfPaystackPublicKeyRateLimitBuckets = buckets;

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

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!applyRateLimit(`paystack:key:${String(clientIp).split(",")[0].trim()}`, 120, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many requests. Try again later." }, 429);
  }

  const key = env.PAYSTACK_PUBLIC_KEY || env.VITE_PAYSTACK_PUBLIC_KEY || "";
  if (!key) {
    return json({ ok: false, error: "PAYSTACK public key is not configured." }, 404);
  }
  return json({ ok: true, key });
}
