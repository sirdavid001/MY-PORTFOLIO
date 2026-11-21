import { applyRateLimitAsync } from "./_lib/rate-limit.js";
import { getClientIp } from "./_lib/security.js";
import { CV_PROFILE } from "../shared/cv/profile.js";
import { buildCvPdf } from "../shared/cv/pdf.js";
import { buildCvDocx } from "../shared/cv/docx.js";
import { CV_FORMATS } from "../shared/cv/formats.js";
import { SITE_URL } from "../shared/seo.js";
import { escapeHtml } from "../shared/utils.js";

const CV_SENDER_NAME = CV_PROFILE.name;

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "https://sirdavid.site");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.setHeader("Cache-Control", "no-store, no-cache");
  res.status(status).json(data);
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}

function normalizeFormat(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "word" || normalized === "docx" ? "word" : "pdf";
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

export function buildCvFromEmail(fromEmail) {
  return formatSenderAddress(fromEmail, CV_SENDER_NAME);
}

async function buildCvAttachment(option) {
  const document = option.value === "word" ? await buildCvDocx() : buildCvPdf();
  return {
    filename: option.fileName,
    content: Buffer.from(document).toString("base64"),
  };
}

const MAX_BODY_BYTES = 10 * 1024; // 10 KB

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_BODY_BYTES) return null;
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    totalBytes += buf.length;
    if (totalBytes > MAX_BODY_BYTES) return null;
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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

async function sendResendEmail(resendKey, payload) {
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

async function buildCvPayload({ email, option }) {
  const supportEmail = String(process.env.SUPPORT_EMAIL || CV_PROFILE.email).trim();
  const absoluteHref = `${SITE_URL}${option.href}`;
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
${CV_PROFILE.portfolio}
${CV_PROFILE.linkedin}`;

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
  <p style="margin: 0; color: #475569;">The requested ${option.label} CV is attached.</p>
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
  <a href="${escapeHtml(CV_PROFILE.portfolioUrl)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(CV_PROFILE.portfolio)}</a><br/>
  <a href="${escapeHtml(CV_PROFILE.linkedinUrl)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(CV_PROFILE.linkedin)}</a>
</p>
<p style="font-size: 13px; color: #64748b;">If you need anything else, you can also reply to <a href="mailto:${escapeHtml(supportEmail)}" style="color: #1d4ed8; text-decoration: none;">${escapeHtml(supportEmail)}</a>.</p>
</div>`;

  return { subject, text, html, attachments: [await buildCvAttachment(option)] };
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);
  const requestRateLimit = await applyRateLimitAsync(res, {
    key: `cv-request:${clientIp}`,
    limit: 20,
    windowMs: 30 * 60 * 1000,
  });
  if (!requestRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many CV requests. Try again later." }, methods);
  }

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  try {
    const payload = await readJsonBody(req);
    if (payload === null) {
      return json(res, 413, { ok: false, error: "Request body too large or malformed." }, methods);
    }
    const email = String(payload?.email || "").trim();
    const format = normalizeFormat(payload?.format);
    const option = CV_FORMATS[format];

    if (!isValidEmail(email)) {
      return json(res, 400, { ok: false, error: "Valid email is required." }, methods);
    }

    const resendKey = String(process.env.RESEND_API_KEY || "").trim();
    if (!resendKey) {
      return json(
        res,
        500,
        {
          ok: false,
          error:
            "RESEND_API_KEY is not configured. Enable and configure email delivery in Vercel/hosting environment variables.",
        },
        methods
      );
    }

    const configuredFromEmail = String(process.env.RESEND_FROM_EMAIL || CV_PROFILE.email).trim();
    const fromEmail = buildCvFromEmail(configuredFromEmail);
    const replyToEmail = isValidEmail(process.env.SUPPORT_EMAIL) ? process.env.SUPPORT_EMAIL : CV_PROFILE.email;
    if (!isValidEmail(configuredFromEmail)) {
      return json(
        res,
        500,
        { ok: false, error: "RESEND_FROM_EMAIL is invalid or not configured correctly." },
        methods
      );
    }

    const { subject, text, html, attachments } = await buildCvPayload({ email, option });

    const emailResult = await sendResendEmail(resendKey, {
      from: fromEmail,
      to: [email],
      subject,
      text,
      html,
      attachments,
      reply_to: replyToEmail,
    });

    if (!emailResult.ok) {
      return json(res, 502, { ok: false, error: emailResult.error }, methods);
    }

    return json(
      res,
      200,
      {
        ok: true,
        format,
        download: option.fileName,
        email,
        requestId: emailResult.id,
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
