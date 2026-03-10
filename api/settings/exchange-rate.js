import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp } from "../../server/_lib/security.js";
import { supabaseRest } from "../../server/_lib/supabase-rest.js";
import { getDefaultExchangeRate, getRuntimeExchangeRate, setRuntimeExchangeRate } from "../../server/_lib/runtime-settings.js";

const METHODS = "GET, OPTIONS";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-admin-token");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const rateLimit = applyRateLimit(res, {
    key: `settings:exchange-rate:${clientIp}`,
    limit: 180,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." });
  }

  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  try {
    const fallbackRate = getRuntimeExchangeRate() || getDefaultExchangeRate();

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return json(res, 200, { ok: true, ngnPerUsd: fallbackRate, persisted: false });
    }

    const response = await supabaseRest("shop_settings?select=id,ngn_per_usd&order=id.asc&limit=1");
    if (!response.ok) {
      return json(res, 200, { ok: true, ngnPerUsd: fallbackRate, persisted: false });
    }

    const row = Array.isArray(response.data) ? response.data[0] : null;
    const rate = Number(row?.ngn_per_usd);
    if (Number.isFinite(rate) && rate > 0) {
      setRuntimeExchangeRate(rate);
      return json(res, 200, { ok: true, ngnPerUsd: rate, persisted: true });
    }

    return json(res, 200, { ok: true, ngnPerUsd: fallbackRate, persisted: false });
  } catch (error) {
    return json(res, 200, {
      ok: true,
      ngnPerUsd: getRuntimeExchangeRate() || getDefaultExchangeRate(),
      persisted: false,
      warning: error?.message || "Unexpected exchange-rate error.",
    });
  }
}
