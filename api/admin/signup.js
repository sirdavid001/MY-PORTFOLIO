import { applyRateLimit } from "../../server/_lib/rate-limit.js";
import { getClientIp, isIpAllowed } from "../../server/_lib/security.js";

const METHODS = "POST, OPTIONS";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", METHODS);
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, x-admin-token");
}

function json(res, status, data) {
  setCors(res);
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

function adminHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

export default async function handler(req, res) {
  const clientIp = getClientIp(req);

  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  const rateLimit = applyRateLimit(res, {
    key: `admin:signup:${clientIp}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return json(res, 429, { ok: false, error: "Too many signup attempts. Try again later." });
  }

  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!isIpAllowed(clientIp, process.env.ADMIN_ALLOWED_IPS)) {
    return json(res, 403, { ok: false, error: "Access denied from this IP." });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { ok: false, error: "Supabase environment variables are missing." });
  }

  try {
    const payload = await readJsonBody(req);
    const email = String(payload?.email || "").trim().toLowerCase();
    const password = String(payload?.password || "");
    const name = String(payload?.name || "Admin User").trim() || "Admin User";

    if (!email || !password) {
      return json(res, 400, { ok: false, error: "Email and password are required." });
    }

    if (password.length < 8) {
      return json(res, 400, { ok: false, error: "Password must be at least 8 characters." });
    }

    const listResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
      headers: adminHeaders(),
    });
    const listData = await listResponse.json().catch(() => ({}));
    if (!listResponse.ok) {
      return json(res, 502, { ok: false, error: listData?.msg || listData?.message || "Failed to inspect existing admin users." });
    }

    const existingUser = Array.isArray(listData?.users)
      ? listData.users.find((user) => String(user?.email || "").trim().toLowerCase() === email)
      : null;

    if (existingUser?.id) {
      const updateResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({
          password,
          email_confirm: true,
          app_metadata: { role: "admin" },
          user_metadata: { name, role: "admin" },
        }),
      });
      const updateData = await updateResponse.json().catch(() => ({}));
      if (!updateResponse.ok) {
        return json(res, 502, { ok: false, error: updateData?.msg || updateData?.message || "Failed to update admin credentials." });
      }

      return json(res, 200, {
        ok: true,
        success: true,
        updated: true,
        message: "Admin credentials updated successfully. You can now log in.",
        userId: existingUser.id,
        email,
      });
    }

    const createResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: { name, role: "admin" },
      }),
    });
    const createData = await createResponse.json().catch(() => ({}));
    if (!createResponse.ok || !createData?.id) {
      const userId = createData?.user?.id;
      if (!createResponse.ok && userId) {
        return json(res, 200, {
          ok: true,
          success: true,
          updated: false,
          message: "Admin user created successfully.",
          userId,
          email,
        });
      }

      return json(res, 502, { ok: false, error: createData?.msg || createData?.message || "Failed to create admin user." });
    }

    return json(res, 200, {
      ok: true,
      success: true,
      updated: false,
      message: "Admin user created successfully.",
      userId: createData.id,
      email,
    });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected admin signup error." });
  }
}
