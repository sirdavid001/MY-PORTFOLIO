import { SiApple, SiDell, SiGoogle, SiHp, SiLenovo, SiOneplus, SiSamsung, SiSony, SiXiaomi } from "react-icons/si";

const BRAND_CONFIG = {
  apple: { label: "Apple", Icon: SiApple, iconClassName: "text-slate-900", badgeClassName: "border-slate-200 bg-slate-50 text-slate-700" },
  samsung: { label: "Samsung", Icon: SiSamsung, iconClassName: "text-[#1428A0]", badgeClassName: "border-blue-200 bg-blue-50 text-blue-900" },
  google: { label: "Google", Icon: SiGoogle, iconClassName: "text-[#4285F4]", badgeClassName: "border-slate-200 bg-white text-slate-700" },
  xiaomi: { label: "Xiaomi", Icon: SiXiaomi, iconClassName: "text-[#FF6900]", badgeClassName: "border-orange-200 bg-orange-50 text-orange-900" },
  oneplus: { label: "OnePlus", Icon: SiOneplus, iconClassName: "text-[#eb0029]", badgeClassName: "border-rose-200 bg-rose-50 text-rose-900" },
  sony: { label: "Sony", Icon: SiSony, iconClassName: "text-slate-900", badgeClassName: "border-slate-300 bg-slate-100 text-slate-800" },
  dell: { label: "Dell", Icon: SiDell, iconClassName: "text-[#0076ce]", badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-900" },
  lenovo: { label: "Lenovo", Icon: SiLenovo, iconClassName: "text-[#e2231a]", badgeClassName: "border-rose-200 bg-rose-50 text-rose-900" },
  hp: { label: "HP", Icon: SiHp, iconClassName: "text-[#0096d6]", badgeClassName: "border-sky-200 bg-sky-50 text-sky-900" },
  tecno: {
    label: "Tecno",
    logoUrl: "https://logo.clearbit.com/tecno-mobile.com",
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-900",
  },
  infinix: {
    label: "Infinix",
    logoUrl: "https://logo.clearbit.com/infinixmobility.com",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
};

function normalizeBrandKey(brand) {
  return String(brand || "").trim().toLowerCase();
}

function getBrandConfig(brand) {
  const key = normalizeBrandKey(brand);
  const configured = BRAND_CONFIG[key];
  if (configured) return configured;

  const fallbackLabel = String(brand || "").trim() || "Brand";
  return {
    label: fallbackLabel,
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

function getInitials(brand) {
  const normalized = String(brand || "").trim();
  if (!normalized) return "B";
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

export function BrandMark({ brand, className = "" }) {
  const config = getBrandConfig(brand);

  if (config.logoUrl) {
    return (
      <img
        src={config.logoUrl}
        alt={`${config.label} logo`}
        loading="lazy"
        className={`h-full w-full rounded-full object-contain ${className}`}
      />
    );
  }

  if (config.Icon) {
    const Icon = config.Icon;
    return <Icon className={`${config.iconClassName || "text-slate-700"} ${className}`} />;
  }

  return <span className={`text-[10px] font-bold text-slate-700 ${className}`}>{getInitials(config.label)}</span>;
}

export function BrandPill({ brand, className = "", size = "sm" }) {
  const config = getBrandConfig(brand);
  const markSizeClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const textSizeClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-semibold ${textSizeClass} ${config.badgeClassName} ${className}`}
    >
      <span className={`inline-flex items-center justify-center rounded-full bg-white/80 ${markSizeClass}`}>
        <BrandMark brand={config.label} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </span>
      <span>{config.label}</span>
    </span>
  );
}

