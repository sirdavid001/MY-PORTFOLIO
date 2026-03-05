function json(data, status = 200, methods = "POST, GET, OPTIONS") {
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

const buckets = globalThis.__cfSendOrderRateLimitBuckets || new Map();
globalThis.__cfSendOrderRateLimitBuckets = buckets;

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

function normalizeSupabaseError(rawText, action) {
  const text = String(rawText || "").trim();
  if (!text) return `${action} failed.`;

  try {
    const parsed = JSON.parse(text);
    if (parsed?.code === "PGRST205") {
      return "Supabase table public.orders is missing. Create it in Supabase SQL Editor using the schema in README.md.";
    }

    if (parsed?.message) {
      return `${action} failed: ${parsed.message}`;
    }
  } catch {
    // Keep fallback below.
  }

  return `${action} failed: ${text}`;
}

function formatMoney(value, currency) {
  const amount = Number(value || 0);
  const normalizedCurrency = String(currency || "NGN").toUpperCase();
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toFixed(2)}`;
  }
}

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function normalizeReference(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function generateTrackingNumber(reference) {
  const normalizedReference = normalizeReference(reference);
  if (!normalizedReference) return "";

  const core = normalizedReference.slice(-8).padStart(8, "0");
  let hash = 2166136261;
  for (let i = 0; i < normalizedReference.length; i += 1) {
    hash ^= normalizedReference.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const checksum = hash.toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return `SDV-${core}-${checksum}`;
}

function resolveTrackingNumber(order) {
  const existing = String(order?.trackingNumber || order?.tracking_number || "").trim();
  if (existing) return existing.slice(0, 120);
  return generateTrackingNumber(order?.reference);
}

function resolveRequestOrigin(request) {
  const parsed = new URL(request.url);
  return `${parsed.protocol}//${parsed.host}`;
}

function buildTrackingUrl(order, request, env) {
  const base = normalizeBaseUrl(env.ORDER_TRACKING_BASE_URL) || normalizeBaseUrl(resolveRequestOrigin(request));
  const params = new URLSearchParams({
    reference: String(order?.reference || "").trim(),
  });
  const trackingNumber = String(resolveTrackingNumber(order) || "").trim();
  if (trackingNumber) {
    params.set("tracking", trackingNumber);
  }
  return `${base}/track-order?${params.toString()}`;
}

function validateOrderPayload(order) {
  if (!order || typeof order !== "object") return "Invalid order payload.";
  if (!order.reference || typeof order.reference !== "string" || order.reference.trim().length < 5) {
    return "Invalid order reference.";
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    return "Order items are required.";
  }

  const itemsValid = order.items.every((item) => {
    return (
      item &&
      typeof item === "object" &&
      typeof item.name === "string" &&
      item.name.trim().length > 0 &&
      Number.isFinite(Number(item.quantity)) &&
      Number(item.quantity) > 0
    );
  });
  if (!itemsValid) return "Invalid order items.";

  if (!order.checkout || typeof order.checkout !== "object") {
    return "Checkout data is required.";
  }

  if (!isValidEmail(order.checkout.email)) {
    return "Valid customer email is required.";
  }

  const total = Number(order.total);
  if (!Number.isFinite(total) || total <= 0) {
    return "Invalid order total.";
  }

  return null;
}

function composeOrderNotes(order) {
  const callNumber = String(order?.checkout?.callNumber || "").trim();
  const notes = String(order?.checkout?.notes || "").trim();
  const parts = [];
  if (callNumber) parts.push(`Call number: ${callNumber}`);
  if (notes) parts.push(notes);
  return parts.length > 0 ? parts.join("\n") : null;
}

function isExplicitlyFalse(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off";
}

function shouldSendDiscordAlerts(value) {
  if (value == null || String(value).trim() === "") return true;
  return !isExplicitlyFalse(value);
}

