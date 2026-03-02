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
  const { env } = context;
  const key = env.PAYSTACK_PUBLIC_KEY || env.VITE_PAYSTACK_PUBLIC_KEY || "";
  if (!key) {
    return json({ ok: false, error: "PAYSTACK public key is not configured." }, 404);
  }
  return json({ ok: true, key });
}
