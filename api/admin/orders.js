import { applyRateLimit } from "../_lib/rate-limit.js";
import { getClientIp, isIpAllowed, safeCompare } from "../_lib/security.js";

const ALLOWED_STATUS = new Set(["new", "processing", "paid", "shipped", "completed", "cancelled"]);

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-admin-key");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isAuthorized(req) {
  const provided = String(req.headers["x-admin-key"] || "").trim();
  const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();
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

export default async function handler(req, res) {
  const methods = "GET, PATCH, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const adminRateLimit = applyRateLimit(res, {
    key: `admin:${clientIp}`,
    limit: 60,
    windowMs: 10 * 60 * 1000,
  });
  if (!adminRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." }, methods);
  }

  if (!process.env.ADMIN_DASHBOARD_KEY || !String(process.env.ADMIN_DASHBOARD_KEY).trim()) {
    return json(res, 500, { ok: false, error: "ADMIN_DASHBOARD_KEY is not configured." }, methods);
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    console.warn("[admin] blocked by ADMIN_ALLOWED_IPS", { ip: clientIp, method: req.method });
    return json(res, 403, { ok: false, error: "Access denied from this IP." }, methods);
  }

  if (!isAuthorized(req)) {
    console.warn("[admin] unauthorized request", { ip: clientIp, method: req.method });
    return json(res, 401, { ok: false, error: "Unauthorized" }, methods);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." }, methods);
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/orders?select=id,reference,customer_name,customer_email,customer_phone,country,total,currency,status,created_at,items&order=created_at.desc&limit=200`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        return json(res, 502, { ok: false, error: normalizeSupabaseError(message, "Load orders") }, methods);
      }

      const orders = await response.json();
      return json(res, 200, { ok: true, orders }, methods);
    }

    if (req.method === "PATCH") {
      const id = Number(firstValue(req.query?.id));
      if (!id) {
        return json(res, 400, { ok: false, error: "Invalid order id." }, methods);
      }

      const payload = await readJsonBody(req);
      const status = String(payload?.status || "").trim();
      if (!ALLOWED_STATUS.has(status)) {
        return json(res, 400, { ok: false, error: "Invalid status." }, methods);
      }

      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const message = await response.text();
        return json(res, 502, { ok: false, error: normalizeSupabaseError(message, "Update order status") }, methods);
      }

      const rows = await response.json();
      return json(res, 200, { ok: true, order: rows?.[0] || null }, methods);
    }

    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
