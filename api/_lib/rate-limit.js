const buckets = globalThis.__sirdavidRateLimitBuckets || new Map();
globalThis.__sirdavidRateLimitBuckets = buckets;

function setRateLimitHeaders(res, { limit, remaining, resetAt }) {
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
}

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

  setRateLimitHeaders(res, { limit, remaining, resetAt: bucket.resetAt });

  if (bucket.count > limit) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return { ok: false, retryAfterSec, source: "memory" };
  }

  return { ok: true, retryAfterSec, source: "memory" };
}

function resolveRedisConfig() {
  const url = (
    process.env.RATE_LIMIT_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).trim();
  const token = (
    process.env.RATE_LIMIT_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ""
  ).trim();

  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

async function redisCommand(config, command, ...args) {
  const path = [command, ...args].map((part) => encodeURIComponent(String(part))).join("/");
  const response = await fetch(`${config.url}/${path}`, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.error) {
    throw new Error(data?.error || `Redis command failed: ${command}`);
  }

  return data?.result;
}

async function applyRedisRateLimit(res, { key, limit, windowMs }) {
  const config = resolveRedisConfig();
  if (!config) return null;

  const now = Date.now();
  const redisKey = `sd:ratelimit:${key}`;
  const count = Number(await redisCommand(config, "INCR", redisKey));
  let ttlMs = Number(await redisCommand(config, "PTTL", redisKey));

  if (count <= 1 || !Number.isFinite(ttlMs) || ttlMs < 0) {
    await redisCommand(config, "PEXPIRE", redisKey, windowMs);
    ttlMs = windowMs;
  }

  const resetAt = now + Math.max(1, ttlMs);
  const remaining = Math.max(0, limit - count);
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - now) / 1000));

  setRateLimitHeaders(res, { limit, remaining, resetAt });

  if (count > limit) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return { ok: false, retryAfterSec, source: "redis" };
  }

  return { ok: true, retryAfterSec, source: "redis" };
}

export async function applyRateLimitAsync(res, options) {
  try {
    const redisResult = await applyRedisRateLimit(res, options);
    if (redisResult) return redisResult;
  } catch {
    // If the configured persistent limiter is unavailable, keep the endpoint responsive.
  }

  return applyRateLimit(res, options);
}
