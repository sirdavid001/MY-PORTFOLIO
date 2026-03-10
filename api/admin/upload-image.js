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
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-admin-token");
}

function json(res, status, data) {
  setCors(res);
  res.status(status).json(data);
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
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

  const raw = (await readRawBody(req)).toString("utf8");
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

function normalizeBucketName(value) {
  return String(value || "")
    .trim()
    .replace(/^["'`“”‘’]+|["'`“”‘’]+$/g, "")
    .trim();
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

function parseMultipartPayload(req, rawBody) {
  const contentType = String(req.headers["content-type"] || "");
  const boundaryMatch = /boundary=([^;]+)/i.exec(contentType);
  if (!boundaryMatch) {
    return { error: "Missing multipart boundary." };
  }

  const boundary = boundaryMatch[1].trim().replace(/^["']|["']$/g, "");
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const segments = [];
  let startIndex = 0;

  while (startIndex < rawBody.length) {
    const boundaryIndex = rawBody.indexOf(boundaryBuffer, startIndex);
    if (boundaryIndex < 0) break;
    const nextBoundaryIndex = rawBody.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
    if (nextBoundaryIndex < 0) break;
    segments.push(rawBody.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex));
    startIndex = nextBoundaryIndex;
  }

  for (const segment of segments) {
    if (!segment.length) continue;
    const cleaned = segment.subarray(segment[0] === 13 && segment[1] === 10 ? 2 : 0);
    const headerEnd = cleaned.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd < 0) continue;

    const headerText = cleaned.subarray(0, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;
    let bodyEnd = cleaned.length;
    if (cleaned[bodyEnd - 2] === 13 && cleaned[bodyEnd - 1] === 10) {
      bodyEnd -= 2;
    }
    if (cleaned[bodyEnd - 2] === 45 && cleaned[bodyEnd - 1] === 45) {
      bodyEnd -= 2;
    }

    const contentDisposition = /content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i.exec(headerText);
    if (!contentDisposition) continue;

    const fieldName = contentDisposition[1];
    const fileName = contentDisposition[2];
    if (fieldName !== "file" || !fileName) continue;

    const mimeTypeMatch = /content-type:\s*([^\r\n]+)/i.exec(headerText);
    const mimeType = String(mimeTypeMatch?.[1] || "").trim().toLowerCase();
    const buffer = cleaned.subarray(bodyStart, bodyEnd);

    if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return { error: "Only JPG, PNG, WEBP, GIF, or AVIF image uploads are allowed." };
    }

    if (!buffer.length) {
      return { error: "Invalid image data." };
    }

    return {
      mimeType,
      buffer,
      fileName,
    };
  }

  return { error: "No file provided." };
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

async function ensureStorageBucket({ supabaseUrl, serviceRoleKey, bucket }) {
  const encodedBucket = encodeURIComponent(bucket);
  const readResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/${encodedBucket}`, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (readResponse.ok) {
    return { ok: true, created: false };
  }

  if (readResponse.status !== 404) {
    const body = await readResponse.text().catch(() => "");
    return {
      ok: false,
      error: body || `Unable to validate storage bucket "${bucket}".`,
    };
  }

  const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
    }),
  });

  if (createResponse.ok) {
    return { ok: true, created: true };
  }

  const createText = await createResponse.text().catch(() => "");
  return {
    ok: false,
    error: createText || `Unable to create storage bucket "${bucket}".`,
  };
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
  const bucketFromEnv = normalizeBucketName(process.env.SUPABASE_STORAGE_BUCKET);
  const bucket = bucketFromEnv || "product-images";

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." });
  }

  if (!bucket) {
    return json(res, 500, { ok: false, error: "SUPABASE_STORAGE_BUCKET is not configured." });
  }

  try {
    const ensuredBucket = await ensureStorageBucket({ supabaseUrl, serviceRoleKey, bucket });
    if (!ensuredBucket.ok) {
      return json(res, 502, {
        ok: false,
        error: `Storage bucket "${bucket}" is not available. ${ensuredBucket.error}`,
      });
    }

    let parsed;
    let sourceFileName = "";
    const contentType = String(req.headers["content-type"] || "").toLowerCase();

    if (contentType.includes("multipart/form-data")) {
      const rawBody = await readRawBody(req);
      parsed = parseMultipartPayload(req, rawBody);
      sourceFileName = parsed.fileName || "";
    } else {
      const payload = await readJsonBody(req);
      parsed = decodeImagePayload(payload);
      sourceFileName = String(payload?.fileName || "").trim();
    }

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

    const storagePath = toStoragePath(sourceFileName, parsed.mimeType);
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
        message = `Storage bucket "${bucket}" not found. Create a public Supabase Storage bucket with this exact name.`;
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
