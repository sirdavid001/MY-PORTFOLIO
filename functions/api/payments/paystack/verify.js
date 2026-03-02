function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.PAYSTACK_SECRET_KEY) {
      return json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, 500);
    }

    const url = new URL(request.url);
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
    if (!reference) return json({ ok: false, error: "Missing reference." }, 400);

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();
    if (!response.ok || !data?.status) {
      return json({ ok: false, error: data?.message || "Verification failed." }, 502);
    }

    const paid = data?.data?.status === "success";
    return json({
      ok: true,
      paid,
      gatewayStatus: data?.data?.status || null,
      amount: data?.data?.amount || null,
      reference: data?.data?.reference || reference,
    });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
