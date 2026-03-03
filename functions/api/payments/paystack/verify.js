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

const buckets = globalThis.__cfPaystackVerifyRateLimitBuckets || new Map();
globalThis.__cfPaystackVerifyRateLimitBuckets = buckets;

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

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!applyRateLimit(`paystack:verify:${String(clientIp).split(",")[0].trim()}`, 80, 10 * 60 * 1000)) {
      return json({ ok: false, error: "Too many verification attempts. Try again later." }, 429);
    }

    if (!env.PAYSTACK_SECRET_KEY) {
      return json({ ok: false, error: "PAYSTACK_SECRET_KEY is not configured." }, 500);
    }

    const url = new URL(request.url);
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
    if (!reference) return json({ ok: false, error: "Missing reference." }, 400);
    const expectedAmountKobo = Number(url.searchParams.get("expected_amount_kobo"));
    const expectedCurrency = String(url.searchParams.get("expected_currency") || "").trim().toUpperCase();
    const expectedEmail = normalizeEmail(url.searchParams.get("expected_email"));

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
    const settledAmount = Number(data?.data?.amount || 0);
    const settledCurrency = String(data?.data?.currency || "").toUpperCase();
    const settledEmail = normalizeEmail(data?.data?.customer?.email);

    if (paid && Number.isFinite(expectedAmountKobo) && expectedAmountKobo > 0 && settledAmount !== expectedAmountKobo) {
      return json({ ok: false, paid: false, error: "Amount mismatch during payment verification." }, 409);
    }

    if (paid && expectedCurrency && settledCurrency !== expectedCurrency) {
      return json({ ok: false, paid: false, error: "Currency mismatch during payment verification." }, 409);
    }

    if (paid && expectedEmail && settledEmail && settledEmail !== expectedEmail) {
      return json({ ok: false, paid: false, error: "Customer email mismatch during verification." }, 409);
    }

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
