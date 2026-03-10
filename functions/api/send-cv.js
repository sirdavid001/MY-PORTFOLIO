import { CV_PROFILE } from "../../shared/cv-profile.js";
import { buildCvPdf } from "../../shared/cv-pdf.js";
import { buildCvWordDocument } from "../../shared/cv-word.js";

const CV_OPTIONS = {
  pdf: {
    value: "pdf",
    label: "PDF",
    href: "/api/cv-download?format=pdf",
    fileName: "chineduDavidNwadialoCv.pdf",
    note: "The requested CV is attached as a PDF.",
  },
  word: {
    value: "word",
    label: "Word",
    href: "/api/cv-download?format=word",
    fileName: "chineduDavidNwadialoCv.doc",
    note: "The requested CV is attached as a Word-compatible document.",
  },
};

function json(data, status = 200, methods = "POST, OPTIONS") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": methods,
      "access-control-allow-headers": "content-type",
    },
  });
}

const buckets = globalThis.__cfSendCvRateLimitBuckets || new Map();
globalThis.__cfSendCvRateLimitBuckets = buckets;

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
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip");
  return String(ip || "").split(",")[0].trim() || "unknown";
}

function firstHeaderValue(value) {
  return String(value || "").split(",")[0].trim();
}

function resolveRequestOrigin(request) {
  const rawProto = firstHeaderValue(request.headers.get("x-forwarded-proto")) || "https";
  const proto = rawProto.split(",")[0].trim() || "https";
  const rawHost = firstHeaderValue(request.headers.get("x-forwarded-host")) || firstHeaderValue(request.headers.get("host"));
  if (!rawHost) return "";
  return `${proto}://${rawHost}`;
}

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}

function normalizeFormat(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "word" ? "word" : "pdf";
}

