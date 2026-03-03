import { clearAdminCookie } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp } from "../../server/_lib/security.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const logoutRateLimit = applyRateLimit(res, {
    key: `admin:logout:${clientIp}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (!logoutRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  res.setHeader("Set-Cookie", clearAdminCookie());
  return json(res, 200, { ok: true }, methods);
}
