import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";
import { router } from "../shop/routes";

const EDGE_FUNCTION_PREFIX = "/functions/v1/make-server-bda4aae5";
const SHOP_PATHS = new Set([
  "/shop",
  "/cart",
  "/track-order",
  "/terms-and-conditions",
  "/refund-policy",
  "/privacy-policy",
  "/faqs",
  "/legal",
  "/shipping-policy",
  "/admin-setup-first-time",
  "/secure-admin-portal-xyz",
]);

export const DEFAULT_PRODUCTS = [
  {
    id: "product_1773047103794",
    name: "Apple iPhone XR",
    brand: "Apple",
    model: "iPhone XR",
    category: "Phones",
    condition: "New",
    priceUSD: 175,
    details: "The iPhone XR delivers reliable battery life with Face ID and the A12 Bionic chip.",
    images: ["https://example.com/iphone-xr.jpg"],
    specs: ['6.1" Liquid Retina display', "64GB", "Face ID"],
    isActive: true,
    storageGb: "64GB",
    batteryHealth: 89,
    networkLock: "Unlocked",
    createdAt: "2026-03-09T09:05:03.794Z",
    updatedAt: "2026-03-09T09:05:03.794Z",
  },
  {
    id: "product_1773054904509",
    name: "Apple iPhone 7",
    brand: "Apple",
    model: "iPhone 7",
    category: "Phones",
    condition: "New",
    priceUSD: 120,
    details: "A dependable classic with Touch ID and a compact design.",
    images: [],
    specs: ['4.7" Retina HD display', "32GB", "Touch ID"],
    isActive: true,
    storageGb: "32GB",
    batteryHealth: 80,
    networkLock: "Unlocked",
    createdAt: "2026-03-09T11:15:04.509Z",
    updatedAt: "2026-03-09T11:15:04.509Z",
  },
];

const DEFAULT_ORDERS = [
  {
    id: "order_1",
    reference: "ORD-1234567890",
    checkout: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+2348012345678",
      address: "10 Main Street",
      city: "Lagos",
      country: "Nigeria",
      paymentMethod: "Paystack",
      notes: "Leave at the reception desk.",
    },
    currency: "USD",
    subtotal: 175,
    shipping: 10,
    total: 185,
    items: [
      {
        id: "product_1773047103794",
        name: "Apple iPhone XR",
        quantity: 1,
        price: 175,
      },
    ],
    status: "paid",
    trackingNumber: "TRK-1234567890",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
];

const DEFAULT_TRACK_ORDER = {
  id: "order_1",
  reference: "ORD-1234567890",
  checkout: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+2348012345678",
    address: "10 Main Street",
    city: "Lagos",
    country: "Nigeria",
    paymentMethod: "Paystack",
  },
  currency: "USD",
  subtotal: 175,
  shipping: 10,
  total: 185,
  items: [
    {
      id: "product_1773047103794",
      name: "Apple iPhone XR",
      quantity: 1,
      price: 175,
    },
  ],
  status: "processing",
  trackingNumber: "TRK-1234567890",
  createdAt: "2026-03-01T10:00:00.000Z",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

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

