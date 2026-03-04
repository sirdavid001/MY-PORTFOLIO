import { createHmac } from "node:crypto";
import { applyRateLimit } from "../../../server/_lib/rate-limit.js";
import { getClientIp, safeCompare } from "../../../server/_lib/security.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-paystack-signature");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;

  if (Buffer.isBuffer(req.body)) {
    return req.body.toString("utf8");
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function getSignature(req) {
  const header = req.headers["x-paystack-signature"];
  if (Array.isArray(header)) return String(header[0] || "").trim();
  return String(header || "").trim();
}

function verifySignature(rawBody, signature, secret) {
  const computed = createHmac("sha512", secret).update(rawBody).digest("hex");
  return safeCompare(signature, computed);
}

function looksLikeTransferApprovalPayload(payload) {
  if (!payload || typeof payload !== "object") return false;

  const amount = Number(payload?.amount);
  const hasAmount = Number.isFinite(amount) && amount > 0;
  const hasReference = typeof payload?.reference === "string" && payload.reference.trim().length > 0;
  const hasRecipientHint =
    (typeof payload?.recipient === "string" && payload.recipient.trim().length > 0) ||
    (typeof payload?.recipient_code === "string" && payload.recipient_code.trim().length > 0) ||
    (typeof payload?.receiver_account_number === "string" && payload.receiver_account_number.trim().length > 0) ||
    (typeof payload?.payer_account_number === "string" && payload.payer_account_number.trim().length > 0);
  const hasCurrency = typeof payload?.currency === "string" && payload.currency.trim().length > 0;

  return hasAmount && (hasReference || hasRecipientHint || hasCurrency);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function fetchOrderByReference(reference) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRole) {
    return { ok: false, status: 500, error: "Supabase environment variables are missing." };
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/orders?reference=eq.${encodeURIComponent(
      reference
    )}&select=id,total,currency,customer_email,status&limit=1`,
    {
      headers: {
        apikey: supabaseServiceRole,
        Authorization: `Bearer ${supabaseServiceRole}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 502, error: `Failed to load order: ${message}` };
  }

  const rows = await response.json().catch(() => []);
  return { ok: true, order: rows?.[0] || null };
}

async function updateOrderPaid(reference) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${supabaseUrl}/rest/v1/orders?reference=eq.${encodeURIComponent(reference)}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseServiceRole,
      Authorization: `Bearer ${supabaseServiceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ status: "paid" }),
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 502, error: `Failed to update order status: ${message}` };
  }

  const rows = await response.json().catch(() => []);
  return { ok: true, updated: rows.length };
}

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const webhookRateLimit = applyRateLimit(res, {
    key: `paystack:webhook:${clientIp}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  });
  if (!webhookRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many webhook requests." }, methods);
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return json(res, 500, { ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, methods);
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = getSignature(req);
    const payload = JSON.parse(rawBody || "{}");

    // Paystack transfer/inbound transfer approval callbacks may only require a quick HTTP status decision.
    // If no signature is provided but payload looks like an approval callback, auto-approve with 200.
    if (!signature && looksLikeTransferApprovalPayload(payload)) {
      return json(res, 200, { ok: true, approved: true, source: "transfer-approval" }, methods);
    }

    if (!signature || !verifySignature(rawBody, signature, process.env.PAYSTACK_SECRET_KEY)) {
      console.warn("[paystack-webhook] invalid signature", { ip: clientIp });
      return json(res, 401, { ok: false, error: "Invalid webhook signature." }, methods);
    }

    const event = payload;
    if (event?.event !== "charge.success") {
      return json(res, 200, { ok: true, ignored: true }, methods);
    }

    const transaction = event?.data || {};
    if (transaction?.status !== "success") {
      return json(res, 200, { ok: true, ignored: true }, methods);
    }

    const orderReference = String(transaction?.metadata?.order_reference || "").trim();
    if (!orderReference) {
      return json(res, 200, { ok: true, ignored: true, reason: "Missing metadata.order_reference" }, methods);
    }

    const orderResult = await fetchOrderByReference(orderReference);
    if (!orderResult.ok) {
      return json(res, orderResult.status, { ok: false, error: orderResult.error }, methods);
    }

    if (!orderResult.order) {
      return json(res, 200, { ok: true, ignored: true, reason: "Order not found" }, methods);
    }

    const expectedAmountKobo = Math.round(Number(orderResult.order.total || 0) * 100);
    const settledAmount = Number(transaction?.amount || 0);
    const expectedCurrency = String(orderResult.order.currency || "").toUpperCase();
    const settledCurrency = String(transaction?.currency || "").toUpperCase();
    const expectedEmail = normalizeEmail(orderResult.order.customer_email);
    const settledEmail = normalizeEmail(transaction?.customer?.email);

    if (expectedAmountKobo > 0 && settledAmount !== expectedAmountKobo) {
      console.warn("[paystack-webhook] amount mismatch", { orderReference, expectedAmountKobo, settledAmount });
      return json(res, 409, { ok: false, error: "Amount mismatch." }, methods);
    }

    if (expectedCurrency && settledCurrency && expectedCurrency !== settledCurrency) {
      console.warn("[paystack-webhook] currency mismatch", { orderReference, expectedCurrency, settledCurrency });
      return json(res, 409, { ok: false, error: "Currency mismatch." }, methods);
    }

    if (expectedEmail && settledEmail && expectedEmail !== settledEmail) {
      console.warn("[paystack-webhook] email mismatch", { orderReference, expectedEmail, settledEmail });
      return json(res, 409, { ok: false, error: "Customer email mismatch." }, methods);
    }

    if (orderResult.order.status === "paid") {
      return json(res, 200, { ok: true, updated: 0, reference: orderReference, idempotent: true }, methods);
    }

    const updated = await updateOrderPaid(orderReference);
    if (!updated.ok) {
      return json(res, updated.status, { ok: false, error: updated.error }, methods);
    }

    return json(res, 200, { ok: true, updated: updated.updated, reference: orderReference }, methods);
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
