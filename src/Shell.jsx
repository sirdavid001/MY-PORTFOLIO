import { useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./hooks/useTheme";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function Shell() {
  const main = useRef(null);
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  const navigationType = useNavigationType();

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const target = (hash && document.getElementById(hash.slice(1))) || main.current;
    target?.focus({ preventScroll: true });
    if (navigationType === "POP") return;
    if (target === main.current) window.scrollTo(0, 0);
    else target?.scrollIntoView();
  }, [hash, navigationType, pathname]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <a href="#main-content" className="sr-only z-[60] rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-3">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" ref={main} tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-0 pt-24 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </div>
    </ThemeProvider>
  );
}