function buildDiscordAlertText(order, trackingUrl) {
  const trackingNumber = resolveTrackingNumber(order) || "N/A";
  const customerName = String(order?.checkout?.fullName || "N/A").trim() || "N/A";
  const customerPhone = String(order?.checkout?.phone || "N/A").trim() || "N/A";
  const customerEmail = String(order?.checkout?.email || "N/A").trim() || "N/A";
  const total = formatMoney(order?.total || 0, order?.currency || "NGN");
  const method = String(order?.checkout?.paymentMethod || "Paystack").trim() || "Paystack";
  const topItems = (order?.items || [])
    .slice(0, 4)
    .map((item) => `${String(item?.name || "Item").trim() || "Item"} x${Number(item?.quantity || 1)}`)
    .join(", ");

  return [
    "New paid order received",
    `Reference: ${String(order?.reference || "").trim()}`,
    `Tracking: ${trackingNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Email: ${customerEmail}`,
    `Payment: ${method}`,
    `Total: ${total}`,
    `Items: ${topItems || "N/A"}`,
    `Track: ${trackingUrl}`,
  ].join("\n");
}

async function sendDiscordAlert({ webhookUrl, order, trackingUrl }) {
  const normalizedWebhookUrl = String(webhookUrl || "").trim();
  if (!normalizedWebhookUrl) {
    return { ok: false, skipped: true, error: "Discord webhook URL missing." };
  }

  const payload = {
    content: buildDiscordAlertText(order, trackingUrl),
    allowed_mentions: {
      parse: [],
    },
  };

  try {
    const response = await fetch(normalizedWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      return {
        ok: false,
        skipped: false,
        error: message || `Discord webhook request failed with status ${response.status}.`,
      };
    }

    return {
      ok: true,
      skipped: false,
      id: null,
    };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || "Discord webhook request failed." };
  }
}

function statusMessage(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "paid") return "Payment confirmed. Your order is queued for processing.";
  if (normalized === "processing") return "Your order is being prepared for shipment.";
  if (normalized === "in_route" || normalized === "shipped") return "Your order is in transit.";
  if (normalized === "completed" || normalized === "delivered") return "Order delivered successfully.";
  if (normalized === "cancelled") return "Order was cancelled. Contact support if this is unexpected.";
  return "Order received and awaiting processing.";
}

function formatOrderForAdmin(order, trackingUrl) {
  const lines = (order.items || [])
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");
  const combinedNotes = composeOrderNotes(order);
  const trackingNumber = resolveTrackingNumber(order);
  const subtotal = formatMoney(order.subtotal || 0, order.currency);
  const shipping = formatMoney(order.shipping || 0, order.currency);
  const total = formatMoney(order.total || 0, order.currency);

  return `Order Reference: ${order.reference}
Tracking Number: ${trackingNumber || "N/A"}
Customer: ${order.checkout?.fullName || ""}
Email: ${order.checkout?.email || ""}
Phone: ${order.checkout?.phone || ""}
Call Number: ${order.checkout?.callNumber || "N/A"}
Address: ${order.checkout?.address || ""}, ${order.checkout?.city || ""}, ${order.checkout?.country || ""}
Payment Method: ${order.checkout?.paymentMethod || "Paystack"}
Currency: ${order.currency || ""}

Items:
${lines}

Subtotal: ${subtotal}
Shipping: ${shipping}
Total: ${total}
Notes: ${combinedNotes || "N/A"}
Tracking URL: ${trackingUrl}`;
}

