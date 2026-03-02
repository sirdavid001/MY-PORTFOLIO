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
    payment_method: order.checkout?.paymentMethod || null,
    currency: order.currency || "USD",
    subtotal: Number(order.subtotal || 0),
    shipping: Number(order.shipping || 0),
    total: Number(order.total || 0),
    notes: order.checkout?.notes || null,
    items: order.items || [],
    status: "new",
    created_at: new Date().toISOString(),
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: supabaseServiceRole,
      Authorization: `Bearer ${supabaseServiceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, error: `Supabase insert failed: ${message}` };
  }

  return { ok: true };
}

function formatOrder(order) {
  const lines = (order.items || [])
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join("\n");

  return `Order Reference: ${order.reference}
Customer: ${order.checkout?.fullName || ""}
Email: ${order.checkout?.email || ""}
Phone: ${order.checkout?.phone || ""}
Address: ${order.checkout?.address || ""}, ${order.checkout?.city || ""}, ${order.checkout?.country || ""}
Payment Method: ${order.checkout?.paymentMethod || ""}
Currency: ${order.currency || ""}

Items:
${lines}

Subtotal: ${order.subtotal || 0}
Shipping: ${order.shipping || 0}
Total: ${order.total || 0}
Notes: ${order.checkout?.notes || "N/A"}`;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, "POST, OPTIONS");
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, "POST, OPTIONS");
  }

  try {
    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.ORDER_RECEIVER_EMAIL || "itssirdavid@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!resendKey) {
      return json(res, 500, { ok: false, error: "RESEND_API_KEY is not configured." }, "POST, OPTIONS");
    }

    const payload = await readJsonBody(req);
    const order = payload?.order;
    if (!order?.reference || !Array.isArray(order?.items) || order.items.length === 0) {
      return json(res, 400, { ok: false, error: "Invalid order payload." }, "POST, OPTIONS");
    }

    const emailPayload = {
      from: fromEmail,
      to: [toEmail],
      subject: `New Store Order ${order.reference}`,
      text: formatOrder(order),
      reply_to: order.checkout?.email || undefined,
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const resendData = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      return json(res, 502, { ok: false, error: resendData?.message || "Resend request failed." }, "POST, OPTIONS");
    }

    const supabaseResult = await saveOrderToSupabase(order);
    if (!supabaseResult.ok) {
      return json(res, 502, { ok: false, error: supabaseResult.error }, "POST, OPTIONS");
    }

    return json(
      res,
      200,
      {
        ok: true,
        id: resendData?.id || null,
        persisted: !supabaseResult.skipped,
      },
      "POST, OPTIONS"
    );
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, "POST, OPTIONS");
  }
}
