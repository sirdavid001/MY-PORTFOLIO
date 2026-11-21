import { Link } from "react-router-dom";
import { PUBLIC_PROFILE } from "../../../shared/profile.js";

export default function Logo() {
  return (
    <Link to="/" className="inline-flex min-h-11 min-w-0 items-center gap-2.5">
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-extrabold text-background">
        CD
      </span>
      <span className="font-display text-base font-bold tracking-tight text-foreground sm:text-xl">
        {PUBLIC_PROFILE.displayName}
      </span>
    </Link>
  );
}
