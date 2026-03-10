import { buildCvPdf } from "../../shared/cv-pdf.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

const buckets = globalThis.__cfCvDownloadRateLimitBuckets || new Map();
globalThis.__cfCvDownloadRateLimitBuckets = buckets;

function applyRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const current = buckets.get(key);
  let bucket = current;
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket.count <= limit;
}

function getClientIp(request) {
  const ip =
    request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  return String(ip || "").split(",")[0].trim() || "unknown";
}

function normalizeFormat(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "word" || normalized === "doc") return "word";
  return "pdf";
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const { request } = context;
  const allowed = applyRateLimit(`cv-download:${getClientIp(request)}`, 40, 10 * 60 * 1000);
  if (!allowed) {
    return json({ ok: false, error: "Too many CV downloads. Try again later." }, 429);
  }

  if (request.method !== "GET") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  const format = normalizeFormat(new URL(request.url).searchParams.get("format"));
  if (format === "word") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/chineduDavidNwadialoCv.doc",
      },
    });
  }

  const pdf = buildCvPdf();
  return new Response(pdf, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="chineduDavidNwadialoCv.pdf"',
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=3600",
      "content-length": String(pdf.byteLength),
    },
  });
}
