const ALLOWED_STATUS = new Set(["new", "processing", "paid", "shipped", "completed", "cancelled"]);

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-admin-key");
}

function json(res, status, data, methods) {
  setCors(res, methods);
  res.status(status).json(data);
}

function firstValue(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isAuthorized(req) {
  const provided = req.headers["x-admin-key"];
  return Boolean(process.env.ADMIN_DASHBOARD_KEY) && provided === process.env.ADMIN_DASHBOARD_KEY;
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
  const methods = "GET, PATCH, OPTIONS";

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true }, methods);
  }

  if (!isAuthorized(req)) {
    return json(res, 401, { ok: false, error: "Unauthorized" }, methods);
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." }, methods);
  }

  try {
    if (req.method === "GET") {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/orders?select=id,reference,customer_name,customer_email,customer_phone,country,total,currency,status,created_at,items&order=created_at.desc&limit=200`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        return json(res, 502, { ok: false, error: message }, methods);
      }

      const orders = await response.json();
      return json(res, 200, { ok: true, orders }, methods);
    }

    if (req.method === "PATCH") {
      const id = Number(firstValue(req.query?.id));
      if (!id) {
        return json(res, 400, { ok: false, error: "Invalid order id." }, methods);
      }

      const payload = await readJsonBody(req);
      const status = String(payload?.status || "").trim();
      if (!ALLOWED_STATUS.has(status)) {
        return json(res, 400, { ok: false, error: "Invalid status." }, methods);
      }

      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const message = await response.text();
        return json(res, 502, { ok: false, error: message }, methods);
      }

      const rows = await response.json();
      return json(res, 200, { ok: true, order: rows?.[0] || null }, methods);
    }

    return json(res, 405, { ok: false, error: "Method not allowed." }, methods);
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected error." }, methods);
  }
}
