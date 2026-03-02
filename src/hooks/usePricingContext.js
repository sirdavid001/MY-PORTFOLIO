import { useEffect, useState } from "react";
import { getCurrencyForCountry, getLocationFactor } from "../lib/pricing";

const defaultContext = {
  countryCode: "US",
  countryName: "United States",
  currency: "USD",
  exchangeRate: 1,
  rates: { USD: 1 },
  factor: 1,
};

export default function usePricingContext() {
  const [pricingContext, setPricingContext] = useState(defaultContext);

  useEffect(() => {
    let active = true;

    function localeFallback() {
      const locale = navigator.language || "en-US";
      const countryCode = locale.includes("-") ? locale.split("-")[1]?.toUpperCase() : "US";
      const currency = getCurrencyForCountry(countryCode, "USD");
      return {
        countryCode: countryCode || "US",
        countryName: countryCode || "United States",
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
        const countryCode = detected.countryCode || "US";
        const countryName = detected.countryName || "United States";
        const currency = getCurrencyForCountry(countryCode, detected.currency || "USD");
        const factor = getLocationFactor(countryCode);

        let rates = { USD: 1 };
        let exchangeRate = 1;

        const fxResponse = await fetch("https://open.er-api.com/v6/latest/USD");
        if (fxResponse.ok) {
          const fx = await fxResponse.json();
          rates = fx?.rates || { USD: 1 };
          exchangeRate = rates[currency] || 1;
        }

        if (!active) return;
        setPricingContext({
          countryCode,
          countryName,
          currency,
          exchangeRate,
          rates,
          factor,
        });
      } catch {
        if (!active) return;
        setPricingContext(defaultContext);
      }
    }

    resolvePricingContext();
    return () => {
      active = false;
    };
  }, []);

  return pricingContext;
}