function formatOrderForAdminHtml(order, trackingUrl) {
  const trackingNumber = escapeHtml(resolveTrackingNumber(order) || "N/A");
  const reference = escapeHtml(order.reference || "");
  const customerName = escapeHtml(order.checkout?.fullName || "N/A");
  const customerEmail = escapeHtml(order.checkout?.email || "N/A");
  const customerPhone = escapeHtml(order.checkout?.phone || "N/A");
  const callNumber = escapeHtml(order.checkout?.callNumber || "N/A");
  const paymentMethod = escapeHtml(order.checkout?.paymentMethod || "Paystack");
  const currency = escapeHtml(String(order.currency || "NGN").toUpperCase());
  const address = escapeHtml(
    [order.checkout?.address, order.checkout?.city, order.checkout?.country].map((value) => String(value || "").trim()).filter(Boolean).join(", ") || "N/A"
  );
  const subtotal = escapeHtml(formatMoney(order.subtotal || 0, order.currency));
  const shipping = escapeHtml(formatMoney(order.shipping || 0, order.currency));
  const total = escapeHtml(formatMoney(order.total || 0, order.currency));
  const notes = escapeHtml(composeOrderNotes(order) || "N/A").replace(/\n/g, "<br />");
  const safeTrackingUrl = escapeHtml(trackingUrl);
  const itemsHtml =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items
          .map((item) => {
            const name = escapeHtml(item?.name || "Item");
            const quantity = Number(item?.quantity || 0) > 0 ? Number(item.quantity) : 1;
            return `<tr><td style="padding:10px 12px;border-bottom:1px solid #e2e8f0">${name}</td><td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right">x${quantity}</td></tr>`;
          })
          .join("")
      : `<tr><td colspan="2" style="padding:10px 12px;color:#64748b">No line items captured.</td></tr>`;

  return `
<div style="background:#f8fafc;padding:24px 12px;font-family:Arial,sans-serif;color:#0f172a">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
    <div style="padding:20px;background:linear-gradient(120deg,#0f172a,#1e293b);color:#f8fafc">
      <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#bae6fd">Sirdavid Gadgets</p>
      <h2 style="margin:8px 0 0;font-size:24px;line-height:1.2">Paid Store Order</h2>
      <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1">Reference: <strong>${reference}</strong></p>
    </div>

    <div style="padding:20px">
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#ecfeff;border:1px solid #a5f3fc;font-size:12px;font-weight:700;color:#0f766e">PAID</span>
        <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:#f8fafc;border:1px solid #cbd5e1;font-size:12px;font-weight:700;color:#334155">Tracking: ${trackingNumber}</span>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <tbody>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569;width:40%">Customer</td><td style="padding:10px 12px">${customerName}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Email</td><td style="padding:10px 12px">${customerEmail}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Phone</td><td style="padding:10px 12px">${customerPhone}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Call Number</td><td style="padding:10px 12px">${callNumber}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Address</td><td style="padding:10px 12px">${address}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Payment Method</td><td style="padding:10px 12px">${paymentMethod}</td></tr>
          <tr><td style="padding:10px 12px;background:#f8fafc;font-size:12px;color:#475569">Currency</td><td style="padding:10px 12px">${currency}</td></tr>
        </tbody>
      </table>

      <h3 style="margin:18px 0 8px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#334155">Items</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="margin-top:16px;padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc">
        <p style="margin:0;font-size:13px;color:#334155"><strong>Subtotal:</strong> ${subtotal}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#334155"><strong>Shipping:</strong> ${shipping}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#0f172a"><strong>Total:</strong> ${total}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#475569"><strong>Notes:</strong> ${notes}</p>
      </div>

      <div style="margin-top:18px;display:flex;flex-wrap:wrap;gap:10px">
        <a href="${safeTrackingUrl}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#06b6d4;color:#082f49;text-decoration:none;font-weight:700">Track Order</a>
      </div>
    </div>
  </div>
</div>`;
}

