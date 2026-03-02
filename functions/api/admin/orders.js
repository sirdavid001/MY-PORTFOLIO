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
  const provided = request.headers.get("x-admin-key");
  return Boolean(env.ADMIN_DASHBOARD_KEY) && provided === env.ADMIN_DASHBOARD_KEY;
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
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
      return json({ ok: false, error: message }, 502);
    }

    const orders = await response.json();
    return json({ ok: true, orders });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
