import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(66,165,255,0.28),transparent_36%),radial-gradient(circle_at_88%_0%,rgba(94,242,198,0.2),transparent_28%),linear-gradient(180deg,#060912_0%,#090f1d_100%)]" />
      <div className="pointer-events-none fixed -left-16 top-20 -z-10 h-64 w-64 animate-floaty rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-16 bottom-20 -z-10 h-64 w-64 animate-floaty rounded-full bg-emerald-400/10 blur-3xl" />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
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