function formatCustomerText(order, trackingUrl, supportEmail = "support@sirdavid.site") {
  const customerName = String(order.checkout?.fullName || "Customer").trim();
  const trackingNumber = resolveTrackingNumber(order);
  return `Hi ${customerName},

Payment confirmed for your order ${order.reference}.
Tracking number: ${trackingNumber || "Pending assignment"}

Total paid: ${formatMoney(order.total, order.currency)}
Current status: Paid

Track your order:
${trackingUrl}

You can track with your order reference now, or with a tracking number once assigned by dispatch.

We will update this status as your order moves to processing and shipping.

Need help? Contact ${supportEmail}.

Thank you for shopping with Sirdavid Gadgets.`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCustomerHtml(order, trackingUrl, supportEmail = "support@sirdavid.site") {
  const customerName = escapeHtml(order.checkout?.fullName || "Customer");
  const reference = escapeHtml(order.reference);
  const trackingNumber = escapeHtml(resolveTrackingNumber(order) || "Pending assignment");
  const total = escapeHtml(formatMoney(order.total, order.currency));
  const safeTrackingUrl = escapeHtml(trackingUrl);
  const safeSupportEmail = escapeHtml(supportEmail);
  return `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
  <h2 style="margin:0 0 12px">Payment Confirmed</h2>
  <p>Hi ${customerName},</p>
  <p>Your payment for order <strong>${reference}</strong> has been confirmed.</p>
  <p><strong>Tracking number:</strong> ${trackingNumber}</p>
  <p><strong>Total paid:</strong> ${total}</p>
  <p><strong>Current status:</strong> Paid</p>
  <p>
    <a href="${safeTrackingUrl}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#06b6d4;color:#082f49;text-decoration:none;font-weight:700">
      Track Your Order
    </a>
  </p>
  <p>You can track with your order reference now, or with a tracking number once assigned by dispatch.</p>
  <p>We will update this status as your order moves to processing and shipping.</p>
  <p>Need help? Contact <a href="mailto:${safeSupportEmail}">${safeSupportEmail}</a>.</p>
  <p>Thank you for shopping with Sirdavid Gadgets.</p>
</div>`;
}

async function saveOrderToSupabase(order, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE_KEY;
  const trackingNumber = resolveTrackingNumber(order);
  if (!supabaseUrl || !supabaseServiceRole) {
    return { ok: true, skipped: true, trackingNumber, trackingPersisted: false };
  }

  const payload = {
    reference: order.reference,
    tracking_number: trackingNumber || null,
    customer_name: order.checkout?.fullName || null,
    customer_email: order.checkout?.email || null,
    customer_phone: order.checkout?.phone || null,
    address: order.checkout?.address || null,
    city: order.checkout?.city || null,
    country: order.checkout?.country || null,
    payment_method: order.checkout?.paymentMethod || "Paystack",
    currency: order.currency || "USD",
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    total: Number(order.total || 0),
    notes: composeOrderNotes(order),
    items: order.items || [],
    status: "paid",
    created_at: new Date().toISOString(),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?on_conflict=reference`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRole,
      Authorization: `Bearer ${supabaseServiceRole}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    if (isMissingTrackingNumberColumnError(message)) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.tracking_number;

      const fallbackResponse = await fetch(`${supabaseUrl}/rest/v1/orders?on_conflict=reference`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceRole,
          Authorization: `Bearer ${supabaseServiceRole}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(fallbackPayload),
      });

      if (fallbackResponse.ok) {
        return {
          ok: true,
          trackingNumber,
          trackingPersisted: false,
          warning:
            "Tracking number was generated but could not be stored. Add tracking_number column in public.orders by running supabase/orders.sql.",
        };
      }

      const fallbackMessage = await fallbackResponse.text();
      return { ok: false, error: normalizeSupabaseError(fallbackMessage, "Supabase insert") };
    }
    return { ok: false, error: normalizeSupabaseError(message, "Supabase insert") };
  }

  return { ok: true, trackingNumber, trackingPersisted: true };
}

function isMissingTrackingNumberColumnError(rawText) {
  const text = String(rawText || "").toLowerCase();
  return text.includes("tracking_number") && (text.includes("column") || text.includes("42703"));
}

async function fetchTrackingOrderByField({ supabaseUrl, supabaseServiceRole, field, value }) {
  const selectWithTracking = "reference,tracking_number,status,created_at,total,currency,customer_email,customer_name";
  const headers = {
    apikey: supabaseServiceRole,
    Authorization: `Bearer ${supabaseServiceRole}`,
  };

  const request = async (selectFields) =>
    fetch(
      `${supabaseUrl}/rest/v1/orders?${field}=eq.${encodeURIComponent(value)}&select=${selectFields}&limit=1`,
      {
        headers,
      }
    );

  let response = await request(selectWithTracking);
  if (!response.ok) {
    const message = await response.text();
    if (isMissingTrackingNumberColumnError(message)) {
      if (field === "tracking_number") {
        return { ok: true, order: null };
      }

      const fallbackSelect = "reference,status,created_at,total,currency,customer_email,customer_name";
      response = await request(fallbackSelect);
      if (!response.ok) {
        const fallbackMessage = await response.text();
        return { ok: false, status: 502, error: normalizeSupabaseError(fallbackMessage, "Tracking lookup") };
      }
      const fallbackRows = await response.json().catch(() => []);
      const order = fallbackRows?.[0] ? { ...fallbackRows[0], tracking_number: null } : null;
      return { ok: true, order };
    }
    return { ok: false, status: 502, error: normalizeSupabaseError(message, "Tracking lookup") };
  }

  const rows = await response.json().catch(() => []);
  return { ok: true, order: rows?.[0] || null };
}

async function fetchTrackingFromSupabase(lookupValue, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRole) {
    return { ok: false, status: 500, error: "Supabase environment variables are missing." };
  }

  const normalizedLookup = String(lookupValue || "").trim();
  if (!normalizedLookup) {
    return { ok: false, status: 400, error: "Valid order reference or tracking number is required." };
  }

  const byReference = await fetchTrackingOrderByField({
    supabaseUrl,
    supabaseServiceRole,
    field: "reference",
    value: normalizedLookup,
  });
  if (!byReference.ok) {
    return byReference;
  }

  const byTrackingNumber =
    byReference.order ||
    (await fetchTrackingOrderByField({
      supabaseUrl,
      supabaseServiceRole,
      field: "tracking_number",
      value: normalizedLookup,
    }));

  if (byReference.order == null && byTrackingNumber && !byTrackingNumber.ok) {
    return byTrackingNumber;
  }

  const order = byReference.order || byTrackingNumber?.order || null;
  if (!order) {
    return { ok: false, status: 404, error: "Order not found." };
  }

  return {
    ok: true,
    tracking: {
      reference: order.reference,
      trackingNumber: order.tracking_number || generateTrackingNumber(order.reference) || null,
      status: String(order.status || "new").toLowerCase(),
      statusMessage: statusMessage(order.status),
      createdAt: order.created_at,
      total: Number(order.total || 0),
      currency: String(order.currency || "NGN").toUpperCase(),
      customerName: order.customer_name || "",
    },
  };
}

async function sendResendEmail(resendKey, payload) {
  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const resendData = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      return { ok: false, error: normalizeResendError(resendData) };
    }
    return { ok: true, id: resendData?.id || null };
  } catch (error) {
    return { ok: false, error: error?.message || "Email request failed." };
  }
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const clientIp = getClientIp(request);
    if (!applyRateLimit(`orders:track:${clientIp}`, 120, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many tracking requests. Try again later." }, 429);
    }

    const url = new URL(request.url);
    const reference = String(url.searchParams.get("reference") || "").trim();
    const tracking = String(url.searchParams.get("tracking") || "").trim();
    const lookup = String(url.searchParams.get("lookup") || "").trim();
    const resolvedLookup = lookup || reference || tracking;
    if (resolvedLookup.length < 3 || resolvedLookup.length > 120) {
      return json({ ok: false, error: "Valid order reference or tracking number is required." }, 400);
    }

    const result = await fetchTrackingFromSupabase(resolvedLookup, env);
    if (!result.ok) {
      return json({ ok: false, error: result.error }, result.status || 500);
    }

    return json({ ok: true, tracking: result.tracking });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const clientIp = getClientIp(request);
    if (!applyRateLimit(`orders:create:${clientIp}`, 30, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many order requests. Try again later." }, 429);
    }

    const payload = await request.json().catch(() => ({}));
    const order = payload?.order;
    const validationError = validateOrderPayload(order);
    if (validationError) {
      return json({ ok: false, error: validationError }, 400);
    }

    const trackingNumber = resolveTrackingNumber(order);
    const orderWithTracking = {
      ...order,
      trackingNumber,
    };

    const supabaseResult = await saveOrderToSupabase(orderWithTracking, env);
    if (!supabaseResult.ok) {
      return json({ ok: false, error: supabaseResult.error }, 502);
    }

    const resolvedTrackingNumber = supabaseResult.trackingNumber || trackingNumber || null;
    const orderForEmail = {
      ...orderWithTracking,
      trackingNumber: resolvedTrackingNumber,
    };

    const trackingUrl = buildTrackingUrl(orderForEmail, request, env);
    const discordEnabled = shouldSendDiscordAlerts(env.DISCORD_ALERTS_ENABLED);
    const discordResult = discordEnabled
      ? await sendDiscordAlert({
          webhookUrl: env.DISCORD_WEBHOOK_URL,
          order: orderForEmail,
          trackingUrl,
        })
      : { ok: false, skipped: true, error: "Discord alerts disabled." };
    if (!discordResult.ok && !discordResult.skipped) {
      console.warn("[send-order] Discord alert failed", discordResult.error);
    }

    const resendKey = env.RESEND_API_KEY;
    const toEmail = env.ORDER_RECEIVER_EMAIL || "support@sirdavid.site";
    const configuredFromEmail = String(env.RESEND_FROM_EMAIL || "noreply@sirdavid.site").trim();
    const senderName = String(env.RESEND_FROM_NAME || "Sirdavid Gadgets").trim();
    const supportEmail = String(env.SUPPORT_EMAIL || "support@sirdavid.site").trim();
    const fromEmail = formatSenderAddress(configuredFromEmail, senderName);
    const replyToEmail = isValidEmail(supportEmail) ? supportEmail : undefined;
    const customerEmail = String(orderForEmail.checkout?.email || "").trim();

    if (!resendKey) {
      return json({
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: false,
        merchantEmailSent: false,
        customerEmailSent: false,
        discordAlertSent: discordResult.ok,
        trackingNumber: resolvedTrackingNumber,
        trackingUrl,
        warning:
          supabaseResult.warning || "RESEND_API_KEY is not configured. Order was saved without email notification.",
      });
    }

    if (!configuredFromEmail || !isValidEmail(configuredFromEmail)) {
      return json({
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: false,
        merchantEmailSent: false,
        customerEmailSent: false,
        discordAlertSent: discordResult.ok,
        trackingNumber: resolvedTrackingNumber,
        trackingUrl,
        warning:
          "RESEND_FROM_EMAIL is invalid. Set it in your deployment variables to a verified sender address (example: noreply@sirdavid.site).",
      });
    }

    const merchantPayload = {
      from: fromEmail,
      to: [toEmail],
      subject: `Paid Store Order ${orderForEmail.reference}`,
      text: formatOrderForAdmin(orderForEmail, trackingUrl),
      html: formatOrderForAdminHtml(orderForEmail, trackingUrl),
      reply_to: replyToEmail,
    };

    const customerPayload = {
      from: fromEmail,
      to: [customerEmail],
      subject: `Payment Confirmed • ${orderForEmail.reference}`,
      text: formatCustomerText(orderForEmail, trackingUrl, supportEmail),
      html: formatCustomerHtml(orderForEmail, trackingUrl, supportEmail),
      reply_to: replyToEmail,
    };

    const warnings = [];
    const merchantResult = isValidEmail(toEmail)
      ? await sendResendEmail(resendKey, merchantPayload)
      : { ok: false, error: "ORDER_RECEIVER_EMAIL is invalid." };
    const customerResult = isValidEmail(customerEmail)
      ? await sendResendEmail(resendKey, customerPayload)
      : { ok: false, error: "Customer email is invalid." };

    if (!discordResult.ok && !discordResult.skipped) warnings.push(`Discord alert failed: ${discordResult.error}`);
    if (!merchantResult.ok) warnings.push(`Merchant email failed: ${merchantResult.error}`);
    if (!customerResult.ok) warnings.push(`Customer confirmation email failed: ${customerResult.error}`);
    if (supabaseResult.warning) warnings.push(supabaseResult.warning);

    return json({
      ok: true,
      persisted: !supabaseResult.skipped,
      trackingNumber: resolvedTrackingNumber,
      discordAlertSent: discordResult.ok,
      emailSent: merchantResult.ok && customerResult.ok,
      merchantEmailSent: merchantResult.ok,
      customerEmailSent: customerResult.ok,
      merchantEmailId: merchantResult.id || null,
      customerEmailId: customerResult.id || null,
      trackingUrl,
      warning: warnings.length > 0 ? warnings.join(" ") : null,
    });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
