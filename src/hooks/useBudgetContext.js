import { useEffect, useState } from "react";
import { getCurrencyForCountry, getLocationFactor } from "../../shared/budgeting.js";
import { normalizeCountryCode, normalizeCurrencyCode, normalizeLocationPayload, resolveCountryName } from "../../shared/location.js";

const BUDGET_CONTEXT_STORAGE_KEY = "sd_budget_context";
const LEGACY_PRICING_CONTEXT_STORAGE_KEY = "sd_pricing_context";

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

function normalizeRates(rawRates) {
  if (!rawRates || typeof rawRates !== "object") return {};

  return Object.fromEntries(
    Object.entries(rawRates)
      .map(([currency, value]) => [normalizeCurrencyCode(currency), toFiniteNumber(value, 0)])
      .filter(([currency, value]) => currency && value > 0)
  );
}

function resolveExchangeRate(currency, rates, fallbackExchangeRate = 1) {
  const normalizedCurrency = normalizeCurrencyCode(currency) || defaultContext.currency;
  const rateFromTable = toFiniteNumber(rates?.[normalizedCurrency], 0);
  if (rateFromTable > 0) return rateFromTable;
  if (normalizedCurrency === "USD") return 1;
  return Math.max(0.0001, toFiniteNumber(fallbackExchangeRate, 1));
}

function buildBudgetContext({
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

function loadStoredBudgetContext() {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.localStorage.getItem(BUDGET_CONTEXT_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_PRICING_CONTEXT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return buildBudgetContext(parsed || {});
  } catch {
    return null;
  }
}

function persistBudgetContext(budgetContext) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      BUDGET_CONTEXT_STORAGE_KEY,
      JSON.stringify({
        countryCode: budgetContext.countryCode,
        countryName: budgetContext.countryName,
        currency: budgetContext.currency,
        exchangeRate: budgetContext.exchangeRate,
        rates: budgetContext.rates,
      })
    );
    window.localStorage.removeItem(LEGACY_PRICING_CONTEXT_STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep the in-memory budget context.
  }
}

export default function useBudgetContext() {
  const [budgetContext, setBudgetContext] = useState(() => loadStoredBudgetContext() || defaultContext);

  useEffect(() => {
    let active = true;
    const cachedContext = loadStoredBudgetContext();

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
      // Same-origin server endpoint sees platform geo headers and avoids client-side IP lookup failures.
      try {
        const response = await fetch("/api/location");
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeLocationPayload(data, navigator.language || "en");
          if (data?.ok && normalized) {
            return normalized;
          }
        }
      } catch {
        // Fall through to client-side providers.
      }

      // Primary source
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeLocationPayload(
            {
              countryCode: data?.country_code,
              countryName: data?.country_name,
              currency: data?.currency,
              source: "ipapi",
            },
            navigator.language || "en"
          );
          if (normalized) {
            return normalized;
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
          const normalized = normalizeLocationPayload(
            {
              countryCode: data?.country_code,
              countryName: data?.country,
              currency: data?.currency?.code,
              source: "ipwho",
            },
            navigator.language || "en"
          );
          if (data?.success && normalized) {
            return normalized;
          }
        }
      } catch {
        // Fallback below
      }

      return localeFallback();
    }

    async function resolveBudgetContext() {
      try {
        const detected = await detectLocation();
        const provisionalContext = buildBudgetContext({
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
        setBudgetContext(provisionalContext);
        persistBudgetContext(provisionalContext);

        try {
          const fxResponse = await fetch("https://open.er-api.com/v6/latest/USD");
          if (!fxResponse.ok) return;

          const fx = await fxResponse.json();
          const resolvedContext = buildBudgetContext({
            countryCode: provisionalContext.countryCode,
            countryName: provisionalContext.countryName,
            currency: provisionalContext.currency,
            exchangeRate: fx?.rates?.[provisionalContext.currency],
            rates: fx?.rates,
          });

          if (!active) return;
          setBudgetContext(resolvedContext);
          persistBudgetContext(resolvedContext);
        } catch {
          // Keep the detected currency and cached rates when the exchange-rate service is unavailable.
        }
      } catch {
        const fallbackContext = buildBudgetContext(cachedContext || defaultContext);
        if (!active) return;
        setBudgetContext(fallbackContext);
        persistBudgetContext(fallbackContext);
      }
    }

    resolveBudgetContext();
    return () => {
      active = false;
    };
  }, []);

  return budgetContext;
}
