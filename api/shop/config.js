import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp } from "../../server/_lib/security.js";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_SHIPPING_CONFIG,
  SHOP_CATEGORY_OPTIONS,
  normalizeProduct,
  normalizeShippingConfig,
} from "../../shared/shop-defaults.js";
import { supabaseRest } from "../../server/_lib/supabase-rest.js";

const METHODS = "GET, OPTIONS";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

function fallbackPayload() {
  const fallbackProducts = DEFAULT_PRODUCTS.map((product) => normalizeProduct(product)).filter((product) => product.isActive);
  const fallbackCategories = Array.from(
    new Set([...SHOP_CATEGORY_OPTIONS, ...fallbackProducts.map((product) => String(product.category || "").trim()).filter(Boolean)])
  );
  return {
    ok: true,
    source: "defaults",
    products: fallbackProducts,
    categories: fallbackCategories,
    shipping: normalizeShippingConfig(DEFAULT_SHIPPING_CONFIG),
  };
}

function mapProductRow(row) {
  return normalizeProduct({
    id: row?.id,
    name: row?.name,
    brand: row?.brand,
    condition: row?.condition,
    category: row?.category,
    storageGb: row?.storage_gb,
    batteryHealth: row?.battery_health,
    networkLock: row?.network_lock,
    networkCarrier: row?.network_carrier,
    basePriceUsd: row?.base_price_usd,
    stock: row?.stock,
    image: row?.image,
    details: row?.details,
    isActive: row?.is_active,
    sortOrder: row?.sort_order,
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  });
}

function sortProducts(rows) {
  return [...rows].sort((a, b) => {
    const aOrder = Number(a?.sort_order ?? 0);
    const bOrder = Number(b?.sort_order ?? 0);
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

function mapShippingRow(row) {
  return normalizeShippingConfig({
    mode: row?.shipping_mode,
    flatUsd: row?.flat_usd,
    percentRate: row?.percent_rate,
    minUsd: row?.min_usd,
  });
}

async function loadSupabaseConfig() {
  const [productsResponse, shippingResponse] = await Promise.all([
    supabaseRest(
      "shop_products?select=id,name,brand,condition,category,storage_gb,battery_health,network_lock,network_carrier,base_price_usd,stock,image,details,is_active,sort_order,created_at,updated_at&is_active=eq.true"
    ),
    supabaseRest("shop_settings?select=id,shipping_mode,flat_usd,percent_rate,min_usd&order=id.asc&limit=1"),
  ]);

  if (!productsResponse.ok || !shippingResponse.ok) {
    return null;
  }

  const products = sortProducts(Array.isArray(productsResponse.data) ? productsResponse.data : [])
    .map(mapProductRow)
    .filter((product) => product.id && product.isActive);
  const categories = Array.from(
    new Set([...SHOP_CATEGORY_OPTIONS, ...products.map((product) => String(product.category || "").trim()).filter(Boolean)])
  );

  const shippingRow = Array.isArray(shippingResponse.data) ? shippingResponse.data[0] : null;
  const shipping = shippingRow ? mapShippingRow(shippingRow) : normalizeShippingConfig(DEFAULT_SHIPPING_CONFIG);

  return {
    ok: true,
    source: "supabase",
    products,
    categories,
    shipping,
  };
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const configRateLimit = applyRateLimit(res, {
    key: `shop:config:${clientIp}`,
    limit: 180,
    windowMs: 10 * 60 * 1000,
  });
  if (!configRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many requests. Try again later." });
  }

  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 200, fallbackPayload());
  }

  try {
    const loaded = await loadSupabaseConfig();
    if (!loaded) {
      return json(res, 200, fallbackPayload());
    }

    return json(res, 200, loaded);
  } catch {
    return json(res, 200, fallbackPayload());
  }
}
