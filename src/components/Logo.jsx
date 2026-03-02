import { NavLink } from "react-router-dom";

export default function Logo({ to = "/", compact = false }) {
  return (
    <NavLink to={to} className="inline-flex items-center gap-3">
      <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-sm font-extrabold text-white shadow-sm">
        <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 opacity-80" />
        <span className="relative">SD</span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
          Sirdavid
        </span>
      )}
    </NavLink>
  );
}
