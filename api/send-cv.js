import { applyRateLimit } from "../server/_lib/rate-limit.js";
import { getClientIp } from "../server/_lib/security.js";

const CV_OPTIONS = {
  pdf: {
    value: "pdf",
    label: "PDF",
    href: "/api/cv-download?format=pdf",
    fileName: "chineduDavidNwadialoCv.pdf",
    note: "Your resume is available as a true PDF file.",
  },
  word: {
    value: "word",
    label: "Word",
    href: "/api/cv-download?format=word",
    fileName: "chineduDavidNwadialoCv.doc",
    note: "Your resume is available as a Word-compatible document.",
  },
};

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

function resolveRequestOrigin(req) {
  const rawProto = firstHeaderValue(req.headers["x-forwarded-proto"]) || "https";
  const proto = rawProto.split(",")[0].trim() || "https";
  const rawHost = firstHeaderValue(req.headers["x-forwarded-host"]) || firstHeaderValue(req.headers.host);
  const host = rawHost.split(",")[0].trim();
  if (!host) return "";
  return `${proto}://${host}`;
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

function buildCvPayload({ email, format, request }) {
  const option = CV_OPTIONS[format] || CV_OPTIONS.pdf;
  const supportEmail = String(process.env.SUPPORT_EMAIL || "support@sirdavid.site").trim();
  const origin = normalizeBaseUrl(resolveRequestOrigin(request));
  const href = option.href;
  const absoluteHref = origin ? `${origin}${href}` : href;
  const subject = `Your CV in ${option.label} format`;
  const text = `Hi,\n\nThanks for your request.\n\nYour requested format: ${option.label}\nDownload: ${absoluteHref}\n\n${option.note}\n\nIf you have any issues accessing the file, please reply.\n\nBest,\nChinedu David Nwadialo`;

  const html = `<p>Hi,</p>
<p>Thanks for your request.</p>
<p>Your requested format: <strong>${escapeHtml(option.label)}</strong></p>
<p><a href="${escapeHtml(absoluteHref)}" style="font-weight: 600; color: #1d4ed8;">Download your CV</a></p>
<p style="color: #475569; margin-top: 12px;">${escapeHtml(option.note)}</p>
<p style="margin-top: 12px;">If you have any issues, contact <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
<p>Best,<br/>Chinedu David Nwadialo</p>`;

  return { option, absoluteHref, subject, text, html };
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);
  const requestRateLimit = applyRateLimit(res, {
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
    const email = String(payload?.email || "").trim();
    const format = normalizeFormat(payload?.format);
    const option = CV_OPTIONS[format];

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

    const configuredFromEmail = String(process.env.RESEND_FROM_EMAIL || "noreply@sirdavid.site").trim();
    const senderName = String(process.env.RESEND_FROM_NAME || "Chinedu David Nwadialo").trim();
    const fromEmail = formatSenderAddress(configuredFromEmail, senderName);
    const replyToEmail = isValidEmail(process.env.SUPPORT_EMAIL) ? process.env.SUPPORT_EMAIL : undefined;
    if (!isValidEmail(configuredFromEmail)) {
      return json(
        res,
        500,
        { ok: false, error: "RESEND_FROM_EMAIL is invalid or not configured correctly." },
        methods
      );
    }

    const { subject, text, html } = buildCvPayload({ email, format, request: req });

    const emailResult = await sendResendEmail(resendKey, {
      from: fromEmail,
      to: [email],
      subject,
      text,
      html,
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
