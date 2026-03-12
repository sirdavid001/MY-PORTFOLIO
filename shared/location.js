import { getCurrencyForCountry } from "../src/lib/budgeting.js";

const INVALID_COUNTRY_CODES = new Set(["XX", "ZZ", "T1"]);

export function normalizeCountryCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return "";
  return INVALID_COUNTRY_CODES.has(normalized) ? "" : normalized;
}

export function normalizeCurrencyCode(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "";
}

export function resolveCountryName(countryCode, locale = "en") {
  const normalizedCountryCode = normalizeCountryCode(countryCode);
  if (!normalizedCountryCode) return "";

  try {
    if (typeof Intl?.DisplayNames === "function") {
      const displayNames = new Intl.DisplayNames([locale || "en"], { type: "region" });
      return displayNames.of(normalizedCountryCode) || normalizedCountryCode;
    }
  } catch {
    // Fall back to the country code when localized names are unavailable.
  }

  return normalizedCountryCode;
}

export function normalizeLocationPayload(location, locale = "en") {
  const countryCode = normalizeCountryCode(location?.countryCode);
  if (!countryCode) return null;

  const currency = normalizeCurrencyCode(location?.currency) || getCurrencyForCountry(countryCode, "") || null;

  return {
    countryCode,
    countryName: String(location?.countryName || "").trim() || resolveCountryName(countryCode, locale),
    currency,
    source: String(location?.source || "").trim() || "unknown",
  };
}

export function isProbablyPublicIp(rawIp) {
  const ip = String(rawIp || "").trim().toLowerCase();
  if (!ip || ip === "unknown" || ip === "localhost") return false;

  const normalizedIpv4 = ip.startsWith("::ffff:") ? ip.slice(7) : ip;

  if (normalizedIpv4 === "127.0.0.1" || normalizedIpv4 === "0.0.0.0") return false;
  if (normalizedIpv4.startsWith("10.") || normalizedIpv4.startsWith("192.168.") || normalizedIpv4.startsWith("169.254.")) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(normalizedIpv4)) return false;

  if (normalizedIpv4 === "::1" || normalizedIpv4.startsWith("fc") || normalizedIpv4.startsWith("fd")) {
    return false;
  }
  if (normalizedIpv4.startsWith("fe80:")) return false;

  return true;
}
