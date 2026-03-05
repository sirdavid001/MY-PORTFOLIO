import { requireAdminUser } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";

const ALLOWED_STATUS = new Set(["new", "paid", "processing", "in_route", "completed", "cancelled"]);

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

function normalizeTrackingNumber(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  return normalized.slice(0, 120);
}

function normalizeStatusInput(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "";
  if (normalized === "shipped" || normalized === "inroute" || normalized === "in_transit") return "in_route";
  if (normalized === "delivered") return "completed";
  return normalized;
}

function normalizeReference(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function generateTrackingNumber(reference) {
  const normalizedReference = normalizeReference(reference);
  if (!normalizedReference) return null;

  const core = normalizedReference.slice(-8).padStart(8, "0");
  let hash = 2166136261;
  for (let i = 0; i < normalizedReference.length; i += 1) {
    hash ^= normalizedReference.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const checksum = hash.toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return `SDV-${core}-${checksum}`;
}

function resolveTrackingNumber(order) {
  const existing = normalizeTrackingNumber(order?.tracking_number);
  if (existing) return existing;
  return generateTrackingNumber(order?.reference);
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

function isMissingTrackingNumberColumnError(rawText) {
  const text = String(rawText || "").toLowerCase();
  return text.includes("tracking_number") && (text.includes("column") || text.includes("42703"));
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

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    console.warn("[admin] blocked by ADMIN_ALLOWED_IPS", { ip: clientIp, method: req.method });
    return json(res, 403, { ok: false, error: "Access denied from this IP." }, methods);
  }

  const auth = await requireAdminUser(req);
  if (!auth.ok) {
    console.warn("[admin] unauthorized request", { ip: clientIp, method: req.method, reason: auth.error });
    return json(res, auth.status || 401, { ok: false, error: auth.error }, methods);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." }, methods);
  }

  try {
    if (req.method === "GET") {
      const headers = {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      };
      const queryWithTracking =
        "select=id,reference,tracking_number,customer_name,customer_email,customer_phone,address,city,country,payment_method,subtotal,shipping,total,currency,notes,status,created_at,items&order=created_at.desc&limit=200";
      const fallbackQuery =
        "select=id,reference,customer_name,customer_email,customer_phone,address,city,country,payment_method,subtotal,shipping,total,currency,notes,status,created_at,items&order=created_at.desc&limit=200";

      let response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?${queryWithTracking}`, {
        headers,
      });

      if (!response.ok) {
        const message = await response.text();
        if (!isMissingTrackingNumberColumnError(message)) {
          return json(res, 502, { ok: false, error: normalizeSupabaseError(message, "Load orders") }, methods);
        }

        response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?${fallbackQuery}`, {
          headers,
        });

        if (!response.ok) {
          const fallbackMessage = await response.text();
          return json(res, 502, { ok: false, error: normalizeSupabaseError(fallbackMessage, "Load orders") }, methods);
        }
      }

      const orders = (await response.json().catch(() => [])).map((order) => ({
        ...order,
        status: normalizeStatusInput(order?.status) || "new",
        tracking_number: resolveTrackingNumber(order),
      }));
      return json(res, 200, { ok: true, orders }, methods);
    }

    if (req.method === "PATCH") {
      const id = Number(firstValue(req.query?.id));
      if (!id) {
        return json(res, 400, { ok: false, error: "Invalid order id." }, methods);
      }

      const payload = await readJsonBody(req);
      const status = normalizeStatusInput(payload?.status);
      const hasStatus = status.length > 0;
      if (hasStatus && !ALLOWED_STATUS.has(status)) {
        return json(res, 400, { ok: false, error: "Invalid status." }, methods);
      }

      const hasTrackingField = hasOwnProperty(payload, "trackingNumber") || hasOwnProperty(payload, "tracking_number");
      const rawTrackingNumber = hasOwnProperty(payload, "trackingNumber")
        ? payload?.trackingNumber
        : payload?.tracking_number;
      const trackingNumber = normalizeTrackingNumber(rawTrackingNumber);
      if (!hasStatus && !hasTrackingField) {
        return json(res, 400, { ok: false, error: "No valid order updates provided." }, methods);
      }

      const updatePayload = {};
      if (hasStatus) updatePayload.status = status;
      if (hasTrackingField) updatePayload.tracking_number = trackingNumber;

      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const message = await response.text();
        if (hasTrackingField && isMissingTrackingNumberColumnError(message)) {
          return json(
            res,
            502,
            {
              ok: false,
              error: "Tracking number column is missing in public.orders. Run supabase/orders.sql, then refresh admin.",
            },
            methods
          );
        }
        const action = hasStatus && hasTrackingField ? "Update order status and tracking" : hasStatus ? "Update order status" : "Update tracking number";
        return json(res, 502, { ok: false, error: normalizeSupabaseError(message, action) }, methods);
      }

      const rows = await response.json();
      const updated = rows?.[0] || null;
      return json(
        res,
        200,
        {
          ok: true,
          order: updated
            ? {
                ...updated,
                tracking_number: resolveTrackingNumber(updated),
              }
            : null,
        },
        methods
      );
    }

    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
