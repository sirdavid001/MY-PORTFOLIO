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

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    if (!env.PAYSTACK_SECRET_KEY) {
      return json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, 500);
    }

    const payload = await request.json();
    const order = payload?.order;
    if (!order?.reference || !order?.checkout?.email || !order?.total || order.total <= 0) {
      return json({ ok: false, error: "Invalid payment payload." }, 400);
    }

    const paymentReference = `PS-${order.reference}-${Date.now()}`;
    const amountKobo = Math.round(Number(order.total) * 100);
    const callbackUrl = `${new URL(request.url).origin}/?paystack=1`;

    const body = {
      email: order.checkout.email,
      amount: amountKobo,
      currency: order.currency || "NGN",
      reference: paymentReference,
      callback_url: callbackUrl,
      metadata: {
        order_reference: order.reference,
        customer_name: order.checkout.fullName || "",
        payment_method: "Card payment",
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
