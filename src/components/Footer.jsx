import Logo from "./Logo";
import { Link } from "react-router-dom";
import { CV_PROFILE } from "../../shared/cv-profile.js";

export default function Footer() {
  return (
    <footer className="bg-[#f3f4f6] pb-8 pt-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-t border-slate-200 pt-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-slate-600">
              Computer Science graduate building practical digital experiences with strong attention to clarity,
              reliability, and execution.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-slate-900">Quick Links</h4>
            <div className="mt-3 grid gap-2 text-slate-600">
              <Link to="/" className="hover:text-slate-900">Home</Link>
              <Link to="/projects" className="hover:text-slate-900">Projects</Link>
              <Link to="/shop" className="hover:text-slate-900">Shop</Link>
              <Link to="/contact" className="hover:text-slate-900">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-slate-900">Connect</h4>
            <div className="mt-3 flex items-center gap-2">
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href={CV_PROFILE.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href={CV_PROFILE.portfolioUrl} target="_blank" rel="noreferrer">Portfolio</a>
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href={`mailto:${CV_PROFILE.email}`}>Email</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {CV_PROFILE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
