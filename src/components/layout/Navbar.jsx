import { useEffect, useRef, useState } from "react";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

function navClass({ isActive }) {
  return `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  }`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const desktop = matchMedia("(min-width: 48rem)");
    function closeOnDesktop(event) {
      if (event.matches) setOpen(false);
    }
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function handleEscape(event) {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    setOpen(false);
    toggle.current?.focus();
  }

  return (
    <header onKeyDown={handleEscape} className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95">
      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex shrink-0 items-center gap-2">
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink end={link.to === "/"} key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-accent"
            aria-label="Dark mode"
            aria-pressed={theme === "dark"}
          >
            <FiMoon aria-hidden="true" className="h-4 w-4 dark:hidden" />
            <FiSun aria-hidden="true" className="hidden h-4 w-4 dark:block" />
          </button>

          <button
            ref={toggle}
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground md:hidden"
            aria-label="Toggle navigation"
            aria-controls="mobile-navigation"
            aria-expanded={open}
          >
            {open ? <FiX aria-hidden="true" className="h-5 w-5" /> : <FiMenu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav id="mobile-navigation" aria-label="Mobile" hidden={!open} className="border-t border-border px-4 py-2 md:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-1">
          {links.map((link) => (
            <NavLink
              end={link.to === "/"}
              key={link.to}
              to={link.to}
              className={navClass}
              onClick={() => {
                setOpen(false);
                if (link.to === pathname) toggle.current?.focus();
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
