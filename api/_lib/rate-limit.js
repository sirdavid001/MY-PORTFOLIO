const buckets = globalThis.__sirdavidRateLimitBuckets || new Map();
globalThis.__sirdavidRateLimitBuckets = buckets;

function prune(now) {
  if (buckets.size < 5000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function applyRateLimit(res, { key, limit, windowMs }) {
  const now = Date.now();
  prune(now);

  const current = buckets.get(key);
  let bucket = current;
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > limit) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return { ok: false, retryAfterSec };
  }

  return { ok: true, retryAfterSec };
}
