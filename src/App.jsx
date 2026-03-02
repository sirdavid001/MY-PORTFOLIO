import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import ShopApp from "./shop/ShopApp";
import AdminApp from "./shop/AdminApp";

const BUSINESS_SUBDOMAINS = new Set(["shop", "store", "gadgets", "sirdavidshop"]);

export default function App() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const subdomain = hostname.split(".")[0]?.toLowerCase();
  const isBusinessSubdomain = BUSINESS_SUBDOMAINS.has(subdomain);

  if (isBusinessSubdomain) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<ShopApp />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
