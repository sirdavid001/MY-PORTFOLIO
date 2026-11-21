export default function Button({ variant = "primary", className = "", children, ...rest }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold min-h-11 transition-colors disabled:opacity-50";
  const variants = {
    primary:
      "bg-primary px-8 py-4 text-base text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
    outline:
      "border border-primary px-8 py-4 text-base text-primary hover:bg-primary/5",
    ghost:
      "border border-border bg-background/50 px-8 py-4 text-base text-foreground hover:bg-accent",
  };

  return (
    <button className={`${base} ${variants[variant] ?? variants.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}
