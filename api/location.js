import { applyRateLimit } from "../server/_lib/rate-limit.js";
import { getClientIp } from "../server/_lib/security.js";
import { normalizeLocationPayload, isProbablyPublicIp } from "../shared/location.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function getHeader(req, key) {
  return req.headers[String(key || "").toLowerCase()];
}

function getPlatformLocation(req) {
  return normalizeLocationPayload(
    {
      countryCode: getHeader(req, "x-vercel-ip-country") || getHeader(req, "cf-ipcountry"),
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

export default async function handler(req, res) {
  const methods = "GET, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const rateLimit = applyRateLimit(res, {
    key: `location:${clientIp}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." }, methods);
  }

  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  try {
    const platformLocation = getPlatformLocation(req);

    if (isProbablyPublicIp(clientIp)) {
      const detectedLocation = (await lookupIpApi(clientIp)) || (await lookupIpWho(clientIp)) || platformLocation;
      if (detectedLocation) {
        return json(res, 200, { ok: true, ...detectedLocation }, methods);
      }
    } else if (platformLocation) {
      return json(res, 200, { ok: true, ...platformLocation }, methods);
    }

    return json(res, 404, { ok: false, error: "Location could not be determined." }, methods);
  } catch {
    return json(res, 502, { ok: false, error: "Location lookup failed." }, methods);
  }
}
