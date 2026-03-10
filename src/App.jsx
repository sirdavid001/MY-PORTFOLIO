import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import ShopApp from "./shop/ShopApp";
import { Toaster } from "sonner";

const BUSINESS_SUBDOMAINS = new Set(["shop", "store", "gadgets", "sirdavidshop"]);
const SECURE_ADMIN_PATH = "/secure-admin-portal-xyz";
const SHOP_PATHS = new Set([
  "/shop",
  `/shop${SECURE_ADMIN_PATH}`,
  "/cart",
  "/track-order",
  "/terms-and-conditions",
  "/refund-policy",
  "/privacy-policy",
  "/faqs",
  "/shipping-policy",
  "/admin-setup-first-time",
  SECURE_ADMIN_PATH,
]);

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
        <Routes>
          <Route path="*" element={<ShopApp />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}
