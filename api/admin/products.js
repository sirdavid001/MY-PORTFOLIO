import { requireAdminUser } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";
import { normalizeProduct } from "../../shared/shop-defaults.js";
import { normalizeSupabaseError, supabaseRest } from "../../server/_lib/supabase-rest.js";

const METHODS = "GET, POST, PATCH, DELETE, OPTIONS";
const MISSING_TABLE_HINT =
  "Supabase table public.shop_products is missing. Run supabase/catalog.sql in Supabase SQL Editor.";
const MISSING_COLUMNS_HINT =
  "Your shop_products schema is outdated. Run the updated supabase/catalog.sql in Supabase SQL Editor and refresh.";
const NETWORK_LOCK_VALUES = new Set(["Unlocked", "Locked"]);

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
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

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toInteger(value, fallback = 0) {
  const num = Number.parseInt(String(value), 10);
  return Number.isFinite(num) ? num : fallback;
}

function toBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function createProductId(nameOrId) {
  const slug = toSlug(nameOrId);
  if (!slug) {
    return `gadget-${Date.now().toString(36)}`;
  }
  return slug;
}

function parseImageList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeImageUrls(payload) {
  const raw = [];
  const append = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    raw.push(trimmed);
  };

  const appendMany = (value) => {
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    const parsed = parseImageList(value);
    if (parsed.length > 0) {
      parsed.forEach(append);
      return;
    }
    append(value);
  };

  appendMany(payload?.images);
  appendMany(payload?.image);

  const unique = [];
  const seen = new Set();
  raw.forEach((url) => {
    if (seen.has(url)) return;
    seen.add(url);
    unique.push(url);
  });

  return unique.slice(0, 5);
}

function mapRowToProduct(row) {
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
  });
}

function normalizePayload(payload, { partial = false } = {}) {
  const result = {};

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "name")) {
    const name = String(payload?.name || "").trim();
    if (!name && !partial) return { error: "Product name is required." };
    if (name && name.length < 2) return { error: "Product name must be at least 2 characters." };
    if (name) result.name = name;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "brand")) {
    const brand = String(payload?.brand || "").trim();
    if (!partial || brand) result.brand = brand || "Sirdavid";
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "condition")) {
    const condition = String(payload?.condition || "").trim();
    if (!partial || condition) result.condition = condition || "Used - Good";
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "category")) {
    const category = String(payload?.category || "").trim();
    if (!category && !partial) return { error: "Category is required." };
    if (category) result.category = category;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "storageGb")) {
    const rawStorageGb = payload?.storageGb;
    if (rawStorageGb === "" || rawStorageGb == null) {
      result.storage_gb = null;
    } else {
      const storageGb = toInteger(rawStorageGb, NaN);
      if (!Number.isFinite(storageGb) || storageGb < 1 || storageGb > 8192) {
        return { error: "Storage (GB) must be between 1 and 8192." };
      }
      result.storage_gb = storageGb;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "batteryHealth")) {
    const rawBatteryHealth = payload?.batteryHealth;
    if (rawBatteryHealth === "" || rawBatteryHealth == null) {
      result.battery_health = null;
    } else {
      const batteryHealth = toInteger(rawBatteryHealth, NaN);
      if (!Number.isFinite(batteryHealth) || batteryHealth < 0 || batteryHealth > 100) {
        return { error: "Battery health must be between 0 and 100." };
      }
      result.battery_health = batteryHealth;
    }
  }

  const hasNetworkLock = Object.prototype.hasOwnProperty.call(payload, "networkLock");
  let normalizedNetworkLock = null;
  if (!partial || hasNetworkLock) {
    const networkLock = String(payload?.networkLock || "").trim() || "Unlocked";
    if (!NETWORK_LOCK_VALUES.has(networkLock)) {
      return { error: "Network lock must be Unlocked or Locked." };
    }
    normalizedNetworkLock = networkLock;
    result.network_lock = networkLock;
  }

  const hasNetworkCarrier = Object.prototype.hasOwnProperty.call(payload, "networkCarrier");
  if (!partial || hasNetworkCarrier || hasNetworkLock) {
    const networkCarrier = String(payload?.networkCarrier || "").trim();
    const lockToUse = normalizedNetworkLock || String(payload?.networkLock || "").trim() || "Unlocked";
    if (lockToUse === "Locked") {
      if (!networkCarrier) {
        return { error: "Select a network carrier when the device is locked." };
      }
      result.network_carrier = networkCarrier;
    } else {
      result.network_carrier = "";
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "basePriceUsd")) {
    const basePriceUsd = toNumber(payload?.basePriceUsd, NaN);
    if (!Number.isFinite(basePriceUsd) || basePriceUsd < 0) {
      return { error: "Base price must be zero or higher." };
    }
    result.base_price_usd = basePriceUsd;
  }

  const hasImageField = Object.prototype.hasOwnProperty.call(payload, "image");
  const hasImagesField = Object.prototype.hasOwnProperty.call(payload, "images");
  if (!partial || hasImageField || hasImagesField) {
    const images = normalizeImageUrls(payload);
    result.image = images.length <= 1 ? images[0] || "" : JSON.stringify(images);
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "details")) {
    result.details = String(payload?.details || "").trim();
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "isActive")) {
    result.is_active = toBoolean(payload?.isActive, true);
  }

  return { value: result };
}

