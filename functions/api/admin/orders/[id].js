function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "PATCH, OPTIONS",
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

export async function onRequestPatch(context) {
  try {
    const { request, env, params } = context;
    if (!env.ADMIN_DASHBOARD_KEY || !String(env.ADMIN_DASHBOARD_KEY).trim()) {
      return json({ ok: false, error: "ADMIN_DASHBOARD_KEY is not configured." }, 500);
    }

    if (!isAuthorized(request, env)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const id = Number(params?.id);
    if (!id) return json({ ok: false, error: "Invalid order id." }, 400);

    const payload = await request.json();
    const status = String(payload?.status || "").trim();
    const allowed = new Set(["new", "processing", "paid", "shipped", "completed", "cancelled"]);
    if (!allowed.has(status)) {
      return json({ ok: false, error: "Invalid status." }, 400);
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      return json({ ok: false, error: "Supabase environment variables are missing." }, 500);
    }

    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const message = await response.text();
      return json({ ok: false, error: normalizeSupabaseError(message, "Update order status") }, 502);
    }

    const rows = await response.json();
    return json({ ok: true, order: rows?.[0] || null });
  } catch (error) {
    return json({ ok: false, error: error?.message || "Unexpected error." }, 500);
  }
}
