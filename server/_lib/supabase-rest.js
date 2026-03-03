function buildHeaders(baseHeaders = {}) {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    ...baseHeaders,
  };
}

export function getSupabaseServerConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return {
      ok: false,
      error: "Supabase environment variables are missing.",
    };
  }

  return {
    ok: true,
    url,
    serviceRoleKey,
  };
}

export async function supabaseRest(path, options = {}) {
  const config = getSupabaseServerConfig();
  if (!config.ok) {
    return {
      ok: false,
      status: 500,
      error: config.error,
      raw: "",
    };
  }

  const method = options.method || "GET";
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method,
    headers: buildHeaders(options.headers),
    body: options.body,
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: text,
      raw: text,
    };
  }

  return {
    ok: true,
    status: response.status,
    raw: text,
    data: text ? JSON.parse(text) : null,
  };
}

export function normalizeSupabaseError(rawText, action, missingTableHint = "") {
  const text = String(rawText || "").trim();
  if (!text) return `${action} failed.`;

  try {
    const parsed = JSON.parse(text);
    if (parsed?.code === "PGRST205") {
      return missingTableHint || `${action} failed because the required table is missing.`;
    }

    if (parsed?.message) {
      return `${action} failed: ${parsed.message}`;
    }
  } catch {
    // Fallback below.
  }

  return `${action} failed: ${text}`;
}
