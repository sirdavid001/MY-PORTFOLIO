import { timingSafeEqual } from "node:crypto";

function normalizeIp(rawIp) {
  if (!rawIp) return "unknown";

  const ip = String(rawIp).trim();
  if (!ip) return "unknown";

  // Handle forwarded list values.
  const first = ip.split(",")[0].trim();
  if (!first) return "unknown";

  // Unwrap IPv4-mapped IPv6 before port stripping, which would otherwise reduce it to "".
  const unmapped = first.toLowerCase().startsWith("::ffff:") ? first.slice(7) : first;

  // Strip IPv4 port if present.
  const noPort = unmapped.includes(":") && unmapped.includes(".") ? unmapped.split(":")[0] : unmapped;

  return noPort || "unknown";
}

// Vercel overwrites x-forwarded-for with the caller's address, so clients cannot forge it.
// Do not read headers Vercel passes through unchanged (such as cf-connecting-ip): a client
// could send a new value with each request and get a fresh rate-limit bucket every time.
export function getClientIp(req) {
  return normalizeIp(
    req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress
  );
}

export function safeCompare(secretA, secretB) {
  const a = Buffer.from(String(secretA || ""));
  const b = Buffer.from(String(secretB || ""));
  const len = Math.max(a.length, b.length, 1);

  const paddedA = Buffer.alloc(len);
  const paddedB = Buffer.alloc(len);
  a.copy(paddedA);
  b.copy(paddedB);

  const equal = timingSafeEqual(paddedA, paddedB);
  return equal && a.length === b.length;
}

export function isIpAllowed(ip, allowListRaw) {
  const allowList = String(allowListRaw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowList.length === 0) return true;

  return allowList.some((rule) => {
    if (rule.endsWith("*")) {
      return ip.startsWith(rule.slice(0, -1));
    }

    return ip === rule;
  });
}