function parseBody(input, init) {
  const rawBody = init?.body || (typeof input !== "string" ? input?.body : undefined);
  if (!rawBody || rawBody instanceof FormData) return rawBody;
  if (typeof rawBody !== "string") return rawBody;

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function requireAdmin(authenticated) {
  if (!authenticated) {
    return jsonResponse({ error: "Unauthorized" }, { ok: false, status: 401 });
  }

  return null;
}

export function createFetchMock({
  authedAdmin = false,
  countryCode = "NG",
  countryName = "Nigeria",
  currency = "NGN",
  apiLocationOk = true,
  browserLocationOk = true,
  exchangeRatesOk = true,
  publicKey = "pk_test_default",
  exchangeRates = {
    USD: 1,
    NGN: 1600,
    GHS: 15.5,
    KES: 130,
    ZAR: 18.2,
    XOF: 610,
  },
  products = DEFAULT_PRODUCTS,
  orders = DEFAULT_ORDERS,
  shippingSettings = {
    mode: "flat",
    flatAmount: 10,
    percentAmount: 0,
    freeThreshold: 0.01,
  },
  trackOrder = DEFAULT_TRACK_ORDER,
  sendCvOk = true,
  loginFails = false,
} = {}) {
  let isAuthenticated = authedAdmin;
  let ngnPerUsd = 1600;
  let mutableProducts = clone(products);
  let mutableOrders = clone(orders);
  let mutableShippingSettings = { ...shippingSettings };

  return vi.fn(async (input, init = {}) => {
    const url = normalizeRequestUrl(input);
    const method = getMethod(input, init);
    const body = parseBody(input, init);

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

    if (url === "/api/shop/config") {
      return jsonResponse({
        products: mutableProducts.filter((product) => product.isActive !== false),
        shipping: mutableShippingSettings,
      });
    }

    if (url === "/api/payments/paystack/public-key") {
      if (!publicKey) {
        return jsonResponse({ error: "Payment system not configured" }, { ok: false, status: 404 });
      }

      return jsonResponse({ publicKey });
    }

    if (url === "/api/send-order" && method === "POST") {
      return jsonResponse({
        success: true,
        reference: body?.reference || "ORD-NEW-REFERENCE",
      });
    }

    if (url.startsWith("/api/payments/paystack/verify?") || url.startsWith("/api/payments/paystack/verify/")) {
      return jsonResponse({
        ok: true,
        paid: true,
        data: { status: "success" },
      });
    }

    if (url.startsWith("/api/track-order/")) {
      const ref = decodeURIComponent(url.replace("/api/track-order/", ""));
      const matchesReference =
        ref === trackOrder.reference || ref === trackOrder.trackingNumber || ref === "ORD-1234567890";

      if (!matchesReference) {
        return jsonResponse({ success: false });
      }

      return jsonResponse({
        success: true,
        order: trackOrder,
      });
    }

    if (url === "/api/admin/session") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      return jsonResponse({
        success: true,
        user: {
          email: "admin@sirdavid.site",
        },
      });
    }

    if (url === "/api/admin/login" && method === "POST") {
      if (loginFails) {
        return jsonResponse({ error: "Invalid credentials" }, { ok: false, status: 401 });
      }

      isAuthenticated = true;
      return jsonResponse({
        success: true,
        token: "test-admin-token",
      });
    }

    if (url === "/api/admin/logout" && method === "POST") {
      isAuthenticated = false;
      return jsonResponse({ success: true });
    }

    if (url === "/api/admin/orders" && method === "GET") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      return jsonResponse({ orders: mutableOrders });
    }

    if (url.startsWith("/api/admin/orders/") && method === "PUT") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      const orderId = url.replace("/api/admin/orders/", "");
      mutableOrders = mutableOrders.map((order) =>
        order.id === orderId ? { ...order, ...body } : order
      );

      return jsonResponse({ success: true });
    }

    if (url === "/api/admin/products" && method === "GET") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      return jsonResponse({ products: mutableProducts });
    }

    if (url === "/api/admin/products" && method === "POST") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      const newProduct = {
        id: `product_${Date.now()}`,
        createdAt: "2026-03-10T10:00:00.000Z",
        updatedAt: "2026-03-10T10:00:00.000Z",
        condition: "New",
        details: "",
        images: [],
        specs: [],
        isActive: true,
        ...body,
      };

      mutableProducts = [newProduct, ...mutableProducts];
      return jsonResponse({ success: true, product: newProduct });
    }

    if (url.startsWith("/api/admin/products/") && method === "PUT") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      const productId = url.replace("/api/admin/products/", "");
      let updatedProduct = null;

      mutableProducts = mutableProducts.map((product) => {
        if (product.id !== productId) return product;
        updatedProduct = {
          ...product,
          ...body,
          updatedAt: "2026-03-10T10:00:00.000Z",
        };
        return updatedProduct;
      });

      return jsonResponse({ success: true, product: updatedProduct });
    }

    if (url.startsWith("/api/admin/products/") && method === "DELETE") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      const productId = url.replace("/api/admin/products/", "");
      mutableProducts = mutableProducts.filter((product) => product.id !== productId);
      return jsonResponse({ success: true });
    }

    if (url === "/api/admin/upload-image" && method === "POST") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      return jsonResponse({
        url: "https://example.com/uploaded-product-image.jpg",
      });
    }

    if (url === "/api/admin/shipping" && method === "GET") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      return jsonResponse({
        settings: mutableShippingSettings,
      });
    }

    if (url === "/api/admin/shipping" && method === "PUT") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      mutableShippingSettings = {
        ...mutableShippingSettings,
        ...body,
      };

      return jsonResponse({
        success: true,
        settings: mutableShippingSettings,
      });
    }

    if (url === "/api/settings/exchange-rate") {
      return jsonResponse({ ngnPerUsd });
    }

    if (url === "/api/admin/settings/exchange-rate" && method === "PUT") {
      const failure = requireAdmin(isAuthenticated);
      if (failure) return failure;

      ngnPerUsd = Number(body?.ngnPerUsd) || ngnPerUsd;
      return jsonResponse({ success: true, ngnPerUsd });
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

export function setupPaystackMock() {
  const checkoutSpy = vi.fn().mockResolvedValue(undefined);

  function PaystackPopMock() {}
  PaystackPopMock.prototype.checkout = checkoutSpy;
  PaystackPopMock.prototype.newTransaction = checkoutSpy;
  PaystackPopMock.prototype.resumeTransaction = checkoutSpy;
  PaystackPopMock.prototype.paymentRequest = checkoutSpy;

  window.PaystackPop = PaystackPopMock;
  return checkoutSpy;
}

export function renderAppAt(pathname, options = {}) {
  if (options.authedAdmin) {
    window.localStorage.setItem("adminToken", "test-admin-token");
  } else {
    window.localStorage.removeItem("adminToken");
  }

  vi.stubGlobal("fetch", createFetchMock(options));
  window.history.pushState({}, "", pathname);
  window.dispatchEvent(new PopStateEvent("popstate"));

  const normalizedPathname = pathname.split("?")[0];
  const isShopPath = normalizedPathname.startsWith("/product/") || SHOP_PATHS.has(normalizedPathname);
  if (isShopPath) {
    void router.navigate(pathname);
  }

  return render(<App />);
}

export async function selectOption(trigger, optionName) {
  fireEvent.pointerDown(trigger);
  fireEvent.click(trigger);

  const optionText = (
    await screen.findAllByText((content, element) => {
      const text = content.trim();
      return text === optionName && Boolean(element?.closest('[data-slot="select-item"]'));
    })
  )[0];

  fireEvent.click(optionText.closest('[data-slot="select-item"]') || optionText);
}
