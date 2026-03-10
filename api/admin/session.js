import { clearAdminCookie, requireAdminUser } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

export default async function handler(req, res) {
  const methods = "GET, POST, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const sessionRateLimit = applyRateLimit(res, {
    key: `admin:session:${clientIp}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (!sessionRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." }, methods);
  }

  if (!["GET", "POST"].includes(req.method)) {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  if (req.method === "POST") {
    res.setHeader("Set-Cookie", clearAdminCookie());
    return json(res, 200, { ok: true }, methods);
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." }, methods);
  }

  try {
    const auth = await requireAdminUser(req);
    if (!auth.ok) {
      return json(res, auth.status || 401, { ok: false, error: auth.error }, methods);
    }

    return json(
      res,
      200,
      {
        ok: true,
        user: {
          id: auth.user.id,
          email: auth.user.email,
          role: "admin",
        },
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
