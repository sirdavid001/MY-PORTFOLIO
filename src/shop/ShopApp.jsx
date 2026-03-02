import { useMemo, useState } from "react";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney } from "../lib/pricing";
import { products } from "./products";

const categories = ["All", "Phones", "Laptops", "Accessories", "Gaming", "Wearables"];

export default function ShopApp() {
  const pricingContext = usePricingContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const displayPrice = (basePriceUsd) => {
    const localized = basePriceUsd * pricingContext.exchangeRate * pricingContext.factor;
    return formatMoney(localized, pricingContext.currency);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-slate-900">Sirdavid Gadgets</p>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Store</p>
          </div>
          <div className="inline-flex items-center gap-3">
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:inline-flex">
              {pricingContext.countryName} ({pricingContext.currency})
            </span>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Cart ({cartCount})
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trusted Devices</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Buy New and Used Gadgets With Clear Pricing
          </h1>
          <p className="mt-4 max-w-3xl text-slate-200 sm:text-lg">
            Every item is verified, condition-checked, and listed with market-aware pricing for your location.
          </p>
          <a
            href="mailto:itssirdavid@gmail.com?subject=Store%20Order%20Request"
            className="mt-7 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Start an Order
          </a>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold text-slate-900">{product.name}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {product.category}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-blue-700">{product.condition}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.details}</p>
              <p className="mt-4 text-2xl font-bold text-slate-900">{displayPrice(product.basePriceUsd)}</p>
              <button
                type="button"
                onClick={() => setCartCount((count) => count + 1)}
                className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Add to Cart
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
