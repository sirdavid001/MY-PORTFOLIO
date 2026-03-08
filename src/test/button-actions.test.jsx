import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { formatMoney } from "../lib/pricing";

function jsonResponse(data, { ok = true, status = ok ? 200 : 500 } = {}) {
  return {
    ok,
    status,
    json: async () => data,
  };
}

function createFetchMock({
  authedAdmin = false,
  countryCode = "US",
  countryName = "United States",
  currency = "USD",
  exchangeRatesOk = true,
  publicKey = "",
  supportedCurrencies = ["NGN", "USD", "GHS", "KES", "ZAR", "XOF"],
  applePayCurrencies = ["NGN", "USD", "GHS", "KES"],
  rates = {
    USD: 1,
    NGN: 1600,
  },
} = {}) {
  return vi.fn((input) => {
    const url = typeof input === "string" ? input : input?.url;

    if (url === "https://ipapi.co/json/") {
      return Promise.resolve(
        jsonResponse({
          country_code: countryCode,
          country_name: countryName,
          currency,
        })
      );
    }

    if (url === "https://ipwho.is/") {
      return Promise.resolve(jsonResponse({ success: false }, { ok: false, status: 503 }));
    }

    if (url === "https://open.er-api.com/v6/latest/USD") {
      if (!exchangeRatesOk) {
        return Promise.resolve(jsonResponse({ result: "error" }, { ok: false, status: 503 }));
      }

      return Promise.resolve(
        jsonResponse({
          rates,
        })
      );
    }

    if (url === "/api/shop/config") {
      return Promise.resolve(jsonResponse({ ok: false }));
    }

    if (url === "/api/payments/paystack/public-key") {
      if (!publicKey) {
        return Promise.resolve(jsonResponse({ ok: false }, { ok: false, status: 404 }));
      }

      return Promise.resolve(
        jsonResponse({
          ok: true,
          key: publicKey,
          supportedCurrencies,
          applePayCurrencies,
        })
      );
    }

    if (url === "/api/admin/session") {
      if (!authedAdmin) {
        return Promise.resolve(jsonResponse({ ok: false }, { ok: false, status: 401 }));
      }

      return Promise.resolve(
        jsonResponse({
          ok: true,
          user: {
            email: "admin@sirdavid.site",
          },
        })
      );
    }

    if (url === "/api/admin/orders") {
      return Promise.resolve(
        jsonResponse({
          ok: true,
          orders: [
            {
              id: 1,
              reference: "SD-12345678",
              customer_name: "Jane Doe",
              customer_email: "jane@example.com",
              customer_phone: "+1234567890",
              address: "10 Main Street",
              city: "Lagos",
              country: "Nigeria",
              payment_method: "Paystack",
              currency: "NGN",
              subtotal: 100000,
              shipping: 15000,
              total: 115000,
              items: [
                {
                  id: "iphone-15",
                  name: "Apple iPhone 15",
                  quantity: 1,
                  unitPrice: 100000,
                },
              ],
              status: "new",
              created_at: "2026-03-01T10:00:00.000Z",
            },
          ],
        })
      );
    }

    if (url === "/api/admin/products") {
      return Promise.resolve(
        jsonResponse({
          ok: true,
          products: [
            {
              id: "iphone-15",
              name: "Apple iPhone 15",
              brand: "Apple",
              category: "Phones",
              condition: "New",
              basePriceUsd: 650,
              stock: 4,
              details: "Factory unlocked and fully tested.",
              images: ["https://example.com/iphone-15.jpg"],
              isActive: true,
            },
          ],
        })
      );
    }

    if (url === "/api/admin/shipping") {
      return Promise.resolve(
        jsonResponse({
          ok: true,
          shipping: {
            mode: "flat",
            flatUsd: 15,
            percentRate: 0.03,
            minUsd: 15,
          },
        })
      );
    }

    throw new Error(`Unhandled fetch in button test: ${url}`);
  });
}

function renderAppAt(pathname, options = {}) {
  window.history.pushState({}, "", pathname);
  vi.stubGlobal("fetch", createFetchMock(options));

  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

describe("Shop button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds items to cart, opens checkout, and clears the cart", async () => {
    renderAppAt("/shop");

    expect(await screen.findByText(/high-end gadgets with secure, fast checkout/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /add to cart/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cart \(1\)/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /^go to cart$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^go to cart$/i }));

    expect(await screen.findByRole("heading", { name: /complete your order/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear cart/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /your cart is empty/i })).toBeInTheDocument();
    });
  });

  it("runs the hero action buttons", async () => {
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    renderAppAt("/shop");

    expect(await screen.findByText(/high-end gadgets with secure, fast checkout/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /browse catalog/i }));
    expect(scrollSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /track existing order/i }));

    expect(await screen.findByRole("heading", { name: /track your package/i })).toBeInTheDocument();
  });

  it("shows local storefront currency from the detected location", async () => {
    renderAppAt("/shop", {
      countryCode: "US",
      countryName: "United States",
      currency: "USD",
      rates: { USD: 1, NGN: 1600 },
    });

    expect(await screen.findByText(formatMoney(520, "USD"))).toBeInTheDocument();
  });

  it("keeps the detected currency when the exchange-rate lookup fails", async () => {
    renderAppAt("/shop", {
      countryCode: "US",
      countryName: "United States",
      currency: "USD",
      exchangeRatesOk: false,
    });

    expect(await screen.findByText(formatMoney(520, "USD"))).toBeInTheDocument();
  });

  it("allows checkout readiness for configured non-USD paystack currencies", async () => {
    renderAppAt("/shop", {
      countryCode: "GH",
      countryName: "Ghana",
      currency: "GHS",
      publicKey: "pk_test_123",
      supportedCurrencies: ["NGN", "USD", "GHS", "KES", "ZAR", "XOF"],
      rates: { USD: 1, GHS: 15.5, NGN: 1600 },
    });

    fireEvent.click(await screen.findAllByRole("button", { name: /add to cart/i }).then((buttons) => buttons[0]));
    fireEvent.click(await screen.findByRole("button", { name: /go to cart & checkout/i }));

    const emailInput = await screen.findByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: "buyer@example.com" } });

    expect(await screen.findByText(/checkout is ready/i)).toBeInTheDocument();
  });
});

describe("Admin button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("navigates admin sections and opens edit mode from gadget actions", async () => {
    renderAppAt("/secure-admin-portal-xyz/orders", { authedAdmin: true });

    expect(await screen.findByRole("heading", { name: /^orders$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /shipping configure checkout shipping rules/i }));
    expect(await screen.findByRole("heading", { name: /shipping settings/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /gadgets list manage all listed products/i }));
    expect(await screen.findByRole("heading", { name: /gadget list/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(await screen.findByRole("heading", { name: /edit gadget/i })).toBeInTheDocument();
  });
});
