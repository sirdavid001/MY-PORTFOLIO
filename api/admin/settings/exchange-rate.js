import { requireAdminUser } from "../../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../../server/_lib/security.js";
import { supabaseRest } from "../../../server/_lib/supabase-rest.js";
import { getRuntimeExchangeRate, setRuntimeExchangeRate } from "../../../server/_lib/runtime-settings.js";

const METHODS = "PUT, OPTIONS";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-admin-token");
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

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const rateLimit = applyRateLimit(res, {
    key: `admin:settings:exchange-rate:${clientIp}`,
    limit: 100,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." });
  }

  if (req.method !== "PUT") {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." });
  }

  const auth = await requireAdminUser(req);
  if (!auth.ok) {
    return json(res, auth.status || 401, { ok: false, error: auth.error });
  }

  try {
    const payload = await readJsonBody(req);
    const ngnPerUsd = Number(payload?.ngnPerUsd);
    if (!Number.isFinite(ngnPerUsd) || ngnPerUsd <= 0) {
      return json(res, 400, { ok: false, error: "Invalid rate. Enter a positive number." });
    }

    const runtimeRate = setRuntimeExchangeRate(ngnPerUsd);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return json(res, 200, { ok: true, success: true, ngnPerUsd: runtimeRate, persisted: false });
    }

    const patchResponse = await supabaseRest("shop_settings?id=eq.1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ngn_per_usd: runtimeRate,
        updated_at: new Date().toISOString(),
      }),
    });

    const patchedRow = Array.isArray(patchResponse.data) ? patchResponse.data[0] : null;
    if (patchResponse.ok && patchedRow) {
      return json(res, 200, { ok: true, success: true, ngnPerUsd: runtimeRate, persisted: true });
    }

    const insertResponse = await supabaseRest("shop_settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        id: 1,
        ngn_per_usd: runtimeRate,
        updated_at: new Date().toISOString(),
      }),
    });

    if (insertResponse.ok) {
      return json(res, 200, { ok: true, success: true, ngnPerUsd: runtimeRate, persisted: true });
    }

    return json(res, 200, {
      ok: true,
      success: true,
      ngnPerUsd: runtimeRate,
      persisted: false,
      warning: "Exchange rate saved in runtime fallback only. Add ngn_per_usd to public.shop_settings to persist it.",
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected exchange-rate error." });
  }
}
