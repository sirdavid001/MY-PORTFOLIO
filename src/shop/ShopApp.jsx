import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney } from "../lib/pricing";
import { BrandPill } from "./brandIdentity";
import {
  defaultShippingConfig,
  normalizeProduct,
  normalizeShippingConfig,
  products as defaultProducts,
} from "./products";
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-300/60 focus:border-cyan-500 focus:ring";
const PRODUCT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80";

const PAYMENT_METHOD_PAYSTACK = "Paystack";
const defaultCheckout = {
  fullName: "",
  email: "",
  phone: "",
  callNumber: "",
  address: "",
  city: "",
  country: "",
  paymentMethod: PAYMENT_METHOD_PAYSTACK,
  notes: "",
};
const PAYSTACK_POPUP_SRC = "https://js.paystack.co/v2/inline.js";
const SUPPORTED_PAYSTACK_CURRENCIES = new Set(["NGN", "USD"]);
const FALLBACK_NGN_PER_USD = 1600;
const SHOP_POLICY_LINKS = [
  { path: "/terms-and-conditions", label: "Terms & Conditions" },
  { path: "/refund-policy", label: "Refund Policy" },
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/faqs", label: "FAQs" },
  { path: "/shipping-policy", label: "Shipping Policy" },
];
const SHOP_POLICY_CONTENT = {
  "/terms-and-conditions": {
    title: "Terms and Conditions",
    summary:
      "These terms govern use of Sirdavid Gadgets storefront and all purchases completed through our website.",
    sections: [
      {
        heading: "Orders and Product Availability",
        paragraphs: [
          "All orders are subject to stock confirmation and payment verification.",
          "If a listed item becomes unavailable after checkout, we will contact you immediately with replacement or refund options.",
        ],
      },
      {
        heading: "Pricing and Payments",
        paragraphs: [
          "Prices are displayed in local currency and may vary based on location and exchange rates.",
          "Payments are processed securely through supported payment channels before order fulfillment begins.",
        ],
      },
      {
        heading: "Use of Website",
        paragraphs: [
          "Users must provide accurate checkout details, including active phone and delivery address.",
          "Fraudulent transactions, abuse, or misuse of the platform may result in order cancellation and account restriction.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For account, order, or legal questions, contact us at itssirdavid@gmail.com.",
        ],
      },
    ],
  },
  "/refund-policy": {
    title: "Refund Policy",
    summary:
      "We aim to provide reliable gadgets. If there is a valid issue, we offer fair refund or replacement support.",
    sections: [
      {
        heading: "Eligible Refund Cases",
        paragraphs: [
          "Wrong item delivered, item not delivered, or product significantly different from description.",
          "Verified hardware defects reported within 48 hours of delivery, where replacement is unavailable.",
        ],
      },
      {
        heading: "Non-Refundable Cases",
        paragraphs: [
          "Physical damage after delivery caused by misuse, drops, liquid contact, or unauthorized repairs.",
          "Change-of-mind requests for items that match listing description and test results.",
        ],
      },
      {
        heading: "Refund Process",
        paragraphs: [
          "Send order reference, issue details, and evidence (photos/video) to support for review.",
          "Approved refunds are processed to the original payment method within 3-10 business days.",
        ],
      },
    ],
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    summary:
      "We collect only the information needed to process orders, support customers, and protect transactions.",
    sections: [
      {
        heading: "Data We Collect",
        paragraphs: [
          "Name, email, phone number, delivery address, order details, and payment references.",
          "Technical logs and anti-fraud metadata required for security and payment verification.",
        ],
      },
      {
        heading: "How We Use Data",
        paragraphs: [
          "To process and deliver orders, send payment/tracking notifications, and provide customer support.",
          "To prevent fraud, monitor suspicious activity, and comply with legal obligations.",
        ],
      },
      {
        heading: "Data Sharing",
        paragraphs: [
          "We share required data only with trusted service providers such as payment, hosting, and delivery partners.",
          "We do not sell personal data to third parties.",
        ],
      },
      {
        heading: "Data Rights",
        paragraphs: [
          "You may request correction or deletion of eligible personal data by contacting support.",
        ],
      },
    ],
  },
  "/faqs": {
    title: "Frequently Asked Questions",
    summary: "Quick answers about orders, payments, delivery, and support.",
    sections: [
      {
        heading: "How do I place an order?",
        paragraphs: [
          "Add products to cart, complete checkout details, and finalize payment through available channels.",
        ],
      },
      {
        heading: "How can I track my order?",
        paragraphs: [
          "Use the Track Order page with your order reference or tracking number from confirmation messages.",
        ],
      },
      {
        heading: "Do you sell both new and used gadgets?",
        paragraphs: [
          "Yes. Condition labels are shown on each product listing for transparency before purchase.",
        ],
      },
      {
        heading: "What if my payment was debited but status did not update?",
        paragraphs: [
          "Contact support with your payment reference immediately so we can verify and resolve quickly.",
        ],
      },
      {
        heading: "How do I contact support?",
        paragraphs: [
          "Email itssirdavid@gmail.com with your order reference and issue details.",
        ],
      },
    ],
  },
  "/shipping-policy": {
    title: "Shipping Policy",
    summary: "We process confirmed orders quickly and provide status updates through tracking.",
    sections: [
      {
        heading: "Processing Time",
        paragraphs: [
          "Orders begin processing after successful payment confirmation and validation.",
          "Typical processing window is 1-2 business days excluding weekends and public holidays.",
        ],
      },
      {
        heading: "Delivery Timeline",
        paragraphs: [
          "Estimated local delivery is usually 2-7 business days depending on destination and logistics partner.",
          "Remote locations may require additional delivery time.",
        ],
      },
      {
        heading: "Shipping Fees",
        paragraphs: [
          "Shipping fees are calculated at checkout using active store shipping settings and shown before payment.",
        ],
      },
      {
        heading: "Delivery Issues",
        paragraphs: [
          "If you experience delays or failed delivery attempts, contact support with your order reference for immediate help.",
        ],
      },
    ],
  },
};
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
  return Number(basePriceUsd || 0) * pricingContext.exchangeRate * pricingContext.factor;
}