function normalizeSenderName(name) {
  return String(name || "")
    .replace(/[\r\n]/g, " ")
    .replace(/[<>"]/g, "")
    .trim();
}

function formatSenderAddress(fromEmail, fromName) {
  const email = String(fromEmail || "").trim();
  if (!email) return "";
  const name = normalizeSenderName(fromName);
  if (!name) return email;
  if (email.includes("<") && email.includes(">")) return email;
  return `${name} <${email}>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodeBase64(value) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value).toString("base64");
  }

  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value || ""));
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function buildCvAttachment(option) {
  if (option.value === "word") {
    const document = buildCvWordDocument();
    return {
      filename: option.fileName,
      content: encodeBase64(new TextEncoder().encode(document)),
    };
  }

  return {
    filename: option.fileName,
    content: encodeBase64(buildCvPdf()),
  };
}

function extractResendErrorMessage(resendData) {
  if (!resendData) return "";
  if (typeof resendData === "string") return resendData.trim();
  if (typeof resendData?.message === "string" && resendData.message.trim()) return resendData.message.trim();
  if (typeof resendData?.error?.message === "string" && resendData.error.message.trim()) {
    return resendData.error.message.trim();
  }
  if (Array.isArray(resendData?.errors)) {
    const firstError = resendData.errors.find((entry) => typeof entry?.message === "string" && entry.message.trim());
    if (firstError?.message) return firstError.message.trim();
  }
  return "";
}

function normalizeResendError(resendData) {
  const raw = extractResendErrorMessage(resendData);
  if (!raw) return "Email request failed.";
  const lower = raw.toLowerCase();
  if (lower.includes("verify") && lower.includes("domain")) {
    return "Sender domain is not verified in Resend. Verify your domain and use RESEND_FROM_EMAIL from that domain.";
  }
  if (lower.includes("testing emails") || lower.includes("test mode")) {
    return "Resend is in test mode. Verify your domain and set RESEND_FROM_EMAIL to send customer emails.";
  }
  if (lower.includes("from") && lower.includes("address")) {
    return "RESEND_FROM_EMAIL is invalid or not allowed. Use a verified sender email in Resend.";
  }
  return raw;
}

async function sendResendEmail(env, resendKey, payload) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resendData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: normalizeResendError(resendData) };
    }

    return { ok: true, id: resendData?.id || null };
  } catch (error) {
    return { ok: false, error: error?.message || "Email request failed." };
  }
}

function buildCvPayload({ email, format, request, env }) {
  const option = CV_OPTIONS[format] || CV_OPTIONS.pdf;
  const supportEmail = String(env?.SUPPORT_EMAIL || CV_PROFILE.email).trim();
  const origin = normalizeBaseUrl(resolveRequestOrigin(request));
  const href = option.href;
  const absoluteHref = origin ? `${origin}${href}` : href;
  const subject = `${CV_PROFILE.name} - CV for Consideration`;
  const text = `Dear Hiring Manager,

Please find my ${option.label} CV attached for your review.

I am writing to express my interest in current and future opportunities within your organization. I recently completed my Bachelor of Science in Computer Science and I bring practical experience in web development, problem solving, communication, documentation, and day-to-day digital tools.

I would appreciate the opportunity to be considered for any suitable role where reliability, organization, adaptability, and a willingness to learn are valued.

For convenience, you can also access the CV here:
${absoluteHref}

Thank you for your time and consideration. I would be glad to discuss any suitable opportunity.

Kind regards,
${CV_PROFILE.name}
${CV_PROFILE.phone}
${CV_PROFILE.email}
${CV_PROFILE.portfolio}`;
  const html = `<div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.65;">
<p>Dear Hiring Manager,</p>
<p>Please find my <strong>${escapeHtml(option.label)} CV</strong> attached for your review.</p>
<p>
  I am writing to express my interest in current and future opportunities within your organization.
  I recently completed my Bachelor of Science in Computer Science and I bring practical experience in
  web development, problem solving, communication, documentation, and day-to-day digital tools.
</p>
<p>
  I would appreciate the opportunity to be considered for any suitable role where reliability,
  organization, adaptability, and a willingness to learn are valued.
</p>
<div style="margin: 20px 0; padding: 14px 16px; border: 1px solid #dbeafe; background: #f8fbff; border-radius: 10px;">
  <p style="margin: 0 0 8px; font-weight: 600; color: #1d4ed8;">CV access</p>
  <p style="margin: 0; color: #475569;">${escapeHtml(option.note)}</p>
  <p style="margin: 10px 0 0;">
    <a href="${escapeHtml(absoluteHref)}" style="font-weight: 600; color: #1d4ed8; text-decoration: none;">Download backup copy</a>
  </p>
</div>
<p>Thank you for your time and consideration. I would be glad to discuss any suitable opportunity.</p>
<p style="margin-bottom: 0;">Kind regards,</p>
<p style="margin-top: 4px;">
  ${escapeHtml(CV_PROFILE.name)}<br/>
  ${escapeHtml(CV_PROFILE.phone)}<br/>
  <a href="mailto:${escapeHtml(CV_PROFILE.email)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(CV_PROFILE.email)}</a><br/>
  <a href="${escapeHtml(CV_PROFILE.portfolioUrl)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(CV_PROFILE.portfolio)}</a>
</p>
<p style="font-size: 13px; color: #64748b;">If you need anything else, you can also reply to <a href="mailto:${escapeHtml(supportEmail)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(supportEmail)}</a>.</p>
</div>`;
  return { option, absoluteHref, subject, text, html, attachments: [buildCvAttachment(option)] };
}

async function readJsonBody(request) {
  const raw = await request.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestRateLimit = applyRateLimit(`cv-request:${getClientIp(request)}`, 20, 30 * 60 * 1000);
  if (!requestRateLimit) {
    return json({ ok: false, error: "Too many CV requests. Try again later." }, 429);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  const payload = await readJsonBody(request);
  const email = String(payload?.email || "").trim();
  const format = normalizeFormat(payload?.format);
  const option = CV_OPTIONS[format];

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "Valid email is required." }, 400);
  }

  const resendKey = String(env?.RESEND_API_KEY || "").trim();
  if (!resendKey) {
    return json(
      {
        ok: false,
        error:
          "RESEND_API_KEY is not configured. Enable and configure email delivery in Vercel/hosting environment variables.",
      },
      500
    );
  }

  const configuredFromEmail = String(env?.RESEND_FROM_EMAIL || "noreply@sirdavid.site").trim();
  const senderName = String(env?.RESEND_FROM_NAME || "Chinedu David Nwadialo").trim();
  const fromEmail = formatSenderAddress(configuredFromEmail, senderName);
  const replyToEmail = isValidEmail(env?.SUPPORT_EMAIL) ? env.SUPPORT_EMAIL : CV_PROFILE.email;

  if (!isValidEmail(configuredFromEmail)) {
    return json({ ok: false, error: "RESEND_FROM_EMAIL is invalid or not configured correctly." }, 500);
  }

  const { option: resolvedOption, subject, text, html, attachments } = buildCvPayload({
    email,
    format,
    request,
    env,
  });

  const emailResult = await sendResendEmail(env, resendKey, {
    from: fromEmail,
    to: [email],
    subject,
    text,
    html,
    attachments,
    reply_to: replyToEmail,
  });

  if (!emailResult.ok) {
    return json({ ok: false, error: emailResult.error }, 502);
  }

  return json({
    ok: true,
    format,
    download: resolvedOption.fileName,
    email,
    requestId: emailResult.id,
  });
}
