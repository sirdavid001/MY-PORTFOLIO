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
  const supportEmail = String(env?.SUPPORT_EMAIL || "support@sirdavid.site").trim();
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
  const replyToEmail = isValidEmail(env?.SUPPORT_EMAIL) ? env.SUPPORT_EMAIL : undefined;

  if (!isValidEmail(configuredFromEmail)) {
    return json({ ok: false, error: "RESEND_FROM_EMAIL is invalid or not configured correctly." }, 500);
  }

  const { option: resolvedOption, subject, text, html } = buildCvPayload({
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
