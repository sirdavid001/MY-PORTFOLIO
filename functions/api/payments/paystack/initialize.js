import {
  formatCurrencyList,
  isPaystackCurrencySupported,
  resolvePaystackSupportedCurrencies,
} from "../../../../shared/paystack.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

const buckets = globalThis.__cfPaystackInitRateLimitBuckets || new Map();
globalThis.__cfPaystackInitRateLimitBuckets = buckets;

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

function isValidEmail(email) {
  return /^\\S+@\\S+\\.\\S+$/.test(String(email || ""));
}

function validateInitializePayload(order, supportedCurrencies) {
  if (!order || typeof order !== "object") return "Invalid payment payload.";
  if (!order.reference || typeof order.reference !== "string") return "Order reference is required.";
  if (!order.checkout || typeof order.checkout !== "object") return "Checkout details are required.";
  if (!isValidEmail(order.checkout.email)) return "Valid checkout email is required.";
  if (!Number.isFinite(Number(order.total)) || Number(order.total) <= 0) return "Invalid order total.";

  const currency = String(order.currency || "NGN").toUpperCase();
  if (!isPaystackCurrencySupported(currency, supportedCurrencies)) {
    return `Unsupported currency. Supported currencies: ${formatCurrencyList(supportedCurrencies)}.`;
  }
  return null;
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!applyRateLimit(`paystack:init:${String(clientIp).split(",")[0].trim()}`, 40, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many payment requests. Try again later." }, 429);
    }

    if (!env.PAYSTACK_SECRET_KEY) {
      return json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, 500);
    }

    const supportedCurrencies = resolvePaystackSupportedCurrencies(
      env.PAYSTACK_SUPPORTED_CURRENCIES || env.VITE_PAYSTACK_SUPPORTED_CURRENCIES
    );

    const payload = await request.json();
    const order = payload?.order;
    const validationError = validateInitializePayload(order, supportedCurrencies);
    if (validationError) {
      return json({ ok: false, error: validationError }, 400);
    }

    const paymentReference = `PS-${order.reference}-${Date.now()}`;
    const amountKobo = Math.round(Number(order.total) * 100);
    const callbackUrl = `${new URL(request.url).origin}/?paystack=1`;
    const currency = String(order.currency || "NGN").toUpperCase();
    const channels =
      currency === "NGN"
        ? ["card", "bank_transfer", "bank", "ussd", "qr", "eft", "mobile_money"]
        : ["card"];

    const body = {
      email: order.checkout.email,
      amount: amountKobo,
      currency,
      reference: paymentReference,
      callback_url: callbackUrl,
      channels,
      metadata: {
        order_reference: order.reference,
        customer_name: order.checkout.fullName || "",
        payment_method: order.checkout.paymentMethod || "Paystack",
      },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok || !data?.status || !data?.data?.authorization_url) {
      return json({ ok: false, error: data?.message || "Failed to initialize Paystack." }, 502);
    }

    return json({
      ok: true,
      authorizationUrl: data.data.authorization_url,
      paymentReference,
    });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
