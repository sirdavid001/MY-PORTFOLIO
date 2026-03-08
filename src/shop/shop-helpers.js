export const CART_STORAGE_KEY = "sd_store_cart";

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function toPrice(basePriceUsd, pricingContext) {
  const exchangeRate = Math.max(0.0001, toFiniteNumber(pricingContext?.exchangeRate, 1));
  const factor = Math.max(0.0001, toFiniteNumber(pricingContext?.factor, 1));
  return Math.max(0, toFiniteNumber(basePriceUsd, 0)) * exchangeRate * factor;
}

export function buildStorePricingContext(pricingContext, fallbackNgnPerUsd = 1600) {
  const currency = String(pricingContext?.currency || "NGN").toUpperCase();
  const rateFromContext = toFiniteNumber(pricingContext?.exchangeRate, 0);
  const rateFromTable = toFiniteNumber(pricingContext?.rates?.[currency], 0);
  const fallbackRate = currency === "USD" ? 1 : currency === "NGN" ? fallbackNgnPerUsd : 1;
  const exchangeRate =
    rateFromContext > 0
      ? rateFromContext
      : rateFromTable > 0
        ? rateFromTable
        : fallbackRate;

  return {
    countryCode: pricingContext?.countryCode || "NG",
    countryName: pricingContext?.countryName || "Nigeria",
    currency,
    exchangeRate,
    factor: toFiniteNumber(pricingContext?.factor, 1),
  };
}

export function normalizeCartItem(rawItem) {
  const id = String(rawItem?.id || "").trim();
  const name = String(rawItem?.name || "").trim();
  const basePriceUsd = Math.max(0, toFiniteNumber(rawItem?.basePriceUsd, 0));
  const maxStock = Math.max(
    1,
    Math.round(toFiniteNumber(rawItem?.maxStock, rawItem?.quantity || 1))
  );
  const quantity = Math.max(1, Math.min(Math.round(toFiniteNumber(rawItem?.quantity, 1)), maxStock));

  if (!id || !name) return null;

  return {
    id,
    name,
    brand: String(rawItem?.brand || "").trim(),
    basePriceUsd,
    quantity,
    maxStock,
  };
}

export function normalizeStoredCartItems(rawValue) {
  const entries = Array.isArray(rawValue)
    ? rawValue
    : rawValue && typeof rawValue === "object"
      ? Object.entries(rawValue)
          .map(([id, value]) =>
            value && typeof value === "object" ? { ...value, id: value.id ?? id } : null
          )
          .filter(Boolean)
      : [];

  return entries.map(normalizeCartItem).filter(Boolean);
}
