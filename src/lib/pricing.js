export const LOCATION_FACTORS = {
  NG: 1.05,
  GB: 1.08,
  CA: 1.06,
  EU: 1.09,
  default: 1,
};

export const EURO_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL",
  "PT", "SI", "SK",
]);

const COUNTRY_CURRENCY_OVERRIDES = {
  US: "USD",
  NG: "NGN",
  GB: "GBP",
  CA: "CAD",
  DE: "EUR",
  FR: "EUR",
  AE: "AED",
  IN: "INR",
  KE: "KES",
  GH: "GHS",
  ZA: "ZAR",
};

export function getLocationFactor(countryCode) {
  const code = String(countryCode || "US").toUpperCase();
  const key = EURO_COUNTRIES.has(code) ? "EU" : code;
  return LOCATION_FACTORS[key] ?? LOCATION_FACTORS.default;
}

export function getCurrencyForCountry(countryCode, fallbackCurrency = "USD") {
  const code = String(countryCode || "US").toUpperCase();
  if (COUNTRY_CURRENCY_OVERRIDES[code]) return COUNTRY_CURRENCY_OVERRIDES[code];
  if (EURO_COUNTRIES.has(code)) return "EUR";
  return fallbackCurrency;
}

export function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
