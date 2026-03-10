function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf("=");
      if (index < 0) return acc;
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function normalizeRole(user) {
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role;
  if (Array.isArray(role)) {
    return role.map((item) => String(item).toLowerCase());
  }

  if (typeof role === "string") {
    return [role.toLowerCase()];
  }

  return [];
}

function extractBearerToken(authorizationHeader) {
  const raw = String(authorizationHeader || "").trim();
  if (!raw.toLowerCase().startsWith("bearer ")) return "";
  return raw.slice(7).trim();
}

function firstHeaderValue(value) {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

function getAccessTokenFromRequest(req) {
  const headerToken = firstHeaderValue(req.headers["x-admin-token"]);
  if (headerToken) return headerToken;

  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = decodeURIComponent(cookies.sd_admin_token || "").trim();
  if (cookieToken) return cookieToken;

  return extractBearerToken(req.headers.authorization);
}

export function buildAdminCookie(token, maxAgeSeconds = 3600) {
  const secure = process.env.NODE_ENV === "production";
  const secureSegment = secure ? "; Secure" : "";
  return `sd_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secureSegment}`;
}

export function clearAdminCookie() {
  const secure = process.env.NODE_ENV === "production";
  const secureSegment = secure ? "; Secure" : "";
  return `sd_admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureSegment}`;
}

async function fetchSupabaseUser(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, error: "Supabase auth environment variables are missing." };
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    return { ok: false, status: 401, error: message || "Invalid session." };
  }

  const user = await response.json().catch(() => null);
  if (!user) {
    return { ok: false, status: 401, error: "Invalid session." };
  }

  return { ok: true, user };
}

export async function requireAdminUser(req) {
  const accessToken = getAccessTokenFromRequest(req);
  if (!accessToken) {
    return { ok: false, status: 401, error: "Not authenticated." };
  }

  const userResult = await fetchSupabaseUser(accessToken);
  if (!userResult.ok) {
    return { ok: false, status: userResult.status || 401, error: "Invalid or expired admin session." };
  }

  const roles = normalizeRole(userResult.user);
  if (!roles.includes("admin")) {
    return { ok: false, status: 403, error: "Admin role required." };
  }

  return { ok: true, user: userResult.user, accessToken };
}
