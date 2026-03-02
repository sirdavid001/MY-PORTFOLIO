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

export default async function handler(req, res) {
  const methods = "GET, OPTIONS";

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
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
