import { requireAdminUser } from "../../server/_lib/admin-auth.js";
import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";

const METHODS = "POST, OPTIONS";
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function sanitizeFileName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function fileExtensionForMime(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function decodeImagePayload(payload) {
  const rawMimeType = String(payload?.mimeType || "").trim().toLowerCase();
  const rawBase64Input = String(payload?.base64Data || payload?.dataUrl || "").trim();

  if (!rawBase64Input) {
    return { error: "Image file payload is required." };
  }

  const dataUrlMatch = /^data:([^;,]+);base64,(.+)$/i.exec(rawBase64Input);
  const mimeType = (dataUrlMatch?.[1] || rawMimeType).trim().toLowerCase();
  const base64Part = dataUrlMatch?.[2] || rawBase64Input;

  if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
    return { error: "Only JPG, PNG, WEBP, GIF, or AVIF image uploads are allowed." };
  }

  const sanitizedBase64 = base64Part.replace(/\s+/g, "");
  let buffer;
  try {
    buffer = Buffer.from(sanitizedBase64, "base64");
  } catch {
    return { error: "Invalid image encoding." };
  }

  if (!buffer || buffer.length === 0) {
    return { error: "Invalid image data." };
  }

  return {
    mimeType,
    buffer,
  };
}

function toStoragePath(fileName, mimeType) {
  const cleanedName = sanitizeFileName(fileName);
  const ext = fileExtensionForMime(mimeType);
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const baseName = cleanedName || "product-image";
  const yearMonth = new Date().toISOString().slice(0, 7);
  return `products/${yearMonth}/${baseName}-${timestamp}-${random}.${ext}`;
}

function encodeStoragePath(path) {
  return String(path)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const uploadRateLimit = applyRateLimit(res, {
    key: `admin:upload:${clientIp}`,
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });
  if (!uploadRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many upload requests. Try again later." });
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." });
  }

  const auth = await requireAdminUser(req);
  if (!auth.ok) {
    return json(res, auth.status || 401, { ok: false, error: auth.error });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = String(process.env.SUPABASE_STORAGE_BUCKET || "product-images").trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." });
  }

  if (!bucket) {
    return json(res, 500, { ok: false, error: "SUPABASE_STORAGE_BUCKET is not configured." });
  }

  try {
    const payload = await readJsonBody(req);
    const parsed = decodeImagePayload(payload);
    if (parsed.error) {
      return json(res, 400, { ok: false, error: parsed.error });
    }

    const maxUploadBytes = Number(process.env.SUPABASE_IMAGE_MAX_BYTES || DEFAULT_MAX_UPLOAD_BYTES);
    if (Number.isFinite(maxUploadBytes) && parsed.buffer.length > maxUploadBytes) {
      return json(res, 413, {
        ok: false,
        error: `Image too large. Max upload size is ${Math.round(maxUploadBytes / (1024 * 1024))}MB.`,
      });
    }

    const storagePath = toStoragePath(payload?.fileName, parsed.mimeType);
    const encodedPath = encodeStoragePath(storagePath);
    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": parsed.mimeType,
        "x-upsert": "true",
      },
      body: parsed.buffer,
    });

    const uploadText = await uploadResponse.text();
    if (!uploadResponse.ok) {
      let message = uploadText || "Upload failed.";
      try {
        const parsedError = JSON.parse(uploadText);
        message = parsedError?.message || parsedError?.error || message;
      } catch {
        // Keep text fallback.
      }

      if (message.toLowerCase().includes("bucket") && message.toLowerCase().includes("not")) {
        message = `Storage bucket "${bucket}" not found. Create a public Supabase Storage bucket with this name.`;
      }

      return json(res, 502, { ok: false, error: message });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;

    return json(res, 200, {
      ok: true,
      bucket,
      path: storagePath,
      url: publicUrl,
      contentType: parsed.mimeType,
      size: parsed.buffer.length,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected upload error." });
  }
}
