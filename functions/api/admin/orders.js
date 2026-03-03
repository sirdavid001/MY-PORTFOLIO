function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type, x-admin-key",
    },
  });
}

function isAuthorized(request, env) {
  const provided = String(request.headers.get("x-admin-key") || "").trim();
  const expected = String(env.ADMIN_DASHBOARD_KEY || "").trim();
  return Boolean(expected) && provided === expected;
}

function normalizeSupabaseError(rawText, action) {
  const text = String(rawText || "").trim();
  if (!text) return `${action} failed.`;

  try {
    const parsed = JSON.parse(text);
    if (parsed?.code === "PGRST205") {
      return "Supabase table public.orders is missing. Create it in Supabase SQL Editor using the schema in README.md.";
    }

    if (parsed?.message) {
      return `${action} failed: ${parsed.message}`;
    }
  } catch {
    // Keep fallback below.
  }

  return `${action} failed: ${text}`;
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.ADMIN_DASHBOARD_KEY || !String(env.ADMIN_DASHBOARD_KEY).trim()) {
      return json({ ok: false, error: "ADMIN_DASHBOARD_KEY is not configured." }, 500);
    }

    if (!isAuthorized(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: "Supabase environment variables are missing." }, 500);
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/orders?select=id,reference,customer_name,customer_email,customer_phone,country,total,currency,status,created_at,items&order=created_at.desc&limit=200`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const message = await response.text();
      return json({ ok: false, error: normalizeSupabaseError(message, "Load orders") }, 502);
    }

    const orders = await response.json();
    return json({ ok: true, orders });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
