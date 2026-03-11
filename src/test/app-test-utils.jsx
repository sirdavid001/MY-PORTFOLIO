import { render } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

const EDGE_FUNCTION_PREFIX = "/functions/v1/make-server-bda4aae5";

function jsonResponse(data, { ok = true, status = ok ? 200 : 500 } = {}) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => (typeof data === "string" ? data : JSON.stringify(data)),
    blob: async () =>
      new Blob([typeof data === "string" ? data : JSON.stringify(data)], {
        type: "application/octet-stream",
      }),
  };
}

function normalizeRequestUrl(input) {
  const raw = typeof input === "string" ? input : input?.url || "";
  if (!raw) return "";

  try {
    const url = new URL(raw, window.location.origin);
    const path = `${url.pathname}${url.search}`;
    return path.startsWith(EDGE_FUNCTION_PREFIX) ? path.slice(EDGE_FUNCTION_PREFIX.length) : path;
  } catch {
    return raw.startsWith(EDGE_FUNCTION_PREFIX) ? raw.slice(EDGE_FUNCTION_PREFIX.length) : raw;
  }
}

function getMethod(input, init) {
  return String(init?.method || (typeof input !== "string" ? input?.method : "") || "GET").toUpperCase();
}

export function createFetchMock({
  countryCode = "NG",
  countryName = "Nigeria",
  currency = "NGN",
  apiLocationOk = true,
  browserLocationOk = true,
  exchangeRatesOk = true,
  exchangeRates = {
    USD: 1,
    NGN: 1600,
    GHS: 15.5,
    KES: 130,
    ZAR: 18.2,
    XOF: 610,
  },
  sendCvOk = true,
} = {}) {
  return vi.fn(async (input, init = {}) => {
    const url = normalizeRequestUrl(input);
    const method = getMethod(input, init);

    if (url === "/api/location") {
      if (!apiLocationOk) {
        return jsonResponse({ ok: false }, { ok: false, status: 404 });
      }

      return jsonResponse({
        ok: true,
        country: countryCode,
        countryCode,
        countryName,
        currency,
        source: "test-server-location",
      });
    }

    if (url === "https://ipapi.co/json/" || url === "/json/") {
      if (!browserLocationOk) {
        return jsonResponse({}, { ok: false, status: 503 });
      }

      return jsonResponse({
        country_code: countryCode,
        country_name: countryName,
        currency,
      });
    }

    if (url === "https://ipwho.is/" || url === "/") {
      return jsonResponse({ success: false }, { ok: false, status: 503 });
    }

    if (url === "https://open.er-api.com/v6/latest/USD" || url === "/v6/latest/USD") {
      if (!exchangeRatesOk) {
        return jsonResponse({ result: "error" }, { ok: false, status: 503 });
      }

      return jsonResponse({ rates: exchangeRates });
    }

    if (url.startsWith("/api/cv-download")) {
      return jsonResponse("mock-cv-content");
    }

    if (url === "/api/send-cv" && method === "POST") {
      if (!sendCvOk) {
        return jsonResponse({ ok: false, error: "Could not send CV right now." }, { ok: false, status: 500 });
      }

      return jsonResponse({ ok: true });
    }

    throw new Error(`Unhandled fetch in test: ${method} ${url}`);
  });
}

export function renderAppAt(pathname, options = {}) {
  vi.stubGlobal("fetch", createFetchMock(options));
  window.history.pushState({}, "", pathname);
  window.dispatchEvent(new PopStateEvent("popstate"));

  return render(<App />);
}
