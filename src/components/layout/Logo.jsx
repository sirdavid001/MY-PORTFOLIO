import { NavLink } from "react-router-dom";
import { CV_PROFILE } from "../../../shared/cv/profile.js";

export default function Logo({ to = "/", compact = false }) {
  return (
    <NavLink to={to} className="group inline-flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-foreground text-sm font-extrabold text-background shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
        <span className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-500 to-purple-500 opacity-90" />
        <span className="relative z-10 font-display">CD</span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground sm:text-2xl">
          {CV_PROFILE.displayName}
        </span>
      )}
    </NavLink>
  );
}
