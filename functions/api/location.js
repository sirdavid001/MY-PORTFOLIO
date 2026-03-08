import { isProbablyPublicIp, normalizeLocationPayload } from "../../shared/location.js";

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

const buckets = globalThis.__cfLocationRateLimitBuckets || new Map();
globalThis.__cfLocationRateLimitBuckets = buckets;

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
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
    .split(",")[0]
    .trim();
}

function getPlatformLocation(request) {
  return normalizeLocationPayload(
    {
      countryCode: request.cf?.country || request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country"),
      countryName: "",
      currency: "",
      source: "platform-header",
    },
    "en"
  );
}

async function lookupIpApi(ip) {
  const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  if (!response.ok) return null;

  const data = await response.json();
  return normalizeLocationPayload(
    {
      countryCode: data?.country_code,
      countryName: data?.country_name,
      currency: data?.currency,
      source: "ipapi-server",
    },
    "en"
  );
}

async function lookupIpWho(ip) {
  const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!response.ok) return null;

  const data = await response.json();
  if (!data?.success) return null;

  return normalizeLocationPayload(
    {
      countryCode: data?.country_code,
      countryName: data?.country,
      currency: data?.currency?.code,
      source: "ipwho-server",
    },
    "en"
  );
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const { request } = context;
  const clientIp = getClientIp(request);

  if (!applyRateLimit(`location:${clientIp}`, 120, 10 * 60 * 1000)) {
    return json({ ok: false, error: "Too many requests. Try again later." }, 429);
  }

  try {
    const platformLocation = getPlatformLocation(request);

    if (isProbablyPublicIp(clientIp)) {
      const detectedLocation = (await lookupIpApi(clientIp)) || (await lookupIpWho(clientIp)) || platformLocation;
      if (detectedLocation) {
        return json({ ok: true, ...detectedLocation });
      }
    } else if (platformLocation) {
      return json({ ok: true, ...platformLocation });
    }

    return json({ ok: false, error: "Location could not be determined." }, 404);
  } catch {
    return json({ ok: false, error: "Location lookup failed." }, 502);
  }
}
