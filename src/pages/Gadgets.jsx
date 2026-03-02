import { Link } from "react-router-dom";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney } from "../lib/pricing";

const inventory = [
  {
    name: "iPhone 13",
    condition: "Used - Excellent",
    basePriceUsd: 520,
    details: "128GB, battery health 89%, unlocked and tested.",
  },
  {
    name: "Samsung Galaxy S24",
    condition: "New",
    basePriceUsd: 760,
    details: "Factory sealed, dual SIM, one-year manufacturer warranty.",
  },
  {
    name: "Dell XPS 13",
    condition: "Used - Very Good",
    basePriceUsd: 680,
    details: "Core i7, 16GB RAM, 512GB SSD, fresh OS install included.",
  },
  {
    name: "AirPods Pro (2nd Gen)",
    condition: "New",
    basePriceUsd: 210,
    details: "Original package with active noise cancellation support.",
  },
  {
    name: "PlayStation 5",
    condition: "Used - Excellent",
    basePriceUsd: 440,
    details: "Comes with one controller, HDMI cable, and power cable.",
  },
  {
    name: "Apple Watch Series 9",
    condition: "New",
    basePriceUsd: 350,
    details: "45mm, GPS model, includes original charger and strap.",
  },
];

export default function Gadgets() {
  const pricingContext = usePricingContext();

  const displayPrice = (usd) => {
    const localized = usd * pricingContext.exchangeRate * pricingContext.factor;
    return formatMoney(localized, pricingContext.currency);
  };

  return (
    <div className="space-y-0 pb-8">
      <section className="rounded-3xl bg-white p-8 shadow-[0_18px_45px_rgba(15,23,42,0.1)] sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Sirdavid Gadgets</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          New and Used Gadgets You Can Trust
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Reliable phones, laptops, accessories, and consoles with clear condition notes and honest pricing.
          This is your dedicated business storefront under the Sirdavid brand.
        </p>
        <p className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Pricing adjusted for {pricingContext.countryName} ({pricingContext.currency})
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="mailto:itssirdavid@gmail.com?subject=Gadget%20Order%20Inquiry"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-6 sm:text-base"
          >
            Order via Email
          </a>
          <Link
            to="/contact"
            className="rounded-xl border border-slate-400 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:px-6 sm:text-base"
          >
            Contact Me
          </Link>
        </div>
      </section>

      <section className="mt-10 border-t border-slate-200 pt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-3xl font-bold text-slate-900">Current Inventory</h2>
          <span className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600">
            {inventory.length} items listed
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inventory.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-2xl font-semibold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold text-blue-700">{item.condition}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.details}</p>
              <p className="mt-5 text-lg font-bold text-slate-900">{displayPrice(item.basePriceUsd)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