function calculateShipping(subtotal, pricingContext, shippingConfig) {
  if (subtotal <= 0) return 0;

  const normalized = normalizeShippingConfig(shippingConfig || defaultShippingConfig);
  const exchangeRate = Math.max(0.0001, Number(pricingContext?.exchangeRate || 1));
  const flat = normalized.flatUsd * exchangeRate;
  const min = normalized.minUsd * exchangeRate;
  const percentBased = subtotal * normalized.percentRate;

  if (normalized.mode === "flat") return flat;
  if (normalized.mode === "percent") return percentBased;
  return Math.max(min, percentBased);
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function getPaystackChannels(currency, transferOnly = false) {
  if (transferOnly) {
    return ["apple_pay"];
  }

  if (currency === "NGN") {
    return ["card", "bank_transfer", "bank", "ussd", "qr", "eft", "mobile_money"];
  }

  return ["card"];
}

function getProductGallery(product) {
  const raw = [];
  const append = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    raw.push(trimmed);
  };

  if (Array.isArray(product?.images)) {
    product.images.forEach(append);
  }
  append(product?.image);

  const unique = [];
  const seen = new Set();
  raw.forEach((url) => {
    if (seen.has(url)) return;
    seen.add(url);
    unique.push(url);
  });

  return unique.slice(0, 5);
}

function isApplePaySupportedOnDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ApplePaySessionRef = window.ApplePaySession;
  if (!ApplePaySessionRef || typeof ApplePaySessionRef.canMakePayments !== "function") return false;

  const userAgent = String(navigator.userAgent || "");
  const isAppleDevice = /iPhone|iPad|iPod|Macintosh/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Android/i.test(userAgent);

  if (!isAppleDevice || !isSafari) return false;

  try {
    return Boolean(ApplePaySessionRef.canMakePayments());
  } catch {
    return false;
  }
}

function normalizeTrackingStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "paid") return "paid";
  if (normalized === "processing") return "processing";
  if (normalized === "in_route" || normalized === "shipped") return "in_route";
  if (normalized === "delivered" || normalized === "completed") return "completed";
  if (normalized === "cancelled") return "cancelled";
  return "new";
}

