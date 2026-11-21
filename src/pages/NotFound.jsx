import { Link } from "react-router-dom";
import { NOT_FOUND_ROUTE } from "../../shared/seo.js";
import useSEO from "../hooks/useSEO";

export default function NotFound() {
  useSEO(NOT_FOUND_ROUTE);

  return (
    <section className="max-w-xl py-16 sm:py-24">
      <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">Page not found</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The page you&apos;re looking for may have moved or been removed.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to homepage
      </Link>
    </section>
  );
}
