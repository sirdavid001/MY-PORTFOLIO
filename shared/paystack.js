export const DEFAULT_PAYSTACK_SUPPORTED_CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR", "XOF"];
export const DEFAULT_PAYSTACK_APPLE_PAY_CURRENCIES = ["NGN", "USD", "GHS", "KES"];

function normalizeCurrencyCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeCurrencyList(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return Array.from(
    new Set(
      values
        .map(normalizeCurrencyCode)
        .filter((currency) => /^[A-Z]{3}$/.test(currency))
    )
  );
}

export function resolvePaystackSupportedCurrencies(value) {
  const normalized = normalizeCurrencyList(value);
  return normalized.length > 0 ? normalized : [...DEFAULT_PAYSTACK_SUPPORTED_CURRENCIES];
}

export function resolveApplePaySupportedCurrencies(value) {
  const normalized = normalizeCurrencyList(value);
  return normalized.length > 0 ? normalized : [...DEFAULT_PAYSTACK_APPLE_PAY_CURRENCIES];
}

export function isPaystackCurrencySupported(currency, supportedCurrencies) {
  return resolvePaystackSupportedCurrencies(supportedCurrencies).includes(normalizeCurrencyCode(currency));
}

export function formatCurrencyList(currencies) {
  return resolvePaystackSupportedCurrencies(currencies).join(", ");
}
