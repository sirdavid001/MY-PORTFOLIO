import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaApplePay, FaWallet } from "react-icons/fa6";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney, getCurrencyForCountry, getLocationFactor } from "../lib/pricing";
import { products } from "./products";

const categories = ["All", "Phones", "Laptops", "Accessories", "Gaming", "Wearables"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];
const pricingCountries = [
  { code: "US", name: "United States" },
  { code: "NG", name: "Nigeria" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "IN", name: "India" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
];

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-300/60 focus:border-cyan-500 focus:ring";

const PAYMENT_METHOD_APPLE_PAY = "Apple Pay";
const PAYMENT_METHOD_PAYSTACK = "Paystack";
const defaultCheckout = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  paymentMethod: PAYMENT_METHOD_PAYSTACK,
  notes: "",
};
const PAYSTACK_POPUP_SRC = "https://js.paystack.co/v2/inline.js";
const SUPPORTED_PAYSTACK_CURRENCIES = new Set(["NGN", "USD"]);
const PAYMENT_METHODS = [
  {
    value: PAYMENT_METHOD_APPLE_PAY,
    description: "Quick checkout on Safari/iOS devices.",
  },
  {
    value: PAYMENT_METHOD_PAYSTACK,
    description: "Cards, bank transfer, USSD, and more via Paystack.",
  },
];
const ONLINE_PAYMENT_METHODS = new Set(PAYMENT_METHODS.map((method) => method.value));

function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function toPrice(basePriceUsd, pricingContext) {
  return basePriceUsd * pricingContext.exchangeRate * pricingContext.factor;
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function getPaystackChannels(paymentMethod, currency) {
  if (paymentMethod === PAYMENT_METHOD_APPLE_PAY) {
    return currency === "NGN" ? ["apple_pay", "card", "bank_transfer"] : ["apple_pay", "card"];
  }

  if (currency === "NGN") {
    return ["card", "bank_transfer", "bank", "ussd", "qr", "eft", "mobile_money"];
  }

  return ["card"];
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const script = document.createElement("script");
    script.src = PAYSTACK_POPUP_SRC;
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error("Unable to load Paystack script."));
    document.body.appendChild(script);
  });
}