function trackingStatusLabel(status) {
  const normalized = normalizeTrackingStatus(status);
  if (normalized === "paid") return "Payment Confirmed";
  if (normalized === "processing") return "Order Processing";
  if (normalized === "in_route") return "In Route";
  if (normalized === "completed") return "Delivered";
  if (normalized === "cancelled") return "Cancelled";
  return "Pending Review";
}

function trackingStatusPillClass(status) {
  const normalized = normalizeTrackingStatus(status);
  if (normalized === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (normalized === "in_route") return "border-blue-200 bg-blue-50 text-blue-800";
  if (normalized === "processing") return "border-amber-200 bg-amber-50 text-amber-800";
  if (normalized === "paid") return "border-cyan-200 bg-cyan-50 text-cyan-800";
  if (normalized === "cancelled") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
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
  const isTrackingPage = normalizedPathname === "/track-order";
  const policyPath = normalizedPathname === "/faq" ? "/faqs" : normalizedPathname;
  const policyPage = SHOP_POLICY_CONTENT[policyPath] || null;
  const isPolicyPage = Boolean(policyPage);
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
  const [applePaySupported, setApplePaySupported] = useState(false);
  const [trackingReference, setTrackingReference] = useState("");
  const [trackingState, setTrackingState] = useState({ state: "idle", message: "" });
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState(() => defaultProducts.map((product) => normalizeProduct(product)));
  const [shippingConfig, setShippingConfig] = useState(() => normalizeShippingConfig(defaultShippingConfig));
  const [selectedImageIndexByProduct, setSelectedImageIndexByProduct] = useState({});
  const [resolvedPaystackPublicKey, setResolvedPaystackPublicKey] = useState(
    () => import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ""
  );

  useEffect(() => {
    setCart(loadFromStorage("sirdavidshop:cart", {}));
    const savedCheckout = loadFromStorage("sirdavidshop:checkout", null);
    if (savedCheckout) {
      setCheckout({
        ...defaultCheckout,
        ...savedCheckout,
        paymentMethod: PAYMENT_METHOD_PAYSTACK,
      });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sirdavidshop:cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("sirdavidshop:checkout", JSON.stringify(checkout));
  }, [checkout]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogConfig() {
      try {
        const response = await fetch("/api/shop/config");
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (!response.ok || !data?.ok) return;

        const productsFromApi = Array.isArray(data.products)
          ? data.products.map((product) => normalizeProduct(product)).filter((product) => product.id && product.isActive)
          : null;
        const shippingFromApi = normalizeShippingConfig(data.shipping || defaultShippingConfig);

        if (Array.isArray(productsFromApi)) {
          setCatalogProducts(productsFromApi);
        }
        setShippingConfig(shippingFromApi);
      } catch {
        // Keep fallback defaults when live config is unavailable.
      }
    }

    loadCatalogConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setApplePaySupported(isApplePaySupportedOnDevice());
  }, []);

  useEffect(() => {
    if (!isTrackingPage) return;
    const params = new URLSearchParams(location.search || "");
    const prefReference = String(
      params.get("reference") || params.get("tracking") || params.get("lookup") || ""
    ).trim();
    if (prefReference) setTrackingReference(prefReference);
  }, [isTrackingPage, location.search]);

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
    setSendStatus({ state: "sending", message: "Sending your confirmation..." });
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
          message: data?.error || "Payment confirmed, but we could not send your confirmation email yet.",
        });
        return false;
      }

      if (data?.persisted === false) {
        setSendStatus({
          state: "error",
          message: data?.warning || "Payment confirmed. We are finalizing your order record.",
        });
        return false;
      }

      if (data?.emailSent === false) {
        setSendStatus({
          state: "sent",
          message: data?.warning || "Payment confirmed. Some email updates were delayed.",
        });
        return true;
      }

      setSendStatus({
        state: "sent",
        message:
          data?.customerEmailSent === true
            ? "Payment confirmed. Your receipt and tracking details have been sent to your email."
            : "Payment confirmed. Your order has been received successfully.",
      });
      return true;
    } catch {
      setSendStatus({
        state: "error",
        message: "Payment confirmed. We could not reach the email service right now.",
      });
      return false;
    }
  }

  async function handleTrackOrder(event) {
    event.preventDefault();
    setTrackingOrder(null);

    const lookup = String(trackingReference || "").trim();
    if (!lookup || lookup.length < 3) {
      setTrackingState({ state: "error", message: "Enter a valid order reference or tracking number." });
      return;
    }

    setTrackingState({ state: "loading", message: "Checking your order status..." });
    try {
      const query = new URLSearchParams({
        lookup,
      });
      const response = await fetch(`/api/send-order?${query.toString()}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok || !data?.tracking) {
        setTrackingState({
          state: "error",
          message: data?.error || "Unable to find this order. Check your reference or tracking number.",
        });
        return;
      }

      setTrackingOrder(data.tracking);
      setTrackingState({ state: "success", message: "Tracking details loaded." });
    } catch {
      setTrackingState({ state: "error", message: "Tracking service is unavailable right now." });
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
    const ngnRateFromRates = Number(pricingContext?.rates?.NGN || 0);
    const ngnRateFromExchange = pricingContext?.currency === "NGN" ? Number(pricingContext.exchangeRate || 0) : 0;
    const ngnPerUsd =
      Number.isFinite(ngnRateFromRates) && ngnRateFromRates > 0
        ? ngnRateFromRates
        : Number.isFinite(ngnRateFromExchange) && ngnRateFromExchange > 0
          ? ngnRateFromExchange
          : FALLBACK_NGN_PER_USD;

    return {
      countryCode: pricingContext.countryCode,
      countryName: pricingContext.countryName,
      currency: "NGN",
      exchangeRate: ngnPerUsd,
      factor: pricingContext.factor,
    };
  }, [pricingContext]);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(catalogProducts.map((product) => product.category).filter(Boolean))
    );
    return ["All", ...dynamicCategories];
  }, [catalogProducts]);
  const categoryItemCounts = useMemo(() => {
    const counts = { All: catalogProducts.length };
    categories
      .filter((category) => category !== "All")
      .forEach((category) => {
        counts[category] = catalogProducts.filter((product) => product.category === category).length;
      });
    return counts;
  }, [catalogProducts, categories]);

  useEffect(() => {
    if (activeCategory === "All") return;
    if (categories.includes(activeCategory)) return;
    setActiveCategory("All");
  }, [activeCategory, categories]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = catalogProducts.filter((product) => {
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
  }, [activeCategory, activePricing, catalogProducts, conditionFilter, search, sortBy]);
  const groupedVisibleProducts = useMemo(() => {
    const groups = new Map();
    visibleProducts.forEach((product) => {
      const category = String(product.category || "").trim() || "Uncategorized";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(product);
    });
    return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
  }, [visibleProducts]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = catalogProducts.find((item) => item.id === productId);
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
  }, [activePricing, cart, catalogProducts]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [cartItems]
  );

  const shipping = useMemo(
    () => calculateShipping(subtotal, activePricing, shippingConfig),
    [subtotal, activePricing, shippingConfig]
  );
  const total = subtotal + shipping;

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
    if (!checkout.email || !isValidEmail(checkout.email)) {
      setPaymentStatus({
        state: "info",
        message: "Enter a valid email to continue.",
      });
      return undefined;
    }

    if (!SUPPORTED_PAYSTACK_CURRENCIES.has(activePricing.currency)) {
      setPaymentStatus({
        state: "error",
        message: "Checkout currently supports NGN or USD only.",
      });
      return undefined;
    }

    if (cartItems.length === 0 || total <= 0) {
      setPaymentStatus({
        state: "info",
        message: "Add an item to cart to continue.",
      });
      return undefined;
    }

    const paystackPublicKey = resolvedPaystackPublicKey;
    if (!paystackPublicKey) {
      setPaymentStatus({ state: "error", message: "Missing Paystack public key." });
      return undefined;
    }

    setPaymentStatus({
      state: "ready",
      message: "Checkout is ready.",
    });
    return undefined;
  }, [activePricing.currency, cartItems.length, checkout.email, resolvedPaystackPublicKey, total]);

  function addToCart(productId) {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const product = catalogProducts.find((item) => item.id === productId);
      const max = Math.max(0, Number(product?.stock || 0));
      if (max === 0) return prev;
      return { ...prev, [productId]: Math.min(current + 1, max) };
    });
  }

  function updateQuantity(productId, nextQuantity) {
    const product = catalogProducts.find((item) => item.id === productId);
    const max = Math.max(0, Number(product?.stock || 0));
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

  async function processSelectedPayment(order, options = {}) {
    const transferOnly = options.transferOnly === true;
    const paymentMethodLabel = transferOnly ? "Apple Pay" : PAYMENT_METHOD_PAYSTACK;
    const orderForPayment = {
      ...order,
      checkout: {
        ...order.checkout,
        paymentMethod: paymentMethodLabel,
      },
    };

    if (!SUPPORTED_PAYSTACK_CURRENCIES.has(activePricing.currency)) {
      setPaymentStatus({ state: "idle", message: "" });
      return;
    }

    const paystackPublicKey = resolvedPaystackPublicKey;
    if (!paystackPublicKey) {
      setPaymentStatus({ state: "idle", message: "" });
      return;
    }

    setPaymentStatus({
      state: "initializing",
      message: transferOnly ? "Opening Apple Pay..." : "Opening Paystack checkout...",
    });
    try {
      const PaystackPop = await loadPaystackScript();
      if (!PaystackPop) {
        setPaymentStatus({ state: "idle", message: "" });
        return;
      }

      const paymentReference = `PS-${order.reference}-${Date.now()}`;
      const popup = new PaystackPop();
      const [firstName = "", ...restNames] = (orderForPayment.checkout.fullName || "").trim().split(/\s+/);
      const lastName = restNames.join(" ");
      const channels = getPaystackChannels(orderForPayment.currency || "NGN", transferOnly);
      await popup.checkout({
        key: paystackPublicKey,
        email: orderForPayment.checkout.email,
        amount: Math.round(orderForPayment.total * 100),
        currency: orderForPayment.currency || "NGN",
        channels,
        firstName,
        lastName,
        phone: orderForPayment.checkout.phone || undefined,
        ref: paymentReference,
        metadata: {
          order_reference: orderForPayment.reference,
          customer_name: orderForPayment.checkout.fullName || "",
          payment_method: paymentMethodLabel,
          checkout_mode: transferOnly ? "apple_pay" : "standard",
        },
        onSuccess: async (transaction) => {
          await finalizeCardPayment(orderForPayment, transaction?.reference || paymentReference);
        },
        onCancel: () => {
          setPaymentStatus({ state: "idle", message: "" });
        },
        onError: () => {
          setPaymentStatus({ state: "idle", message: "" });
        },
      });
      return;
    } catch {
      setPaymentStatus({ state: "idle", message: "" });
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (!validateCheckout()) return;
    if (paymentStatus.state === "initializing" || paymentStatus.state === "verifying") return;

    const order = createOrderDraft("pending_gateway");
    await processSelectedPayment(order);
  }

  async function handleApplePayOrder(event) {
    event.preventDefault();
    if (!applePaySupported) return;
    if (!validateCheckout()) return;
    if (paymentStatus.state === "initializing" || paymentStatus.state === "verifying") return;

    const order = createOrderDraft("pending_gateway");
    await processSelectedPayment(order, { transferOnly: true });
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
            {isCartPage || isTrackingPage || isPolicyPage ? (
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
            {!isTrackingPage && !isPolicyPage ? (
              <button
                type="button"
                onClick={() => navigate("/track-order")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Track Order
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isPolicyPage ? (
          <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Policy</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">{policyPage.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{policyPage.summary}</p>
            <div className="mt-6 space-y-5">
              {policyPage.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="text-base font-semibold text-slate-900">{section.heading}</h2>
                  <div className="mt-2 space-y-2">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-slate-700">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">More Information</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SHOP_POLICY_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      link.path === policyPath
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : isTrackingPage ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Order Tracking</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Track your product</h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your order reference or tracking number to view latest status.
            </p>

            <form onSubmit={handleTrackOrder} className="mt-5 space-y-3">
              <input
                value={trackingReference}
                onChange={(event) => setTrackingReference(event.target.value)}
                className={inputClass}
                placeholder="Order reference or tracking number"
              />
              <button
                type="submit"
                disabled={trackingState.state === "loading"}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {trackingState.state === "loading" ? "Checking..." : "Track Order"}
              </button>
            </form>

            {trackingState.state === "error" ? (
              <p className="mt-3 text-sm text-rose-600">{trackingState.message}</p>
            ) : null}
            {trackingState.state === "success" && trackingOrder ? (
              <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Reference {trackingOrder.reference}</p>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] ${trackingStatusPillClass(
                      trackingOrder.status
                    )}`}
                  >
                    {trackingStatusLabel(trackingOrder.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{trackingOrder.statusMessage}</p>
                <p className="mt-2 text-xs text-slate-600">
                  Tracking number: {trackingOrder.trackingNumber || "Not assigned yet"}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Created:{" "}
                  {trackingOrder.createdAt ? new Date(trackingOrder.createdAt).toLocaleString() : "N/A"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Total: {formatMoney(trackingOrder.total || 0, trackingOrder.currency || activePricing.currency)}
                </p>
              </section>
            ) : null}
          </section>
        ) : lastOrder ? (
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
                onClick={() => navigate(`/track-order?reference=${encodeURIComponent(lastOrder.reference)}`)}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Track This Order
              </button>
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
                  Search, filter, add to cart, and place orders. Prices are shown in Naira and adjusted by visitor location.
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
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Browse by category</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const isActive = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            isActive
                              ? "border-cyan-600 bg-cyan-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {category} ({categoryItemCounts[category] ?? 0})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="mt-6 space-y-6">
                {groupedVisibleProducts.map((group) => (
                  <section key={group.category}>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display text-2xl font-semibold text-slate-900">{group.category}</h2>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {group.items.length} items
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((product) => {
                        const gallery = getProductGallery(product);
                        const maxIndex = Math.max(0, gallery.length - 1);
                        const selectedIndex = Math.min(
                          Number(selectedImageIndexByProduct[product.id] || 0),
                          maxIndex
                        );
                        const selectedImage = gallery[selectedIndex] || PRODUCT_FALLBACK_IMAGE;

                        return (
                          <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <img src={selectedImage} alt={product.name} className="h-44 w-full object-cover" />
                            {gallery.length > 1 && (
                              <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-3 py-2">
                                {gallery.map((imageUrl, index) => (
                                  <button
                                    key={`${product.id}-image-${index}`}
                                    type="button"
                                    onClick={() =>
                                      setSelectedImageIndexByProduct((prev) => ({
                                        ...prev,
                                        [product.id]: index,
                                      }))
                                    }
                                    className={`h-12 w-12 flex-none overflow-hidden rounded-md border ${
                                      index === selectedIndex ? "border-cyan-500" : "border-slate-200"
                                    }`}
                                  >
                                    <img src={imageUrl} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-display text-2xl font-semibold text-slate-900">{product.name}</h3>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                  {product.category}
                                </span>
                              </div>
                              <BrandPill brand={product.brand} className="mt-2" />
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
                                disabled={Number(product.stock) <= 0}
                                className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                                  Number(product.stock) > 0
                                    ? "bg-slate-900 hover:bg-slate-800"
                                    : "cursor-not-allowed bg-slate-400"
                                }`}
                              >
                                {Number(product.stock) > 0 ? "Add to Cart" : "Out of Stock"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
                {visibleProducts.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                    No gadgets match your filter right now.
                  </div>
                )}
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
                      <BrandPill brand={item.brand} className="mt-1" />
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

                  <input
                    name="callNumber"
                    value={checkout.callNumber || ""}
                    onChange={handleCheckoutFieldChange}
                    placeholder="Call number (optional)"
                    className={inputClass}
                  />

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
                    disabled={paymentStatus.state === "initializing" || paymentStatus.state === "verifying"}
                    className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
                  >
                    {paymentStatus.state === "initializing" || paymentStatus.state === "verifying" ? "Processing..." : "Place Order"}
                  </button>
                  {applePaySupported ? (
                    <button
                      type="button"
                      onClick={handleApplePayOrder}
                      disabled={paymentStatus.state === "initializing" || paymentStatus.state === "verifying"}
                      className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-70"
                    >
                      {paymentStatus.state === "initializing" || paymentStatus.state === "verifying"
                        ? "Processing..."
                        : "Pay with Apple Pay"}
                    </button>
                  ) : null}
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">Sirdavid Gadgets • New and fairly used gadgets with secure checkout.</p>
          <nav className="flex flex-wrap gap-2">
            {SHOP_POLICY_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
