import { applyRateLimit } from "../../../server/_lib/rate-limit.js";
import { getClientIp } from "../../../server/_lib/security.js";

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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export default async function handler(req, res) {
  const methods = "GET, OPTIONS";
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  const verifyRateLimit = applyRateLimit(res, {
    key: `paystack:verify:${clientIp}`,
    limit: 80,
    windowMs: 10 * 60 * 1000,
  });
  if (!verifyRateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many verification attempts. Try again later." }, methods);
  }

  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return json(res, 500, { ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, methods);
    }

    const reference = firstValue(req.query?.reference) || firstValue(req.query?.trxref);
    if (!reference) return json(res, 400, { ok: false, error: "Missing reference." }, methods);
    const expectedAmountKobo = Number(firstValue(req.query?.expected_amount_kobo));
    const expectedCurrency = String(firstValue(req.query?.expected_currency) || "").trim().toUpperCase();
    const expectedEmail = normalizeEmail(firstValue(req.query?.expected_email));

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.status) {
      return json(res, 502, { ok: false, error: data?.message || "Verification failed." }, methods);
    }

    const paid = data?.data?.status === "success";
    const settledAmount = Number(data?.data?.amount || 0);
    const settledCurrency = String(data?.data?.currency || "").toUpperCase();
    const settledEmail = normalizeEmail(data?.data?.customer?.email);

    if (paid && Number.isFinite(expectedAmountKobo) && expectedAmountKobo > 0 && settledAmount !== expectedAmountKobo) {
      console.warn("[paystack] verification amount mismatch", {
        reference,
        expectedAmountKobo,
        settledAmount,
      });
      return json(res, 409, { ok: false, paid: false, error: "Amount mismatch during payment verification." }, methods);
    }

    if (paid && expectedCurrency && settledCurrency !== expectedCurrency) {
      console.warn("[paystack] verification currency mismatch", {
        reference,
        expectedCurrency,
        settledCurrency,
      });
      return json(res, 409, { ok: false, paid: false, error: "Currency mismatch during payment verification." }, methods);
    }

    if (paid && expectedEmail && settledEmail && settledEmail !== expectedEmail) {
      console.warn("[paystack] verification email mismatch", {
        reference,
        expectedEmail,
        settledEmail,
      });
      return json(res, 409, { ok: false, paid: false, error: "Customer email mismatch during verification." }, methods);
    }

    return json(
      res,
      200,
      {
        ok: true,
        paid,
        gatewayStatus: data?.data?.status || null,
        amount: data?.data?.amount || null,
        reference: data?.data?.reference || reference,
      },
      methods
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
