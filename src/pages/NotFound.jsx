import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"
    >
      <p className="text-8xl font-extrabold text-primary">404</p>
      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-sm text-lg text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-10 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
      >
        Back to Home
      </Link>
    </motion.div>
  );
}
