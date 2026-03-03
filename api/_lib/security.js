import { timingSafeEqual } from "node:crypto";

function normalizeIp(rawIp) {
  if (!rawIp) return "unknown";

  const ip = String(rawIp).trim();
  if (!ip) return "unknown";

  // Handle forwarded list values.
  const first = ip.split(",")[0].trim();
  if (!first) return "unknown";

  // Strip IPv4 port if present.
  const noPort = first.includes(":") && first.includes(".") ? first.split(":")[0] : first;

  if (noPort.startsWith("::ffff:")) {
    return noPort.slice(7);
  }

  return noPort;
}

export function getClientIp(req) {
  return normalizeIp(
    req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress
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
