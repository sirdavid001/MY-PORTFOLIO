import { useEffect, useState } from "react";
import { getCurrencyForCountry, getLocationFactor } from "../lib/pricing";

const defaultContext = {
  countryCode: "NG",
  countryName: "Nigeria",
  currency: "NGN",
  exchangeRate: 1600,
  rates: { USD: 1, NGN: 1600 },
  factor: getLocationFactor("NG"),
};

export default function usePricingContext() {
  const [pricingContext, setPricingContext] = useState(defaultContext);

  useEffect(() => {
    let active = true;

    function localeFallback() {
      const locale = navigator.language || "en-US";
      const countryCode = locale.includes("-") ? locale.split("-")[1]?.toUpperCase() : "NG";
      const currency = getCurrencyForCountry(countryCode, "NGN");
      return {
        countryCode: countryCode || "NG",
        countryName: countryCode || "Nigeria",
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
        const countryCode = detected.countryCode || "NG";
        const countryName = detected.countryName || "Nigeria";
        const currency = getCurrencyForCountry(countryCode, detected.currency || "NGN");
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
