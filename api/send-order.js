import { applyRateLimit } from "../server/_lib/rate-limit.js";
import { getClientIp } from "../server/_lib/security.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
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

function buildTrackingUrl(order, req) {
  const baseFromEnv = normalizeBaseUrl(process.env.ORDER_TRACKING_BASE_URL);
  const base = baseFromEnv || normalizeBaseUrl(resolveRequestOrigin(req));
  const params = new URLSearchParams({
    reference: String(order?.reference || "").trim(),
    email: String(order?.checkout?.email || "").trim(),
  });
  if (!base) {
    return `/track-order?${params.toString()}`;
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

function statusMessage(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "paid") return "Payment confirmed. Your order is queued for processing.";
  if (normalized === "processing") return "Your order is being prepared for shipment.";
  if (normalized === "shipped") return "Your order has been shipped and is in transit.";
  if (normalized === "completed") return "Order delivered successfully.";
  if (normalized === "cancelled") return "Order was cancelled. Contact support if this is unexpected.";
  return "Order received. We will update you soon.";
}

function formatOrderForAdmin(order, trackingUrl) {
  const lines = (order.items || [])
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");

  return `Order Reference: ${order.reference}
Customer: ${order.checkout?.fullName || ""}
Email: ${order.checkout?.email || ""}
Phone: ${order.checkout?.phone || ""}
Address: ${order.checkout?.address || ""}, ${order.checkout?.city || ""}, ${order.checkout?.country || ""}
Payment Method: ${order.checkout?.paymentMethod || "Paystack"}
Currency: ${order.currency || ""}

Items:
${lines}

Subtotal: ${order.subtotal || 0}
Shipping: ${order.shipping || 0}
Total: ${order.total || 0}
Notes: ${order.checkout?.notes || "N/A"}
Tracking URL: ${trackingUrl}`;
}

function formatCustomerText(order, trackingUrl) {
  const customerName = String(order.checkout?.fullName || "Customer").trim();
  return `Hi ${customerName},

Payment confirmed for your order ${order.reference}.

Total paid: ${formatMoney(order.total, order.currency)}
Current status: Paid

Track your order:
${trackingUrl}

We will update this status as your order moves to processing and shipping.

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

function formatCustomerHtml(order, trackingUrl) {
  const customerName = escapeHtml(order.checkout?.fullName || "Customer");
  const reference = escapeHtml(order.reference);
  const total = escapeHtml(formatMoney(order.total, order.currency));
  const safeTrackingUrl = escapeHtml(trackingUrl);
  return `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
  <h2 style="margin:0 0 12px">Payment Confirmed</h2>
  <p>Hi ${customerName},</p>
  <p>Your payment for order <strong>${reference}</strong> has been confirmed.</p>
  <p><strong>Total paid:</strong> ${total}</p>
  <p><strong>Current status:</strong> Paid</p>
  <p>
    <a href="${safeTrackingUrl}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#06b6d4;color:#082f49;text-decoration:none;font-weight:700">
      Track Your Order
    </a>
  </p>
  <p>We will update this status as your order moves to processing and shipping.</p>
  <p>Thank you for shopping with Sirdavid Gadgets.</p>
</div>`;
}

async function saveOrderToSupabase(order) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRole) return { ok: true, skipped: true };

  const payload = {
    reference: order.reference,
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
    notes: order.checkout?.notes || null,
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
    return { ok: false, error: normalizeSupabaseError(message, "Supabase insert") };
  }

  return { ok: true };
}

async function fetchTrackingFromSupabase(reference, email) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRole) {
    return { ok: false, status: 500, error: "Supabase environment variables are missing." };
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/orders?reference=eq.${encodeURIComponent(
      reference
    )}&select=reference,status,created_at,total,currency,customer_email,customer_name&limit=1`,
    {
      headers: {
        apikey: supabaseServiceRole,
        Authorization: `Bearer ${supabaseServiceRole}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 502, error: normalizeSupabaseError(message, "Tracking lookup") };
  }

  const rows = await response.json().catch(() => []);
  const order = rows?.[0];
  if (!order) {
    return { ok: false, status: 404, error: "Order not found." };
  }

  const expectedEmail = normalizeEmail(order.customer_email);
  if (!expectedEmail || normalizeEmail(email) !== expectedEmail) {
    return { ok: false, status: 404, error: "Order not found." };
  }

  return {
    ok: true,
    tracking: {
      reference: order.reference,
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
      return { ok: false, error: resendData?.message || "Email request failed." };
    }

    return { ok: true, id: resendData?.id || null };
  } catch (error) {
    return { ok: false, error: error?.message || "Email request failed." };
  }
}

export default async function handler(req, res) {
  const methods = "POST, GET, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  if (req.method === "GET") {
    const trackingRateLimit = applyRateLimit(res, {
      key: `orders:track:${clientIp}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
    });
    if (!trackingRateLimit.ok) {
      return json(res, 429, { ok: false, error: "Too many tracking requests. Try again later." }, methods);
    }

    const reference = String(firstValue(req.query?.reference) || "").trim();
    const email = String(firstValue(req.query?.email) || "").trim();
    if (reference.length < 5 || reference.length > 80) {
      return json(res, 400, { ok: false, error: "Valid order reference is required." }, methods);
    }
    if (!isValidEmail(email)) {
      return json(res, 400, { ok: false, error: "Valid order email is required." }, methods);
    }

    const trackingResult = await fetchTrackingFromSupabase(reference, email);
    if (!trackingResult.ok) {
      return json(res, trackingResult.status, { ok: false, error: trackingResult.error }, methods);
    }

    return json(res, 200, { ok: true, tracking: trackingResult.tracking }, methods);
  }

  const orderRateLimit = applyRateLimit(res, {
    key: `orders:create:${clientIp}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!orderRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many order requests. Try again later." }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  try {
    const payload = await readJsonBody(req);
    const order = payload?.order;
    const validationError = validateOrderPayload(order);
    if (validationError) {
      return json(res, 400, { ok: false, error: validationError }, methods);
    }

    const supabaseResult = await saveOrderToSupabase(order);
    if (!supabaseResult.ok) {
      return json(res, 502, { ok: false, error: supabaseResult.error }, methods);
    }

    const trackingUrl = buildTrackingUrl(order, req);
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.ORDER_RECEIVER_EMAIL || "itssirdavid@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const customerEmail = String(order.checkout?.email || "").trim();

    if (!resendKey) {
      return json(
        res,
        200,
        {
          ok: true,
          persisted: !supabaseResult.skipped,
          emailSent: false,
          merchantEmailSent: false,
          customerEmailSent: false,
          trackingUrl,
          warning: "RESEND_API_KEY is not configured. Order was saved without email notification.",
        },
        methods
      );
    }

    const merchantPayload = {
      from: fromEmail,
      to: [toEmail],
      subject: `Paid Store Order ${order.reference}`,
      text: formatOrderForAdmin(order, trackingUrl),
      reply_to: customerEmail || undefined,
    };

    const customerPayload = {
      from: fromEmail,
      to: [customerEmail],
      subject: `Payment Confirmed • ${order.reference}`,
      text: formatCustomerText(order, trackingUrl),
      html: formatCustomerHtml(order, trackingUrl),
    };

    const warnings = [];
    const merchantResult = isValidEmail(toEmail)
      ? await sendResendEmail(resendKey, merchantPayload)
      : { ok: false, error: "ORDER_RECEIVER_EMAIL is invalid." };
    const customerResult = isValidEmail(customerEmail)
      ? await sendResendEmail(resendKey, customerPayload)
      : { ok: false, error: "Customer email is invalid." };

    if (!merchantResult.ok) warnings.push(`Merchant email failed: ${merchantResult.error}`);
    if (!customerResult.ok) warnings.push(`Customer confirmation email failed: ${customerResult.error}`);

    return json(
      res,
      200,
      {
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: merchantResult.ok && customerResult.ok,
        merchantEmailSent: merchantResult.ok,
        customerEmailSent: customerResult.ok,
        merchantEmailId: merchantResult.id || null,
        customerEmailId: customerResult.id || null,
        trackingUrl,
        warning: warnings.length > 0 ? warnings.join(" ") : null,
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
