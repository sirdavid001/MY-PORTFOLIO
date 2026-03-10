import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderAppAt, selectOption, setupPaystackMock } from "./app-test-utils";

describe("Portfolio button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("downloads and emails the CV from the home page", async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderAppAt("/");

    fireEvent.click(await screen.findByRole("button", { name: /download cv \(pdf\)/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/cv-download?format=pdf"),
        expect.objectContaining({ cache: "no-store" })
      );
    });
    expect(anchorClickSpy).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/email address to receive cv/i), {
      target: { value: "builder@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /email my pdf cv/i }));

    expect(await screen.findByText(/my pdf cv has been sent to builder@example.com/i)).toBeInTheDocument();

    anchorClickSpy.mockRestore();
  });
});

describe("Shop button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds items to cart, opens checkout, and clears the cart", async () => {
    renderAppAt("/shop");

    expect(await screen.findByText(/apple iphone xr/i)).toBeInTheDocument();

    fireEvent.click((await screen.findAllByRole("button", { name: /^add$/i }))[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /cart/i })[0]);

    fireEvent.click(await screen.findByRole("button", { name: /^checkout$/i }));

    expect(await screen.findByRole("heading", { name: /cart & checkout/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear cart/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /your cart is empty/i })).toBeInTheDocument();
    });
  });

  it("navigates to the tracking page and back to the shop from the empty-state actions", async () => {
    renderAppAt("/shop");

    expect(await screen.findByText(/apple iphone xr/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /^track order$/i })[0]);

    expect(await screen.findByRole("heading", { name: /track your order/i })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/ord-1234567890/i), {
      target: { value: "UNKNOWN-REF" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: /track order/i }).at(-1));

    expect(await screen.findByRole("heading", { name: /order not found/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /browse products/i }));

    expect(await screen.findByText(/apple iphone xr/i)).toBeInTheDocument();
  });

  it("shows local storefront currency from the detected location", async () => {
    renderAppAt("/shop", {
      countryCode: "US",
      countryName: "United States",
      currency: "USD",
      browserLocationOk: false,
      exchangeRates: { USD: 1, NGN: 1600 },
    });

    expect(await screen.findByText("$175.00")).toBeInTheDocument();
  });

  it("keeps the detected currency when the exchange-rate lookup fails", async () => {
    renderAppAt("/shop", {
      countryCode: "US",
      countryName: "United States",
      currency: "USD",
      exchangeRatesOk: false,
    });

    expect(await screen.findByText("$175.00")).toBeInTheDocument();
  });

  it("runs checkout with a configured supported currency", async () => {
    const checkoutSpy = setupPaystackMock();

    renderAppAt("/shop", {
      countryCode: "GH",
      countryName: "Ghana",
      currency: "GHS",
      publicKey: "pk_test_123",
      exchangeRates: { USD: 1, GHS: 15.5, NGN: 1600 },
    });

    fireEvent.click((await screen.findAllByRole("button", { name: /^add$/i }))[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /cart/i })[0]);
    fireEvent.click(await screen.findByRole("button", { name: /^checkout$/i }));

    fireEvent.change(screen.getByPlaceholderText(/chukwuemeka obi/i), {
      target: { value: "Buyer Example" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "buyer@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/12 admiralty way/i), {
      target: { value: "12 Admiralty Way" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. lagos/i), {
      target: { value: "Accra" },
    });

    await waitFor(() => {
      expect(screen.queryByText(/payment system not configured/i)).not.toBeInTheDocument();
    });

    const payButton = screen
      .getAllByRole("button", { name: /pay/i })
      .find((button) => !button.hasAttribute("disabled"));

    fireEvent.click(payButton);

    await waitFor(() => {
      expect(
        fetch.mock.calls.some(
          ([url, init]) =>
            String(url).includes("/api/send-order") &&
            String(init?.method || "").toUpperCase() === "POST"
        )
      ).toBe(true);
    });
    expect(checkoutSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Admin button actions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("signs in to admin, switches tabs, and logs out", async () => {
    renderAppAt("/secure-admin-portal-xyz");

    fireEvent.change(await screen.findByLabelText(/email address/i), {
      target: { value: "admin@sirdavid.site" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "super-secret-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in to dashboard/i }));

    expect(await screen.findByText(/payment-confirmed orders only/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /products/i }));
    expect(await screen.findByText(/products management/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /shipping/i }));
    expect(await screen.findByText(/shipping mode/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(await screen.findByRole("button", { name: /sign in to dashboard/i })).toBeInTheDocument();
  });

  it("adds, edits, and deletes products from admin product management", async () => {
    renderAppAt("/secure-admin-portal-xyz", { authedAdmin: true });

    fireEvent.click(await screen.findByRole("button", { name: /products/i }));
    expect(await screen.findByText(/products management/i)).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("1600"), {
      target: { value: "1700" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save rate/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/settings/exchange-rate"),
        expect.objectContaining({ method: "PUT" })
      );
    });
    expect(screen.getByText(/active: ₦1,700 \/ \$1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add product/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    const [categorySelect, brandSelect] = within(dialog).getAllByRole("combobox");

    await selectOption(categorySelect, "Phones");
    await selectOption(brandSelect, "Apple");

    fireEvent.change(within(dialog).getByLabelText(/product name/i), {
      target: { value: "QA Test Phone" },
    });
    fireEvent.change(within(dialog).getByLabelText(/price \(ngn\)/i), {
      target: { value: "320000" },
    });
    fireEvent.change(within(dialog).getByPlaceholderText(/paste an image url/i), {
      target: { value: "https://example.com/qa-test-phone.jpg" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /add url/i }));
    fireEvent.click(within(dialog).getByRole("button", { name: /create product/i }));

    expect(await screen.findByText(/qa test phone/i)).toBeInTheDocument();

    const createdRow = screen.getByText(/qa test phone/i).closest("tr");
    const [editButton] = within(createdRow).getAllByRole("button");
    fireEvent.click(editButton);

    const editDialog = await screen.findByRole("dialog");
    const nameInput = within(editDialog).getByLabelText(/product name/i);
    fireEvent.change(nameInput, { target: { value: "QA Test Phone Updated" } });
    fireEvent.click(within(editDialog).getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/qa test phone updated/i)).toBeInTheDocument();

    const updatedRow = screen.getByText(/qa test phone updated/i).closest("tr");
    const [, deleteButton] = within(updatedRow).getAllByRole("button");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/qa test phone updated/i)).not.toBeInTheDocument();
    });
  });

  it("updates shipping settings from the shipping tab", async () => {
    renderAppAt("/secure-admin-portal-xyz", { authedAdmin: true });

    fireEvent.click(await screen.findByRole("button", { name: /shipping/i }));
    expect(await screen.findByText(/shipping mode/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/flat rate \(usd\)/i), {
      target: { value: "25" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save shipping settings/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/shipping"),
        expect.objectContaining({ method: "PUT" })
      );
    });
  });
});
