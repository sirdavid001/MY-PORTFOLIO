import { Suspense, lazy } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));
function AppFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#f3f4f6]">
      <div className="text-sm text-slate-500">Loading...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <>
        <div className="min-h-screen bg-[#f3f4f6] text-slate-900">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
            <Suspense fallback={<AppFallback />}>
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
        <Analytics />
        <SpeedInsights />
      </>
    </BrowserRouter>
  );
}
