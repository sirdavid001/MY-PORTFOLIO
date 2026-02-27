import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      isActive
        ? "bg-emerald-300/20 text-emerald-200"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#060912]/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="font-display text-xl font-bold tracking-wide text-white">
          CD
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-lg">☰</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 pb-3 pt-2 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
