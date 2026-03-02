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

export default async function handler(req, res) {
  const methods = "POST, OPTIONS";

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
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
    if (!order?.reference || !order?.checkout?.email || !order?.total || order.total <= 0) {
      return json(res, 400, { ok: false, error: "Invalid payment payload." }, methods);
    }

    const paymentReference = `PS-${order.reference}-${Date.now()}`;
    const amountKobo = Math.round(Number(order.total) * 100);
    const callbackUrl = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/?paystack=1`;

    const body = {
      email: order.checkout.email,
      amount: amountKobo,
      currency: order.currency || "NGN",
      reference: paymentReference,
      callback_url: callbackUrl,
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
