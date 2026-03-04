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

function resolveRequestOrigin(request) {
  const parsed = new URL(request.url);
  return `${parsed.protocol}//${parsed.host}`;
}

function buildTrackingUrl(order, request, env) {
  const base = normalizeBaseUrl(env.ORDER_TRACKING_BASE_URL) || normalizeBaseUrl(resolveRequestOrigin(request));
  const params = new URLSearchParams({
    reference: String(order?.reference || "").trim(),
  });
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

  return `Order Reference: ${order.reference}
Customer: ${order.checkout?.fullName || ""}
Email: ${order.checkout?.email || ""}
Phone: ${order.checkout?.phone || ""}
Call Number: ${order.checkout?.callNumber || "N/A"}
Address: ${order.checkout?.address || ""}, ${order.checkout?.city || ""}, ${order.checkout?.country || ""}
Payment Method: ${order.checkout?.paymentMethod || "Paystack"}
Currency: ${order.currency || ""}

Items:
${lines}

Subtotal: ${order.subtotal || 0}
Shipping: ${order.shipping || 0}
Total: ${order.total || 0}
Notes: ${combinedNotes || "N/A"}
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

You can track with your order reference now, or with a tracking number once assigned by dispatch.

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
  <p>You can track with your order reference now, or with a tracking number once assigned by dispatch.</p>
  <p>We will update this status as your order moves to processing and shipping.</p>
  <p>Thank you for shopping with Sirdavid Gadgets.</p>
</div>`;
}

async function saveOrderToSupabase(order, env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE_KEY;
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
    return { ok: false, error: normalizeSupabaseError(message, "Supabase insert") };
  }

  return { ok: true };
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
      trackingNumber: order.tracking_number || null,
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

    const supabaseResult = await saveOrderToSupabase(order, env);
    if (!supabaseResult.ok) {
      return json({ ok: false, error: supabaseResult.error }, 502);
    }

    const trackingUrl = buildTrackingUrl(order, request, env);
    const resendKey = env.RESEND_API_KEY;
    const toEmail = env.ORDER_RECEIVER_EMAIL || "itssirdavid@gmail.com";
    const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const customerEmail = String(order.checkout?.email || "").trim();

    if (!resendKey) {
      return json({
        ok: true,
        persisted: !supabaseResult.skipped,
        emailSent: false,
        merchantEmailSent: false,
        customerEmailSent: false,
        trackingUrl,
        warning: "RESEND_API_KEY is not configured. Order was saved without email notification.",
      });
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

    return json({
      ok: true,
      persisted: !supabaseResult.skipped,
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
