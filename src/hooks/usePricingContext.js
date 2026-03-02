import { useEffect, useState } from "react";
import { getLocationFactor } from "../lib/pricing";

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

    async function resolvePricingContext() {
      try {
        const geoResponse = await fetch("https://ipapi.co/json/");
        if (!geoResponse.ok) throw new Error("geo lookup failed");
        const geo = await geoResponse.json();

        const countryCode = (geo.country_code || "US").toUpperCase();
        const countryName = geo.country_name || "United States";
        const currency = (geo.currency || "USD").toUpperCase();
        const factor = getLocationFactor(countryCode);

        let rates = { USD: 1 };
        let exchangeRate = currency === "USD" ? 1 : 1;

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
