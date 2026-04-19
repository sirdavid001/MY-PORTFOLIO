export default function Button({ variant = "primary", className = "", children, ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50";
  const variants = {
    primary:
      "bg-primary px-8 py-4 text-base text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30",
    outline:
      "border border-primary px-8 py-4 text-base text-primary hover:bg-primary/5",
    ghost:
      "border border-border bg-background/50 px-8 py-4 text-base text-foreground hover:-translate-y-1 hover:bg-accent",
  };

  return (
    <button className={`${base} ${variants[variant] ?? variants.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}
