import { useEffect, useState } from "react";
import { getCurrencyForCountry, getLocationFactor } from "../lib/pricing";

const PRICING_CONTEXT_STORAGE_KEY = "sd_pricing_context";

const defaultContext = {
  countryCode: "NG",
  countryName: "Nigeria",
  currency: "NGN",
  exchangeRate: 1600,
  rates: { USD: 1, NGN: 1600 },
  factor: getLocationFactor("NG"),
};

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCountryCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : "";
}

function normalizeCurrencyCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "";
}

function normalizeRates(rawRates) {
  if (!rawRates || typeof rawRates !== "object") return {};

  return Object.fromEntries(
    Object.entries(rawRates)
      .map(([currency, value]) => [normalizeCurrencyCode(currency), toFiniteNumber(value, 0)])
      .filter(([currency, value]) => currency && value > 0)
  );
}

function resolveCountryName(countryCode) {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!normalizedCountryCode) return defaultContext.countryName;

  try {
    if (typeof Intl?.DisplayNames === "function") {
      const displayNames = new Intl.DisplayNames([navigator.language || "en"], { type: "region" });
      return displayNames.of(normalizedCountryCode) || normalizedCountryCode;
    }
  } catch {
    // Fall back to the country code when localized names are unavailable.
  }

  return normalizedCountryCode;
}

function resolveExchangeRate(currency, rates, fallbackExchangeRate = 1) {
  const normalizedCurrency = normalizeCurrencyCode(currency) || defaultContext.currency;
  const rateFromTable = toFiniteNumber(rates?.[normalizedCurrency], 0);
  if (rateFromTable > 0) return rateFromTable;
  if (normalizedCurrency === "USD") return 1;
  return Math.max(0.0001, toFiniteNumber(fallbackExchangeRate, 1));
}

function buildPricingContext({
  countryCode,
  countryName,
  currency,
  exchangeRate,
  rates,
}) {
  const normalizedCountryCode = normalizeCountryCode(countryCode) || defaultContext.countryCode;
  const resolvedCurrency = getCurrencyForCountry(
    normalizedCountryCode,
    normalizeCurrencyCode(currency) || defaultContext.currency
  );
  const normalizedRates = {
    USD: 1,
    ...normalizeRates(rates),
  };
  const resolvedExchangeRate = resolveExchangeRate(
    resolvedCurrency,
    normalizedRates,
    toFiniteNumber(
      exchangeRate,
      resolvedCurrency === "NGN" ? defaultContext.exchangeRate : 1
    )
  );

  return {
    countryCode: normalizedCountryCode,
    countryName: String(countryName || "").trim() || resolveCountryName(normalizedCountryCode),
    currency: resolvedCurrency,
    exchangeRate: resolvedExchangeRate,
    rates: {
      ...normalizedRates,
      [resolvedCurrency]: resolveExchangeRate(resolvedCurrency, normalizedRates, resolvedExchangeRate),
    },
    factor: getLocationFactor(normalizedCountryCode),
  };
}

function loadStoredPricingContext() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PRICING_CONTEXT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return buildPricingContext(parsed || {});
  } catch {
    return null;
  }
}

function persistPricingContext(pricingContext) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      PRICING_CONTEXT_STORAGE_KEY,
      JSON.stringify({
        countryCode: pricingContext.countryCode,
        countryName: pricingContext.countryName,
        currency: pricingContext.currency,
        exchangeRate: pricingContext.exchangeRate,
        rates: pricingContext.rates,
      })
    );
  } catch {
    // Ignore storage failures and keep the in-memory pricing context.
  }
}

export default function usePricingContext() {
  const [pricingContext, setPricingContext] = useState(() => loadStoredPricingContext() || defaultContext);

  useEffect(() => {
    let active = true;
    const cachedContext = loadStoredPricingContext();

    function localeFallback() {
      const locales = Array.isArray(navigator.languages) && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language || "en-US"];
      const localeWithRegion =
        locales.find((locale) => /[-_]/.test(String(locale || ""))) || locales[0] || "en-US";
      const countryCode = normalizeCountryCode(String(localeWithRegion).split(/[-_]/)[1]) || "NG";
      const currency = getCurrencyForCountry(countryCode, cachedContext?.currency || "NGN");
      return {
        countryCode,
        countryName: resolveCountryName(countryCode),
        currency,
      };
    }

    async function detectLocation() {
      // Primary source
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data?.country_code) {
            return {
              countryCode: String(data.country_code).toUpperCase(),
              countryName: data.country_name || String(data.country_code).toUpperCase(),
              currency: String(data.currency || "").toUpperCase() || null,
            };
          }
        }
      } catch {
        // Try next source
      }

      // Secondary source
      try {
        const response = await fetch("https://ipwho.is/");
        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.country_code) {
            return {
              countryCode: String(data.country_code).toUpperCase(),
              countryName: data.country || String(data.country_code).toUpperCase(),
              currency: String(data?.currency?.code || "").toUpperCase() || null,
            };
          }
        }
      } catch {
        // Fallback below
      }

      return localeFallback();
    }

    async function resolvePricingContext() {
      try {
        const detected = await detectLocation();
        const provisionalContext = buildPricingContext({
          countryCode: detected.countryCode || cachedContext?.countryCode || defaultContext.countryCode,
          countryName: detected.countryName || cachedContext?.countryName || defaultContext.countryName,
          currency: detected.currency || cachedContext?.currency || defaultContext.currency,
          exchangeRate:
            cachedContext?.currency ===
            getCurrencyForCountry(
              detected.countryCode || cachedContext?.countryCode || defaultContext.countryCode,
              detected.currency || cachedContext?.currency || defaultContext.currency
            )
              ? cachedContext?.exchangeRate
              : undefined,
          rates: cachedContext?.rates || defaultContext.rates,
        });

        if (!active) return;
        setPricingContext(provisionalContext);
        persistPricingContext(provisionalContext);

        try {
          const fxResponse = await fetch("https://open.er-api.com/v6/latest/USD");
          if (!fxResponse.ok) return;

          const fx = await fxResponse.json();
          const resolvedContext = buildPricingContext({
            countryCode: provisionalContext.countryCode,
            countryName: provisionalContext.countryName,
            currency: provisionalContext.currency,
            exchangeRate: fx?.rates?.[provisionalContext.currency],
            rates: fx?.rates,
          });

          if (!active) return;
          setPricingContext(resolvedContext);
          persistPricingContext(resolvedContext);
        } catch {
          // Keep the detected currency and cached rates when the exchange-rate service is unavailable.
        }
      } catch {
        const fallbackContext = buildPricingContext(cachedContext || defaultContext);
        if (!active) return;
        setPricingContext(fallbackContext);
        persistPricingContext(fallbackContext);
      }
    }

    resolvePricingContext();
    return () => {
      active = false;
    };
  }, []);

  return pricingContext;
}