export default function ShopApp() {
  const pricingContext = usePricingContext();
  const location = useLocation();
  const navigate = useNavigate();
  const normalizedPathname = location.pathname.replace(/\/+$/, "") || "/";
  const isCartPage = normalizedPathname === "/cart";
  const [activeCategory, setActiveCategory] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [cart, setCart] = useState({});
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [checkoutErrors, setCheckoutErrors] = useState({});
  const [lastOrder, setLastOrder] = useState(null);
  const [sendStatus, setSendStatus] = useState({ state: "idle", message: "" });
  const [paymentStatus, setPaymentStatus] = useState({ state: "idle", message: "" });
  const [pricingMode, setPricingMode] = useState("auto");
  const [manualCountryCode, setManualCountryCode] = useState("US");
  const [manualCurrency, setManualCurrency] = useState("USD");
  const [resolvedPaystackPublicKey, setResolvedPaystackPublicKey] = useState(
    () => import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ""
  );

  useEffect(() => {
    setCart(loadFromStorage("sirdavidshop:cart", {}));
    const savedCheckout = loadFromStorage("sirdavidshop:checkout", null);
    if (savedCheckout) {
      const normalizedPaymentMethod = ONLINE_PAYMENT_METHODS.has(savedCheckout.paymentMethod)
        ? savedCheckout.paymentMethod
        : defaultCheckout.paymentMethod;
      setCheckout({
        ...defaultCheckout,
        ...savedCheckout,
        paymentMethod: normalizedPaymentMethod,
      });
    }
    const savedPricing = loadFromStorage("sirdavidshop:pricing", null);
    if (savedPricing) {
      setPricingMode(savedPricing.mode || "auto");
      setManualCountryCode(savedPricing.countryCode || "US");
      setManualCurrency(savedPricing.currency || "USD");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sirdavidshop:cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("sirdavidshop:checkout", JSON.stringify(checkout));
  }, [checkout]);

  useEffect(() => {
    window.localStorage.setItem(
      "sirdavidshop:pricing",
      JSON.stringify({
        mode: pricingMode,
        countryCode: manualCountryCode,
        currency: manualCurrency,
      })
    );
  }, [pricingMode, manualCountryCode, manualCurrency]);

  useEffect(() => {
    if (resolvedPaystackPublicKey) return undefined;

    let cancelled = false;

    async function fetchPaystackPublicKey() {
      try {
        const response = await fetch("/api/payments/paystack/public-key");
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && data?.ok && typeof data.key === "string" && data.key.trim()) {
          setResolvedPaystackPublicKey(data.key.trim());
        }
      } catch {
        // Keep UI behavior unchanged; checkout will show missing-key message when needed.
      }
    }

    fetchPaystackPublicKey();
    return () => {
      cancelled = true;
    };
  }, [resolvedPaystackPublicKey]);

  async function sendOrderNotification(order) {
    setSendStatus({ state: "sending", message: "Sending order notification..." });
    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setSendStatus({
          state: "error",
          message: data?.error || "Order paid, but notification sync failed.",
        });
        return false;
      }

      if (data?.persisted === false) {
        setSendStatus({
          state: "error",
          message: data?.warning || "Order paid, but dashboard persistence is not configured.",
        });
        return false;
      }

      if (data?.emailSent === false) {
        setSendStatus({
          state: "sent",
          message: data?.warning || "Order saved to dashboard. Email notification skipped.",
        });
        return true;
      }

      setSendStatus({
        state: "sent",
        message: "Order saved and notification sent successfully.",
      });
      return true;
    } catch {
      setSendStatus({
        state: "error",
        message: "Order created, but notification endpoint is unreachable.",
      });
      return false;
    }
  }

  function persistOrder(order) {
    const existingOrders = loadFromStorage("sirdavidshop:orders", []);
    const nextOrders = [order, ...existingOrders];
    window.localStorage.setItem("sirdavidshop:orders", JSON.stringify(nextOrders));
  }

  async function finalizeCardPayment(order, reference) {
    setPaymentStatus({ state: "verifying", message: "Verifying Apple Pay/Paystack payment..." });
    try {
      const verifyQuery = new URLSearchParams({
        reference,
        expected_amount_kobo: String(Math.round(Number(order.total || 0) * 100)),
        expected_currency: String(order.currency || "").toUpperCase(),
        expected_email: String(order.checkout?.email || "").trim().toLowerCase(),
      });
      const response = await fetch(`/api/payments/paystack/verify?${verifyQuery.toString()}`);
      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.paid) {
        setPaymentStatus({
          state: "error",
          message: data?.error || "Apple Pay/Paystack payment was not successful.",
        });
        return false;
      }

      const paidOrder = {
        ...order,
        paymentStatus: "paid",
        paymentReference: data.reference || reference,
      };

      persistOrder(paidOrder);
      setLastOrder(paidOrder);
      clearCart();
      setPaymentStatus({ state: "paid", message: "Payment verified successfully." });
      await sendOrderNotification(paidOrder);
      return true;
    } catch {
      setPaymentStatus({
        state: "error",
        message: "Unable to verify Apple Pay/Paystack payment at the moment.",
      });
      return false;
    }
  }

  const activePricing = useMemo(() => {
    if (pricingMode === "auto") {
      return {
        countryCode: pricingContext.countryCode,
        countryName: pricingContext.countryName,
        currency: pricingContext.currency,
        exchangeRate: pricingContext.exchangeRate,
        factor: pricingContext.factor,
      };
    }

    const countryName =
      pricingCountries.find((country) => country.code === manualCountryCode)?.name || manualCountryCode;
    const currency = manualCurrency || getCurrencyForCountry(manualCountryCode, pricingContext.currency);
    const exchangeRate = pricingContext.rates?.[currency] || (currency === "USD" ? 1 : pricingContext.exchangeRate);
    const factor = getLocationFactor(manualCountryCode);

    return {
      countryCode: manualCountryCode,
      countryName,
      currency,
      exchangeRate: exchangeRate || 1,
      factor,
    };
  }, [manualCountryCode, manualCurrency, pricingContext, pricingMode]);

  const currencyOptions = useMemo(() => {
    const baseline = ["USD", "NGN", "GBP", "EUR", "CAD", "AED", "INR", "KES", "GHS", "ZAR"];
    return Array.from(new Set([...baseline, pricingContext.currency, manualCurrency].filter(Boolean)));
  }, [manualCurrency, pricingContext.currency]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const conditionMatch =
        conditionFilter === "All" ||
        (conditionFilter === "New" ? product.condition.startsWith("New") : product.condition.startsWith("Used"));
      const searchMatch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.details.toLowerCase().includes(query);
      return categoryMatch && conditionMatch && searchMatch;
    });

    if (sortBy === "price-low") {
      return [...filtered].sort(
        (a, b) => toPrice(a.basePriceUsd, activePricing) - toPrice(b.basePriceUsd, activePricing)
      );
    }
    if (sortBy === "price-high") {
      return [...filtered].sort(
        (a, b) => toPrice(b.basePriceUsd, activePricing) - toPrice(a.basePriceUsd, activePricing)
      );
    }
    if (sortBy === "name-asc") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [activeCategory, activePricing, conditionFilter, search, sortBy]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId);
        if (!product || quantity <= 0) return null;
        const unitPrice = toPrice(product.basePriceUsd, activePricing);
        return {
          ...product,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
      })
      .filter(Boolean);
  }, [activePricing, cart]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems]
  );

  const shipping = subtotal > 0 ? Math.max(15 * activePricing.exchangeRate, subtotal * 0.03) : 0;
  const total = subtotal + shipping;
  const selectedPaymentMethod = checkout.paymentMethod;
  const isApplePaySelected = selectedPaymentMethod === PAYMENT_METHOD_APPLE_PAY;

  function createOrderDraft(paymentStatus = "pending_confirmation") {
    return {
      reference: `SD-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      shipping,
      total,
      checkout: { ...checkout },
      currency: activePricing.currency,
      countryName: activePricing.countryName,
      paymentStatus,
    };
  }

  useEffect(() => {
    const clearApplePayContainer = () => {
      const container = document.getElementById("paystack-apple-pay");
      if (container) container.innerHTML = "";
    };

    if (!ONLINE_PAYMENT_METHODS.has(checkout.paymentMethod)) {
      setPaymentStatus({ state: "idle", message: "" });
      clearApplePayContainer();
      return undefined;
    }

    if (!checkout.email || !isValidEmail(checkout.email)) {
      setPaymentStatus({
        state: "info",
        message: `Enter a valid email to enable ${checkout.paymentMethod}.`,
      });
      clearApplePayContainer();
      return undefined;
    }

    if (!SUPPORTED_PAYSTACK_CURRENCIES.has(activePricing.currency)) {
      setPaymentStatus({
        state: "error",
        message: `${checkout.paymentMethod} currently supports NGN or USD only.`,
      });
      clearApplePayContainer();
      return undefined;
    }

    if (cartItems.length === 0 || total <= 0) {
      setPaymentStatus({
        state: "info",
        message: `Add an item to cart to enable ${checkout.paymentMethod}.`,
      });
      clearApplePayContainer();
      return undefined;
    }

    const paystackPublicKey = resolvedPaystackPublicKey;
    if (!paystackPublicKey) {
      setPaymentStatus({ state: "error", message: "Missing Paystack public key." });
      clearApplePayContainer();
      return undefined;
    }

    if (checkout.paymentMethod !== PAYMENT_METHOD_APPLE_PAY) {
      setPaymentStatus({
        state: "ready",
        message: "Paystack is ready. Click Place Order or the Paystack button to continue.",
      });
      clearApplePayContainer();
      return undefined;
    }

    let cancelled = false;

    async function mountApplePayRequest() {
      setPaymentStatus({ state: "initializing", message: "Loading Apple Pay..." });
      try {
        const container = document.getElementById("paystack-apple-pay");
        if (container) container.innerHTML = "";

        const PaystackPop = await loadPaystackScript();
        const popup = new PaystackPop();
        if (typeof popup.paymentRequest !== "function") {
          setPaymentStatus({
            state: "error",
            message: "Payment request API unavailable. Use Place Order instead.",
          });
          return;
        }

        const order = createOrderDraft("pending_gateway");
        const paymentReference = `PS-${order.reference}-${Date.now()}`;

        await popup.paymentRequest({
          key: paystackPublicKey,
          email: order.checkout.email,
          amount: Math.round(order.total * 100),
          currency: order.currency,
          ref: paymentReference,
          container: "paystack-apple-pay",
          style: {
            theme: "dark",
            applePay: {
              margin: "0px",
              padding: "10px",
              width: "100%",
              borderRadius: "10px",
              type: "pay",
              locale: "en",
            },
          },
          onSuccess: async (transaction) => {
            if (cancelled) return;
            await finalizeCardPayment(order, transaction?.reference || paymentReference);
          },
          onError: () => {
            if (cancelled) return;
            setPaymentStatus({
              state: "error",
              message: "Unable to load payment options.",
            });
          },
          onCancel: () => {
            if (cancelled) return;
            setPaymentStatus({
              state: "error",
              message: "Payment was canceled.",
            });
          },
          onElementsMount: (elements) => {
            if (cancelled) return;
            if (elements?.applePay) {
              setPaymentStatus({
                state: "ready",
                message: "Apple Pay is available on this device/browser.",
              });
            } else {
              setPaymentStatus({
                state: "info",
                message: "Apple Pay is unavailable on this device/browser. Switch to Paystack.",
              });
            }
          },
        });
      } catch {
        if (cancelled) return;
        setPaymentStatus({
          state: "error",
          message: "Unable to initialize Apple Pay options.",
        });
      }
    }

    mountApplePayRequest();

    return () => {
      cancelled = true;
      clearApplePayContainer();
    };
  }, [activePricing.currency, cartItems.length, checkout.email, checkout.paymentMethod, resolvedPaystackPublicKey, total]);

  function addToCart(productId) {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const product = products.find((item) => item.id === productId);
      const max = product?.stock || 20;
      return { ...prev, [productId]: Math.min(current + 1, max) };
    });
  }

  function updateQuantity(productId, nextQuantity) {
    const product = products.find((item) => item.id === productId);
    const max = product?.stock || 20;
    const clamped = Math.max(0, Math.min(nextQuantity, max));
    setCart((prev) => {
      if (clamped === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: clamped };
    });
  }

  function clearCart() {
    setCart({});
  }

  function validateCheckout() {
    const errors = {};
    if (!checkout.fullName.trim()) errors.fullName = "Full name is required.";
    if (!checkout.email.trim() || !/^\S+@\S+\.\S+$/.test(checkout.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!checkout.phone.trim()) errors.phone = "Phone number is required.";
    if (!checkout.address.trim()) errors.address = "Address is required.";
    if (!checkout.city.trim()) errors.city = "City is required.";
    if (!checkout.country.trim()) errors.country = "Country is required.";
    if (cartItems.length === 0) errors.cart = "Cart is empty.";
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function processSelectedPayment(order) {
    if (!ONLINE_PAYMENT_METHODS.has(checkout.paymentMethod)) {
      setCheckoutErrors((prev) => ({
        ...prev,
        paymentMethod: `Choose ${PAYMENT_METHOD_APPLE_PAY} or ${PAYMENT_METHOD_PAYSTACK}.`,
      }));
      return;
    }

    if (!SUPPORTED_PAYSTACK_CURRENCIES.has(activePricing.currency)) {
      setCheckoutErrors((prev) => ({
        ...prev,
        paymentMethod: `${checkout.paymentMethod} currently supports NGN or USD only.`,
      }));
      return;
    }

    const paystackPublicKey = resolvedPaystackPublicKey;
    if (!paystackPublicKey) {
      setCheckoutErrors((prev) => ({
        ...prev,
        paymentMethod: `${checkout.paymentMethod} is not configured. Missing public key.`,
      }));
      setPaymentStatus({ state: "error", message: "Missing Paystack public key." });
      return;
    }

    const openingMessage =
      checkout.paymentMethod === PAYMENT_METHOD_APPLE_PAY ? "Opening Apple Pay..." : "Opening Paystack checkout...";
    setPaymentStatus({ state: "initializing", message: openingMessage });
    try {
      const PaystackPop = await loadPaystackScript();
      if (!PaystackPop) {
        setPaymentStatus({ state: "error", message: "Unable to initialize Paystack popup." });
        return;
      }

      const paymentReference = `PS-${order.reference}-${Date.now()}`;
      const popup = new PaystackPop();
      const [firstName = "", ...restNames] = (order.checkout.fullName || "").trim().split(/\s+/);
      const lastName = restNames.join(" ");
      const channels = getPaystackChannels(order.checkout.paymentMethod, order.currency || "NGN");
      await popup.checkout({
        key: paystackPublicKey,
        email: order.checkout.email,
        amount: Math.round(order.total * 100),
        currency: order.currency || "NGN",
        channels,
        firstName,
        lastName,
        phone: order.checkout.phone || undefined,
        ref: paymentReference,
        metadata: {
          order_reference: order.reference,
          customer_name: order.checkout.fullName || "",
          payment_method: order.checkout.paymentMethod || PAYMENT_METHOD_PAYSTACK,
        },
        onSuccess: async (transaction) => {
          await finalizeCardPayment(order, transaction?.reference || paymentReference);
        },
        onCancel: () => {
          setPaymentStatus({ state: "error", message: "Payment popup was closed before completion." });
        },
        onError: (error) => {
          const fallback =
            order.currency === "NGN"
              ? "Unable to start Paystack payment. Confirm transfer is enabled on your Paystack account."
              : "Unable to start Paystack payment.";
          setPaymentStatus({ state: "error", message: error?.message || fallback });
        },
      });
      return;
    } catch {
      setCheckoutErrors((prev) => ({
        ...prev,
        paymentMethod: `Unable to initialize ${checkout.paymentMethod} payment.`,
      }));
      setPaymentStatus({ state: "error", message: `Unable to initialize ${checkout.paymentMethod} payment.` });
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (!validateCheckout()) return;
    const order = createOrderDraft("pending_gateway");
    await processSelectedPayment(order);
  }

  async function handlePaystackQuickCheckout() {
    if (!validateCheckout()) return;
    const order = createOrderDraft("pending_gateway");
    await processSelectedPayment(order);
  }

  function handleCheckoutFieldChange(event) {
    const { name, value } = event.target;
    setCheckout((prev) => ({ ...prev, [name]: value }));
    setCheckoutErrors((prev) => ({ ...prev, [name]: undefined, cart: undefined }));
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-slate-900">Sirdavid Gadgets</p>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Storefront</p>
          </div>
          <div className="inline-flex items-center gap-3">
            <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:inline-flex">
              {activePricing.countryName} ({activePricing.currency})
            </span>
            {isCartPage ? (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Back To Store
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Cart ({cartCount})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {lastOrder ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {lastOrder.paymentStatus === "paid" ? "Payment Successful" : "Order Placed"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-slate-900">
              {lastOrder.paymentStatus === "paid" ? "Payment Confirmed" : "Thank you for your order"}
            </h1>
            <p className="mt-3 text-slate-600">
              Reference <span className="font-semibold text-slate-900">{lastOrder.reference}</span> was created
              successfully.
            </p>
            <p className="mt-2 text-slate-600">
              Total: <span className="font-semibold text-slate-900">{formatMoney(lastOrder.total, lastOrder.currency)}</span>
            </p>
            {ONLINE_PAYMENT_METHODS.has(lastOrder.checkout.paymentMethod) && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-900">
                <p className="font-semibold">{lastOrder.checkout.paymentMethod} Completed</p>
                <p className="mt-1">
                  Paystack verified this payment for reference{" "}
                  <span className="font-semibold">{lastOrder.paymentReference || lastOrder.reference}</span>.
                </p>
              </div>
            )}
            {paymentStatus.state !== "idle" && paymentStatus.state !== "paid" && (
              <p className={`mt-3 text-sm ${paymentStatus.state === "error" ? "text-rose-600" : "text-blue-700"}`}>
                {paymentStatus.message}
              </p>
            )}
            {sendStatus.state !== "idle" && (
              <p
                className={`mt-3 text-sm ${
                  sendStatus.state === "error" ? "text-rose-600" : "text-emerald-700"
                }`}
              >
                {sendStatus.message}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLastOrder(null);
                  setSendStatus({ state: "idle", message: "" });
                  setPaymentStatus({ state: "idle", message: "" });
                  navigate("/");
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Continue Shopping
              </button>
            </div>
          </section>
        ) : (
          <div className={isCartPage ? "mx-auto max-w-3xl" : "grid gap-6 lg:grid-cols-[1.6fr_1fr]"}>
            {!isCartPage && (
            <section>
              <section className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Trusted Devices</p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
                  New and Used Gadgets With Real Checkout Flow
                </h1>
                <p className="mt-4 max-w-3xl text-slate-200 sm:text-lg">
                  Search, filter, add to cart, and place orders. Pricing is adjusted for each visitor location.
                </p>
              </section>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                    className={inputClass}
                  />
                  <select
                    value={activeCategory}
                    onChange={(event) => setActiveCategory(event.target.value)}
                    className={inputClass}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={conditionFilter}
                    onChange={(event) => setConditionFilter(event.target.value)}
                    className={inputClass}
                  >
                    <option value="All">All Conditions</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className={inputClass}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <select
                    value={pricingMode}
                    onChange={(event) => setPricingMode(event.target.value)}
                    className={inputClass}
                  >
                    <option value="auto">Auto (Detected by IP)</option>
                    <option value="manual">Manual Override</option>
                  </select>
                  <select
                    value={manualCountryCode}
                    onChange={(event) => {
                      const nextCode = event.target.value;
                      setManualCountryCode(nextCode);
                      setManualCurrency(getCurrencyForCountry(nextCode, activePricing.currency));
                    }}
                    disabled={pricingMode === "auto"}
                    className={inputClass}
                  >
                    {pricingCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={pricingMode === "auto" ? activePricing.currency : manualCurrency}
                    onChange={(event) => setManualCurrency(event.target.value)}
                    disabled={pricingMode === "auto"}
                    className={inputClass}
                  >
                    {currencyOptions.map((currencyCode) => (
                      <option key={currencyCode} value={currencyCode}>
                        {currencyCode}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-display text-2xl font-semibold text-slate-900">{product.name}</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {product.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-500">{product.brand}</p>
                      <p className="mt-2 text-sm font-semibold text-blue-700">{product.condition}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{product.details}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatMoney(toPrice(product.basePriceUsd, activePricing), activePricing.currency)}
                        </p>
                        <p className="text-xs font-medium text-slate-500">{product.stock} in stock</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            </section>
            )}

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-slate-900">Your Cart</h2>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No items yet. Add products to start checkout.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatMoney(item.unitPrice, activePricing.currency)} each</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 rounded-md border border-slate-300 text-slate-700"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 rounded-md border border-slate-300 text-slate-700"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatMoney(item.totalPrice, activePricing.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal, activePricing.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatMoney(shipping, activePricing.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatMoney(total, activePricing.currency)}</span>
                </div>
              </div>

              {isCartPage && cartItems.length > 0 ? (
                <form onSubmit={handlePlaceOrder} className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                  <h3 className="font-display text-xl font-semibold text-slate-900">Checkout</h3>

                  {checkoutErrors.cart && <p className="text-sm text-rose-600">{checkoutErrors.cart}</p>}
                  {paymentStatus.state !== "idle" && (
                    <p className={`text-sm ${paymentStatus.state === "error" ? "text-rose-600" : "text-blue-700"}`}>
                      {paymentStatus.message}
                    </p>
                  )}

                  <input
                    name="fullName"
                    value={checkout.fullName}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Full name"
                    className={inputClass}
                  />
                  {checkoutErrors.fullName && <p className="text-xs text-rose-600">{checkoutErrors.fullName}</p>}

                  <input
                    name="email"
                    value={checkout.email}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Email"
                    className={inputClass}
                  />
                  {checkoutErrors.email && <p className="text-xs text-rose-600">{checkoutErrors.email}</p>}

                  <input
                    name="phone"
                    value={checkout.phone}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Phone"
                    className={inputClass}
                  />
                  {checkoutErrors.phone && <p className="text-xs text-rose-600">{checkoutErrors.phone}</p>}

                  <input
                    name="address"
                    value={checkout.address}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Address"
                    className={inputClass}
                  />
                  {checkoutErrors.address && <p className="text-xs text-rose-600">{checkoutErrors.address}</p>}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <input
                        name="city"
                        value={checkout.city}
                        onChange={handleCheckoutFieldChange}
                        placeholder="City"
                        className={inputClass}
                      />
                      {checkoutErrors.city && <p className="text-xs text-rose-600">{checkoutErrors.city}</p>}
                    </div>
                    <div>
                      <input
                        name="country"
                        value={checkout.country}
                        onChange={handleCheckoutFieldChange}
                        placeholder="Country"
                        className={inputClass}
                      />
                      {checkoutErrors.country && <p className="text-xs text-rose-600">{checkoutErrors.country}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Payment Method</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PAYMENT_METHODS.map((method) => {
                        const selected = checkout.paymentMethod === method.value;
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => {
                              setCheckout((prev) => ({ ...prev, paymentMethod: method.value }));
                              setCheckoutErrors((prev) => ({ ...prev, paymentMethod: undefined }));
                            }}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                              selected
                                ? "border-cyan-500 bg-cyan-50/70 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                                method.value === "Apple Pay" ? "bg-slate-900 text-white" : "bg-emerald-600 text-white"
                              }`}
                            >
                              {method.value === "Apple Pay" ? (
                                <FaApplePay className="text-lg" />
                              ) : (
                                <FaWallet className="text-sm" />
                              )}
                            </span>
                            <span className="flex-1">
                              <span className="block text-sm font-semibold text-slate-900">{method.value}</span>
                              <span className="mt-0.5 block text-xs text-slate-500">{method.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {isApplePaySelected ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-700">Apple Pay Quick Checkout</p>
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          Secure
                        </span>
                      </div>
                      <div id="paystack-apple-pay" className="mt-2" />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-emerald-800">Paystack Checkout</p>
                        <span className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
                          Secure
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePaystackQuickCheckout}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-3 py-2.5 text-left text-white shadow-sm transition hover:from-emerald-500 hover:to-green-500"
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                          <FaWallet className="text-sm" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Paystack Checkout</span>
                          <span className="block text-xs text-emerald-100">Cards, bank transfer, USSD and more</span>
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">Open</span>
                      </button>
                    </div>
                  )}
                  {checkoutErrors.paymentMethod && (
                    <p className="text-xs text-rose-600">{checkoutErrors.paymentMethod}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {isApplePaySelected
                      ? "Apple Pay appears only on supported Safari/iOS devices. If unavailable, switch to Paystack."
                      : activePricing.currency === "NGN"
                      ? "Paystack supports cards, bank transfer, USSD, and more secure payment channels."
                      : `Paystack transfer account generation is NGN-only. Current checkout currency is ${activePricing.currency}.`}
                  </p>

                  <textarea
                    name="notes"
                    value={checkout.notes}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Order notes (optional)"
                    rows={3}
                    className={inputClass}
                  />

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
                  >
                    {isApplePaySelected ? "Place Order (Apple Pay)" : "Place Order (Paystack)"}
                  </button>
                </form>
              ) : !isCartPage && cartItems.length > 0 ? (
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go To Cart & Checkout
                </button>
              ) : isCartPage ? (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="mt-6 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Continue Shopping
                </button>
              ) : null}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
