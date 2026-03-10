import { buildAdminCookie } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}

function hasAdminRole(user) {
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role;
  if (Array.isArray(role)) {
    return role.map((item) => String(item).toLowerCase()).includes("admin");
  }

  return String(role || "").toLowerCase() === "admin";
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const loginRateLimit = applyRateLimit(res, {
    key: `admin:login:${clientIp}`,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!loginRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many login attempts. Try again later." }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." }, methods);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return json(res, 500, { ok: false, error: "SUPABASE_URL or SUPABASE_ANON_KEY is not configured." }, methods);
  }

  try {
    const payload = await readJsonBody(req);
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");

    if (!isValidEmail(email) || password.length < 8) {
      return json(res, 400, { ok: false, error: "Valid email and password are required." }, methods);
    }

    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token || !data?.user) {
      return json(res, 401, { ok: false, error: "Invalid login credentials." }, methods);
    }

    if (!hasAdminRole(data.user)) {
      return json(res, 403, { ok: false, error: "Admin role required." }, methods);
    }

    const expiresIn = Number(data?.expires_in || 3600);
    const maxAge = Number.isFinite(expiresIn) ? Math.max(900, Math.min(expiresIn, 7 * 24 * 60 * 60)) : 3600;
    res.setHeader("Set-Cookie", buildAdminCookie(data.access_token, maxAge));

    return json(
      res,
      200,
      {
        success: true,
        ok: true,
        token: data.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: "admin",
        },
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
