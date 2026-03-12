import { Suspense, lazy } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
const ShopApp = lazy(() => import("./shop/ShopApp"));

const BUSINESS_SUBDOMAINS = new Set(["shop", "store", "gadgets", "sirdavidshop"]);
const SECURE_ADMIN_PATH = "/secure-admin-portal-xyz";
const SHOP_PATHS = new Set([
  "/shop",
  "/cart",
  "/track-order",
  "/terms-and-conditions",
  "/refund-policy",
  "/privacy-policy",
  "/faqs",
  "/legal",
  "/shipping-policy",
  "/admin-setup-first-time",
  SECURE_ADMIN_PATH,
]);

function AppFallback({ compact = false }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "min-h-[40vh]" : "min-h-screen"} bg-[#f3f4f6]`}>
      <div className="text-sm text-slate-500">Loading...</div>
    </div>
  );
}

export default function App() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const hostLabels = hostname
    .split(".")
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean);
  const isBusinessSubdomain = hostLabels.some((label) => BUSINESS_SUBDOMAINS.has(label));
  const isShopPath =
    normalizedPathname.startsWith("/product/") ||
    SHOP_PATHS.has(normalizedPathname);

  if (isBusinessSubdomain || isShopPath) {
    return (
      <>
        <Suspense fallback={<AppFallback />}>
          <ShopApp />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </>
    );
  }

  return (
    <BrowserRouter>
      <>
        <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
            <Suspense fallback={<AppFallback compact />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" richColors />
        <Analytics />
        <SpeedInsights />
      </>
    </BrowserRouter>
  );
}
