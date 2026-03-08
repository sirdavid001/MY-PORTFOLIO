import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

function jsonResponse(data, { ok = true, status = ok ? 200 : 500 } = {}) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

function mockFetch(input) {
  const url = typeof input === "string" ? input : input?.url;

  if (url === "/api/location") {
    return Promise.resolve(
      jsonResponse({
        ok: true,
        countryCode: "US",
        countryName: "United States",
        currency: "USD",
        source: "test-server-location",
      })
    );
  }

  if (url === "https://ipapi.co/json/") {
    return Promise.resolve(
      jsonResponse({
        country_code: "US",
        country_name: "United States",
        currency: "USD",
      })
    );
  }

  if (url === "https://ipwho.is/") {
    return Promise.resolve(jsonResponse({ success: false }, { ok: false, status: 503 }));
  }

  if (url === "https://open.er-api.com/v6/latest/USD") {
    return Promise.resolve(
      jsonResponse({
        rates: {
          USD: 1,
          NGN: 1600,
        },
      })
    );
  }

  if (url === "/api/shop/config") {
    return Promise.resolve(jsonResponse({ ok: false }));
  }

  if (url === "/api/payments/paystack/public-key") {
    return Promise.resolve(jsonResponse({ ok: false }, { ok: false, status: 404 }));
  }

  if (url === "/api/admin/session") {
    return Promise.resolve(jsonResponse({ ok: false }, { ok: false, status: 401 }));
  }

  throw new Error(`Unhandled fetch in smoke test: ${url}`);
}

function renderAppAt(pathname) {
  window.history.pushState({}, "", pathname);

  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

describe("App smoke tests", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(mockFetch));
  });

  it("renders the portfolio home page", async () => {
    renderAppAt("/");

    expect(await screen.findByRole("heading", { name: /hi, i'm sirdavid/i })).toBeInTheDocument();
  });

  it("renders the projects page", async () => {
    renderAppAt("/projects");

    expect(await screen.findByRole("heading", { name: /^projects$/i })).toBeInTheDocument();
    expect(screen.getByText(/real work and practical products from my github/i)).toBeInTheDocument();
  });

  it("renders the contact page", async () => {
    renderAppAt("/contact");

    expect(await screen.findByRole("heading", { name: /tell me about your project/i })).toBeInTheDocument();
    expect(screen.getByText(/project request form/i)).toBeInTheDocument();
  });

  it("renders the storefront on shop routes", async () => {
    renderAppAt("/shop");

    expect(await screen.findByText(/^sirdavid gadgets$/i)).toBeInTheDocument();
    expect(screen.getByText(/premium storefront/i)).toBeInTheDocument();
  });

  it("renders the tracking page on tracking routes", async () => {
    renderAppAt("/track-order");

    expect(await screen.findByRole("heading", { name: /track your package/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /track order/i })).toBeInTheDocument();
  });

  it("renders the admin login view when no admin session exists", async () => {
    renderAppAt("/secure-admin-portal-xyz");

    expect(await screen.findByPlaceholderText(/admin email/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /store command center/i })).toBeInTheDocument();
  });
});
