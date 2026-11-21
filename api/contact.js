import { applyRateLimitAsync } from "./_lib/rate-limit.js";
import { getClientIp } from "./_lib/security.js";
import { normalizeCountryCode, normalizeCurrencyCode, resolveCountryName } from "../shared/location.js";
import { PUBLIC_PROFILE } from "../shared/profile.js";
import { escapeHtml } from "../shared/utils.js";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_LENGTH = 3000;
const MAX_SHORT_LENGTH = 180;
const CONTACT_SENDER_NAME = "Sirdavid Portfolio";

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

function normalizeString(value, maxLength = MAX_SHORT_LENGTH) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
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

export function buildContactFromEmail(fromEmail) {
  return formatSenderAddress(fromEmail, CONTACT_SENDER_NAME);
}

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

export function normalizeContactPayload(payload) {
  const website = normalizeString(payload?.website, MAX_SHORT_LENGTH);
  if (website) {
    return { ok: false, status: 400, error: "Request could not be processed." };
  }

  const fullName = normalizeString(payload?.fullName);
  const email = normalizeString(payload?.email);
  const phone = normalizeString(payload?.phone);
  const clientType =
    normalizeString(payload?.clientType) === "Organization" ? "Organization" : "Individual";
  const projectType = normalizeString(payload?.projectType);
  const goals = normalizeString(payload?.goals, MAX_TEXT_LENGTH);
  const features = normalizeString(payload?.features, MAX_TEXT_LENGTH);
  const timeline = normalizeString(payload?.timeline);
  const budget = normalizeString(payload?.budget);
  const budgetLabel = normalizeString(payload?.budgetLabel) || budget;
  const customBudget = normalizeString(payload?.customBudget);
  const countryCode = normalizeCountryCode(payload?.countryCode) || "NG";
  const countryName =
    normalizeString(payload?.countryName) || resolveCountryName(countryCode) || countryCode;
  const currency = normalizeCurrencyCode(payload?.currency) || "NGN";

  if (!fullName) return { ok: false, status: 400, error: "Name is required." };
  if (!isValidEmail(email)) return { ok: false, status: 400, error: "Valid email is required." };
  if (!projectType) return { ok: false, status: 400, error: "Project type is required." };
  if (!goals) return { ok: false, status: 400, error: "Project description is required." };
  if (!features) return { ok: false, status: 400, error: "Requirements are required." };
  if (!timeline) return { ok: false, status: 400, error: "Timeline is required." };
  if (!budget) return { ok: false, status: 400, error: "Budget range is required." };

  return {
    ok: true,
    data: {
      clientType,
      fullName,
      email,
      phone,
      countryCode,
      countryName,
      currency,
      projectType,
      goals,
      features,
      timeline,
      budget,
      budgetLabel,
      customBudget,
    },
  };
}

export function buildContactEmailPayload(contact) {
  const recipient = String(
    process.env.CONTACT_TO_EMAIL || process.env.SUPPORT_EMAIL || PUBLIC_PROFILE.email
  ).trim();
  const subject = `Project Request - ${contact.projectType} - ${contact.fullName}`;
  const text = `New project request from sirdavid.site

Client Type: ${contact.clientType}
Name: ${contact.fullName}
Email: ${contact.email}
Phone: ${contact.phone || "N/A"}
Country: ${contact.countryName} (${contact.countryCode})
Currency: ${contact.currency}
Project Type: ${contact.projectType}
Budget: ${contact.budget === "custom" ? contact.customBudget : contact.budgetLabel}
Timeline: ${contact.timeline}

What they want to build:
${contact.goals}

Specific requirements:
${contact.features}`;

  const html = `<div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.65;">
  <h1 style="font-size: 22px; line-height: 1.3; margin: 0 0 14px;">New project request</h1>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
    ${[
      ["Client Type", contact.clientType],
      ["Name", contact.fullName],
      ["Email", contact.email],
      ["Phone", contact.phone || "N/A"],
      ["Country", `${contact.countryName} (${contact.countryCode})`],
      ["Currency", contact.currency],
      ["Project Type", contact.projectType],
      ["Budget", contact.budget === "custom" ? contact.customBudget : contact.budgetLabel],
      ["Timeline", contact.timeline],
    ]
      .map(
        ([label, value]) => `<tr>
      <td style="width: 150px; padding: 8px 10px 8px 0; color: #64748b; font-weight: 700; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 8px 0; color: #1f2937; vertical-align: top;">${escapeHtml(value)}</td>
    </tr>`
      )
      .join("")}
  </table>
  <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid #e5e7eb;">
    <h2 style="font-size: 16px; margin: 0 0 8px;">What they want to build</h2>
    <p style="white-space: pre-wrap; margin: 0; color: #334155;">${escapeHtml(contact.goals)}</p>
  </div>
  <div style="margin-top: 20px;">
    <h2 style="font-size: 16px; margin: 0 0 8px;">Specific requirements</h2>
    <p style="white-space: pre-wrap; margin: 0; color: #334155;">${escapeHtml(contact.features)}</p>
  </div>
</div>`;

  return { recipient, subject, text, html };
}

function extractResendErrorMessage(resendData) {
  if (!resendData) return "";
  if (typeof resendData === "string") return resendData.trim();
  if (typeof resendData?.message === "string" && resendData.message.trim()) return resendData.message.trim();
  if (typeof resendData?.error?.message === "string" && resendData.error.message.trim()) {
    return resendData.error.message.trim();
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

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);
  const requestRateLimit = await applyRateLimitAsync(res, {
    key: `contact:${clientIp}`,
    limit: 12,
    windowMs: 30 * 60 * 1000,
  });
  if (!requestRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many contact requests. Try again later." }, methods);
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

    const normalized = normalizeContactPayload(payload);
    if (!normalized.ok) {
      return json(res, normalized.status, { ok: false, error: normalized.error }, methods);
    }

    const resendKey = String(process.env.RESEND_API_KEY || "").trim();
    if (!resendKey) {
      return json(
        res,
        503,
        {
          ok: false,
          error:
            "Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL to receive contact requests.",
          fallback: "mailto",
        },
        methods
      );
    }

    const configuredFromEmail = String(process.env.RESEND_FROM_EMAIL || PUBLIC_PROFILE.email).trim();
    if (!isValidEmail(configuredFromEmail)) {
      return json(
        res,
        500,
        { ok: false, error: "RESEND_FROM_EMAIL is invalid or not configured correctly." },
        methods
      );
    }

    const fromEmail = buildContactFromEmail(configuredFromEmail);
    const { recipient, subject, text, html } = buildContactEmailPayload(normalized.data);

    if (!isValidEmail(recipient)) {
      return json(res, 500, { ok: false, error: "CONTACT_TO_EMAIL is invalid." }, methods);
    }

    const emailResult = await sendResendEmail(resendKey, {
      from: fromEmail,
      to: [recipient],
      subject,
      text,
      html,
      reply_to: normalized.data.email,
    });

    if (!emailResult.ok) {
      return json(res, 502, { ok: false, error: emailResult.error }, methods);
    }

    return json(
      res,
      200,
      {
        ok: true,
        requestId: emailResult.id,
        message: "Project request sent.",
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