function addCatalogColumnsHint(errorMessage, rawError) {
  const rawText = String(rawError || "");
  if (/(storage_gb|battery_health|network_lock|network_carrier)/i.test(rawText) && /does not exist/i.test(rawText)) {
    return `${errorMessage} ${MISSING_COLUMNS_HINT}`;
  }
  return errorMessage;
}

function sortProducts(rows) {
  return [...rows].sort((a, b) => {
    const aOrder = Number(a?.sort_order ?? 0);
    const bOrder = Number(b?.sort_order ?? 0);
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a?.name || "").localeCompare(String(b?.name || ""));
  });
}

async function loadProducts() {
  const response = await supabaseRest(
    "shop_products?select=id,name,brand,condition,category,storage_gb,battery_health,network_lock,network_carrier,base_price_usd,stock,image,details,is_active,sort_order,created_at"
  );

  if (!response.ok) {
    return {
      ok: false,
      error: addCatalogColumnsHint(
        normalizeSupabaseError(response.error, "Load products", MISSING_TABLE_HINT),
        response.error
      ),
      status: response.status,
    };
  }

  const rows = Array.isArray(response.data) ? response.data : [];
  const products = sortProducts(rows).map(mapRowToProduct);

  return { ok: true, products };
}

function getAutoStock(condition) {
  const normalized = String(condition || "").trim().toLowerCase();
  return normalized.startsWith("new") ? 5 : 1;
}

async function getNextSortOrder() {
  const response = await supabaseRest("shop_products?select=sort_order&order=sort_order.desc.nullslast&limit=1");

  if (!response.ok) {
    return {
      ok: false,
      error: normalizeSupabaseError(response.error, "Resolve sort order", MISSING_TABLE_HINT),
      status: response.status,
    };
  }

  const rows = Array.isArray(response.data) ? response.data : [];
  const currentMax = toInteger(rows[0]?.sort_order, 0);
  const safeMax = Number.isFinite(currentMax) && currentMax > 0 ? currentMax : 0;
  return { ok: true, sortOrder: safeMax + 10 };
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const adminRateLimit = applyRateLimit(res, {
    key: `admin:products:${clientIp}`,
    limit: 120,
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
      const loaded = await loadProducts();
      if (!loaded.ok) {
        return json(res, loaded.status || 502, { ok: false, error: loaded.error });
      }

      return json(res, 200, { ok: true, products: loaded.products });
    }

    if (req.method === "POST") {
      const payload = await readJsonBody(req);
      const normalized = normalizePayload(payload, { partial: false });
      if (normalized.error) {
        return json(res, 400, { ok: false, error: normalized.error });
      }

      const nextSort = await getNextSortOrder();
      if (!nextSort.ok) {
        return json(res, nextSort.status || 502, { ok: false, error: nextSort.error });
      }

      const requestedId = String(payload?.id || "").trim();
      const baseId = createProductId(requestedId || normalized.value.name);
      const productId = requestedId ? baseId : `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
      const autoStock = getAutoStock(normalized.value.condition);

      const response = await supabaseRest("shop_products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          id: productId,
          ...normalized.value,
          stock: autoStock,
          sort_order: nextSort.sortOrder,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const normalizedError = normalizeSupabaseError(response.error, "Create product", MISSING_TABLE_HINT);
        return json(res, 502, {
          ok: false,
          error: addCatalogColumnsHint(normalizedError, response.error),
        });
      }

      const product = mapRowToProduct(response.data?.[0]);
      return json(res, 201, { ok: true, product });
    }

    if (req.method === "PATCH") {
      const id = String(firstValue(req.query?.id) || "").trim();
      if (!id) {
        return json(res, 400, { ok: false, error: "Product id is required." });
      }

      const payload = await readJsonBody(req);
      const normalized = normalizePayload(payload, { partial: true });
      if (normalized.error) {
        return json(res, 400, { ok: false, error: normalized.error });
      }

      if (Object.keys(normalized.value).length === 0) {
        return json(res, 400, { ok: false, error: "No product fields to update." });
      }

      const response = await supabaseRest(`shop_products?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          ...normalized.value,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const normalizedError = normalizeSupabaseError(response.error, "Update product", MISSING_TABLE_HINT);
        return json(res, 502, {
          ok: false,
          error: addCatalogColumnsHint(normalizedError, response.error),
        });
      }

      const product = mapRowToProduct(response.data?.[0]);
      if (!product?.id) {
        return json(res, 404, { ok: false, error: "Product not found." });
      }

      return json(res, 200, { ok: true, product });
    }

    if (req.method === "DELETE") {
      const id = String(firstValue(req.query?.id) || "").trim();
      if (!id) {
        return json(res, 400, { ok: false, error: "Product id is required." });
      }

      const response = await supabaseRest(`shop_products?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      });

      if (!response.ok) {
        return json(res, 502, {
          ok: false,
          error: normalizeSupabaseError(response.error, "Delete product", MISSING_TABLE_HINT),
        });
      }

      const deleted = Array.isArray(response.data) ? response.data : [];
      if (deleted.length === 0) {
        return json(res, 404, { ok: false, error: "Product not found." });
      }

      return json(res, 200, { ok: true, id });
    }

    return json(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." });
  }
}
