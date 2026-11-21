import { useEffect, useState } from "react";
import { normalizeCountryCode, normalizeCurrencyCode } from "../../shared/location.js";

const STORAGE_KEY = "sd_budget_context";
const LEGACY_KEY = "sd_pricing_context";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CONTEXT = { countryCode: "NG", rates: { USD: 1 } };

function normalizeRates(rawRates) {
  const rates = Object.entries(rawRates ?? {})
    .map(([currency, value]) => [normalizeCurrencyCode(currency), Number(value)])
    .filter(([currency, value]) => currency && Number.isFinite(value) && value > 0);
  return { ...Object.fromEntries(rates), USD: 1 };
}

function readCachedContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw);
    const rates = normalizeRates(stored.rates);
    if (stored.exchangeRate === 1 && stored.currency !== "USD" && rates[stored.currency] === 1) {
      delete rates[stored.currency];
    }

    return {
      countryCode: normalizeCountryCode(stored.countryCode) || DEFAULT_CONTEXT.countryCode,
      rates,
      cachedAt: "exchangeRate" in stored ? 0 : Number(stored.cachedAt) || 0,
    };
  } catch {
    return null;
  }
}

async function readJson(url, signal) {
  const response = await fetch(url, { signal });
  return response.ok ? response.json() : null;
}

async function detectCountry(signal) {
  try {
    const location = await readJson("/api/location", signal);
    const country = location?.ok && normalizeCountryCode(location.countryCode);
    if (country) return country;
  } catch {
    // Use the browser's locale when the server cannot determine the country.
  }

  const locale = navigator.languages?.find((value) => value.includes("-")) || navigator.language;
  return normalizeCountryCode(locale?.match(/-([a-z]{2})(?:-|$)/i)?.[1]) || DEFAULT_CONTEXT.countryCode;
}

async function fetchRates(signal) {
  try {
    const data = await readJson("https://open.er-api.com/v6/latest/USD", signal);
    return data?.rates ? normalizeRates(data.rates) : null;
  } catch {
    return null;
  }
}

export default function useBudgetContext() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);

  useEffect(() => {
    const controller = new AbortController();
    const cached = readCachedContext();
    if (cached) setContext(cached);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) return;

    let active = true;
    const timeout = setTimeout(() => controller.abort(), 5000);
    const { signal } = controller;
    const countryRequest = detectCountry(signal).then((countryCode) => {
      if (active) setContext((prev) => ({ ...prev, countryCode }));
      return countryCode;
    });
    const rateRequest = fetchRates(signal).then((rates) => {
      if (rates && active) setContext((prev) => ({ ...prev, rates }));
      return rates;
    });

    Promise.all([countryRequest, rateRequest]).then(([countryCode, rates]) => {
      clearTimeout(timeout);
      if (!rates || !active) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ countryCode, rates, cachedAt: Date.now() }));
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        // The in-memory context remains available when storage is disabled.
      }
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return context;
}
