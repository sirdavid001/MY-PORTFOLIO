import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Gadgets from "./pages/Gadgets";

const BUSINESS_SUBDOMAINS = new Set(["shop", "store", "gadgets"]);

export default function App() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const subdomain = hostname.split(".")[0]?.toLowerCase();
  const isBusinessSubdomain = BUSINESS_SUBDOMAINS.has(subdomain);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
        <Routes>
          {isBusinessSubdomain ? (
            <>
              <Route path="/" element={<Gadgets />} />
              <Route path="*" element={<Gadgets />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gadgets" element={<Gadgets />} />
            </>
          )}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
