import { applyRateLimit } from "../../_lib/rate-limit.js";
import { getClientIp } from "../../_lib/security.js";

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
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
  return JSON.parse(raw);
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
}

function validateInitializePayload(order) {
  if (!order || typeof order !== "object") return "Invalid payment payload.";
  if (!order.reference || typeof order.reference !== "string") return "Order reference is required.";
  if (!order.checkout || typeof order.checkout !== "object") return "Checkout details are required.";
  if (!isValidEmail(order.checkout.email)) return "Valid checkout email is required.";
  if (!Number.isFinite(Number(order.total)) || Number(order.total) <= 0) return "Invalid order total.";

  const currency = String(order.currency || "NGN").toUpperCase();
  if (!["NGN", "USD"].includes(currency)) {
    return "Unsupported currency. Only NGN and USD are supported.";
  }

  return null;
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const initRateLimit = applyRateLimit(res, {
    key: `paystack:init:${clientIp}`,
    limit: 40,
    windowMs: 10 * 60 * 1000,
  });
  if (!initRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many payment requests. Try again later." }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return json(res, 500, { ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, methods);
    }

    const payload = await readJsonBody(req);
    const order = payload?.order;
    const validationError = validateInitializePayload(order);
    if (validationError) {
      return json(res, 400, { ok: false, error: validationError }, methods);
    }

    const paymentReference = `PS-${order.reference}-${Date.now()}`;
    const amountKobo = Math.round(Number(order.total) * 100);
    const callbackUrl = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/?paystack=1`;
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
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.status || !data?.data?.authorization_url) {
      return json(res, 502, { ok: false, error: data?.message || "Failed to initialize Paystack." }, methods);
    }

    return json(
      res,
      200,
      {
        ok: true,
        authorizationUrl: data.data.authorization_url,
        paymentReference,
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
