function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

export default async function handler(req, res) {
  const methods = "GET, OPTIONS";

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  }

  const key = process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || "";
  if (!key) {
    return json(res, 404, { ok: false, error: "PAYSTACK public key is not configured." }, methods);
  }

  return json(res, 200, { ok: true, key }, methods);
}
