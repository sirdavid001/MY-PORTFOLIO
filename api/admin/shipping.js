import { requireAdminUser } from "../_lib/admin-auth.js";
import { applyRateLimit } from "../_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../_lib/security.js";
import { DEFAULT_SHIPPING_CONFIG, normalizeShippingConfig } from "../../shared/shop-defaults.js";
import { normalizeSupabaseError, supabaseRest } from "../_lib/supabase-rest.js";

const METHODS = "GET, PUT, OPTIONS";
const MISSING_TABLE_HINT =
  "Supabase table public.shop_settings is missing. Run supabase/catalog.sql in Supabase SQL Editor.";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

function json(res, status, data) {
  setCors(res);
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

function mapRowToShipping(row) {
  return normalizeShippingConfig({
    mode: row?.shipping_mode,
    flatUsd: row?.flat_usd,
    percentRate: row?.percent_rate,
    minUsd: row?.min_usd,
  });
}

async function loadShippingConfig() {
  const response = await supabaseRest(
    "shop_settings?select=id,shipping_mode,flat_usd,percent_rate,min_usd&order=id.asc&limit=1"
  );

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: normalizeSupabaseError(response.error, "Load shipping settings", MISSING_TABLE_HINT),
    };
  }

  const row = Array.isArray(response.data) ? response.data[0] : null;
  if (!row) {
    return {
      ok: true,
      shipping: normalizeShippingConfig(DEFAULT_SHIPPING_CONFIG),
    };
  }

  return {
    ok: true,
    shipping: mapRowToShipping(row),
  };
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const adminRateLimit = applyRateLimit(res, {
    key: `admin:shipping:${clientIp}`,
    limit: 100,
    windowMs: 10 * 60 * 1000,
  });
  if (!adminRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." });
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." });
  }

  const auth = await requireAdminUser(req);
  if (!auth.ok) {
    return json(res, auth.status || 401, { ok: false, error: auth.error });
  }

  try {
    if (req.method === "GET") {
      const loaded = await loadShippingConfig();
      if (!loaded.ok) {
        return json(res, loaded.status || 502, { ok: false, error: loaded.error });
      }

      return json(res, 200, { ok: true, shipping: loaded.shipping });
    }

    if (req.method === "PUT") {
      const payload = await readJsonBody(req);
      const shipping = normalizeShippingConfig(payload?.shipping || payload || {});

      const patchResponse = await supabaseRest("shop_settings?id=eq.1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          shipping_mode: shipping.mode,
          flat_usd: shipping.flatUsd,
          percent_rate: shipping.percentRate,
          min_usd: shipping.minUsd,
          updated_at: new Date().toISOString(),
        }),
      });

      const patchedRow = Array.isArray(patchResponse.data) ? patchResponse.data[0] : null;
      if (!patchResponse.ok || !patchedRow) {
        const fallbackInsert = await supabaseRest("shop_settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify({
            id: 1,
            shipping_mode: shipping.mode,
            flat_usd: shipping.flatUsd,
            percent_rate: shipping.percentRate,
            min_usd: shipping.minUsd,
            updated_at: new Date().toISOString(),
          }),
        });

        if (!fallbackInsert.ok) {
          return json(res, 502, {
            ok: false,
            error: normalizeSupabaseError(fallbackInsert.error, "Update shipping settings", MISSING_TABLE_HINT),
          });
        }

        return json(res, 200, { ok: true, shipping: mapRowToShipping(fallbackInsert.data?.[0]) });
      }

      return json(res, 200, { ok: true, shipping: mapRowToShipping(patchedRow) });
    }

    return json(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." });
  }
}
