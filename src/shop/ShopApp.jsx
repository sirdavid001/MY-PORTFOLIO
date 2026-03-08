import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCartContext } from "./CartContext";
import {
  formatCurrencyList,
  resolveApplePaySupportedCurrencies,
  resolvePaystackSupportedCurrencies,
} from "../../shared/paystack.js";
import {
  FiChevronRight,
  FiFilter,
  FiRefreshCcw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney } from "../lib/pricing";
import { BrandPill } from "./brandIdentity";
import { buildStorePricingContext, loadFromStorage, toPrice } from "./shop-helpers";
import {
  categoryOptions,
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
  "w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none ring-cyan-300/60 transition focus:border-cyan-500 focus:ring";
const PRODUCT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80";
const carrierCategorySet = new Set(["phones", "tablets", "wearables"]);
const STORE_TRUST_ITEMS = [
  {
    icon: FiShield,
    label: "Verified Devices",
    note: "Tested before listing",
  },
  {
    icon: FiTruck,
    label: "Fast Fulfillment",
    note: "Quick nationwide dispatch",
  },
  {
    icon: FiRefreshCcw,
    label: "After-Sales Support",
    note: "Responsive issue resolution",
  },
];

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
const FALLBACK_NGN_PER_USD = 1600;
const BUSINESS_SUBDOMAINS = new Set(["shop", "store", "gadgets", "sirdavidshop"]);
const SHOP_POLICY_LINKS = [
  { path: "/terms-and-conditions", label: "Terms & Conditions" },
  { path: "/refund-policy", label: "Refund Policy" },
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/faqs", label: "FAQs" },
  { path: "/shipping-policy", label: "Shipping Policy" },
];
const SHOP_POLICY_META = {
  "/terms-and-conditions": {
    tag: "Legal",
    description: "The contractual terms that govern orders, usage of this website, and buyer obligations.",
  },
  "/refund-policy": {
    tag: "Returns",
    description: "Eligibility standards, timelines, and review process for refunds, returns, and replacements.",
  },
  "/privacy-policy": {
    tag: "Data",
    description: "How personal data is collected, processed, protected, and retained across our services.",
  },
  "/faqs": {
    tag: "Support",
    description: "Operational guidance on payments, shipping, order tracking, and customer support.",
  },
  "/shipping-policy": {
    tag: "Logistics",
    description: "Fulfillment timelines, delivery scope, shipping charges, and escalation procedures.",
  },
};
const SHOP_POLICY_CONTENT = {
  "/terms-and-conditions": {
    title: "Terms and Conditions",
    summary:
      "These Terms and Conditions form a binding agreement between Sirdavid Gadgets and every customer placing an order through this storefront.",
    sections: [
      {
        heading: "Orders, Acceptance, and Availability",
        paragraphs: [
          "All orders are subject to availability checks, fraud screening, and successful payment verification.",
          "If an item becomes unavailable after checkout, we will contact you promptly with replacement, backorder, or refund options.",
        ],
      },
      {
        heading: "Pricing and Payments",
        paragraphs: [
          "Prices are displayed in local currency and may vary due to exchange-rate updates, regional fees, or promotions.",
          "Order fulfillment begins only after payment is authorized and confirmed through approved payment channels.",
        ],
      },
      {
        heading: "Acceptable Use",
        paragraphs: [
          "Customers must provide accurate delivery and contact details, including an active phone number and reachable address.",
          "Fraud, abuse, chargeback manipulation, or misuse of platform features may result in cancellation, refusal of service, or legal action.",
        ],
      },
      {
        heading: "Support and Legal Contact",
        paragraphs: [
          "For order issues, legal notices, or compliance requests, contact support@sirdavid.site.",
        ],
      },
    ],
  },
  "/refund-policy": {
    title: "Refund Policy",
    summary:
      "We maintain a structured refund process to protect both customers and the business while resolving genuine order issues quickly.",
    sections: [
      {
        heading: "Eligible Cases",
        paragraphs: [
          "Eligible cases include wrong item delivered, non-delivery after confirmed dispatch failure, or item materially different from listing details.",
          "Verified hardware defects reported within 48 hours of delivery are eligible when repair or replacement is unavailable.",
        ],
      },
      {
        heading: "Non-Eligible Cases",
        paragraphs: [
          "Refunds are not provided for post-delivery damage caused by drops, liquid contact, electrical misuse, or unauthorized repair attempts.",
          "Change-of-mind requests are not eligible when the delivered item matches the listed condition, specifications, and test record.",
        ],
      },
      {
        heading: "Review and Settlement Timeline",
        paragraphs: [
          "Submit your order reference, issue summary, and supporting evidence (photo/video) to support@sirdavid.site for review.",
          "Approved refunds are returned to the original payment channel within 3-10 business days, subject to payment-provider settlement times.",
        ],
      },
    ],
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    summary:
      "We process personal data responsibly and only for legitimate business purposes such as order fulfillment, security, and support.",
    sections: [
      {
        heading: "Data Collected",
        paragraphs: [
          "We collect customer name, email, phone number, delivery address, order metadata, and payment references required to complete transactions.",
          "We also collect technical logs and anti-fraud metadata used for account protection, security monitoring, and payment verification.",
        ],
      },
      {
        heading: "Purpose of Processing",
        paragraphs: [
          "Personal data is used to process orders, coordinate delivery, send payment/tracking updates, and provide customer support.",
          "Data may also be used to prevent fraud, investigate suspicious activity, and meet legal or regulatory obligations.",
        ],
      },
      {
        heading: "Third-Party Sharing",
        paragraphs: [
          "Where necessary, we share limited data with trusted processors such as payment providers, hosting platforms, and logistics partners.",
          "We do not sell customer personal data.",
        ],
      },
      {
        heading: "Data Subject Rights",
        paragraphs: [
          "Customers may request access, correction, or deletion of eligible personal data by contacting support@sirdavid.site.",
        ],
      },
    ],
  },
  "/faqs": {
    title: "Frequently Asked Questions",
    summary: "Operational answers to the questions customers ask most before and after checkout.",
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
          "Email support@sirdavid.site with your order reference and issue details.",
        ],
      },
    ],
  },
  "/shipping-policy": {
    title: "Shipping Policy",
    summary: "This policy outlines processing timelines, delivery expectations, and shipping fee treatment for all orders.",
    sections: [
      {
        heading: "Order Processing Window",
        paragraphs: [
          "Orders enter fulfillment only after payment is fully confirmed and internal validation checks are complete.",
          "Standard processing time is 1-2 business days, excluding weekends and public holidays.",
        ],
      },
      {
        heading: "Estimated Delivery Timeline",
        paragraphs: [
          "Estimated delivery is generally 2-7 business days based on destination, logistics partner performance, and order volume.",
          "Remote or high-risk routes may require additional transit time.",
        ],
      },
      {
        heading: "Shipping Fee Model",
        paragraphs: [
          "Shipping fees are calculated at checkout using active shipping rules and shown before payment authorization.",
        ],
      },
      {
        heading: "Delays and Delivery Exceptions",
        paragraphs: [
          "If a delivery is delayed or unsuccessful, contact support@sirdavid.site with your order reference for escalation and resolution.",
        ],
      },
    ],
  },
};

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

function categorySupportsNetworkInfo(category) {
  return carrierCategorySet.has(String(category || "").trim().toLowerCase());
}

function getProductSpecs(product) {
  const specs = [];
  const storageGb = Number.parseInt(String(product?.storageGb ?? ""), 10);
  const batteryHealth = Number.parseInt(String(product?.batteryHealth ?? ""), 10);
  const networkLock = String(product?.networkLock || "").trim();
  const networkCarrier = String(product?.networkCarrier || "").trim();

  if (Number.isFinite(storageGb) && storageGb > 0) {
    specs.push(`${storageGb}GB`);
  }
  if (Number.isFinite(batteryHealth) && batteryHealth >= 0 && batteryHealth <= 100) {
    specs.push(`Battery ${batteryHealth}%`);
  }
  if (categorySupportsNetworkInfo(product?.category)) {
    if (networkLock === "Locked" && networkCarrier) {
      specs.push(`Locked • ${networkCarrier}`);
    } else if (networkLock === "Unlocked") {
      specs.push("Unlocked");
    }
  }

  return specs.slice(0, 3);
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
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "inroute") return "in_route";
  if (normalized === "paid") return "paid";
  if (normalized === "processing") return "processing";
  if (normalized === "in_route" || normalized === "shipped") return "in_route";
  if (normalized === "delivered" || normalized === "completed") return "completed";
  if (normalized === "cancelled") return "cancelled";
  return "new";
}

function trackingStepIndex(status) {
  const normalized = normalizeTrackingStatus(status);
  if (normalized === "cancelled") return -1;
  if (normalized === "completed") return 4;
  if (normalized === "in_route") return 3;
  if (normalized === "processing") return 2;
  if (normalized === "paid") return 1;
  return 0;
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
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const hostLabels = hostname
    .split(".")
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean);
  const isBusinessSubdomain = hostLabels.some((label) => BUSINESS_SUBDOMAINS.has(label));
  const storeHomePath = !isBusinessSubdomain && hostLabels.includes("localhost") ? "/shop" : "/";
  const isCartPage = normalizedPathname === "/cart";
  const isTrackingPage = normalizedPathname === "/track-order";
  const policyPath = normalizedPathname === "/faq" ? "/faqs" : normalizedPathname;
  const policyPage = SHOP_POLICY_CONTENT[policyPath] || null;
  const activePolicyMeta = SHOP_POLICY_META[policyPath] || { tag: "Policy", description: "" };
  const isPolicyPage = Boolean(policyPage);
  const [activeCategory, setActiveCategory] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
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
  const [catalogCategories, setCatalogCategories] = useState(() => [...categoryOptions]);
  const [shippingConfig, setShippingConfig] = useState(() => normalizeShippingConfig(defaultShippingConfig));
  const [selectedImageIndexByProduct, setSelectedImageIndexByProduct] = useState({});
  const [resolvedPaystackPublicKey, setResolvedPaystackPublicKey] = useState(
    () => import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ""
  );
  const [supportedPaystackCurrencies, setSupportedPaystackCurrencies] = useState(() =>
    resolvePaystackSupportedCurrencies(import.meta.env.VITE_PAYSTACK_SUPPORTED_CURRENCIES)
  );
  const [supportedApplePayCurrencies, setSupportedApplePayCurrencies] = useState(() =>
    resolveApplePaySupportedCurrencies(import.meta.env.VITE_PAYSTACK_APPLE_PAY_CURRENCIES)
  );

  useEffect(() => {
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
        const categoriesFromApi = Array.isArray(data.categories)
          ? data.categories.map((category) => String(category || "").trim()).filter(Boolean)
          : null;
        const shippingFromApi = normalizeShippingConfig(data.shipping || defaultShippingConfig);

        if (Array.isArray(productsFromApi)) {
          setCatalogProducts(productsFromApi);
        }
        if (Array.isArray(categoriesFromApi) && categoriesFromApi.length > 0) {
          setCatalogCategories(Array.from(new Set(categoriesFromApi)));
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
    let cancelled = false;

    async function fetchPaystackPublicKey() {
      try {
        const response = await fetch("/api/payments/paystack/public-key");
        if (!response.ok) return;

        const data = await response.json();
        if (cancelled || !data?.ok) return;

        if (typeof data.key === "string" && data.key.trim()) {
          setResolvedPaystackPublicKey(data.key.trim());
        }
        if (data.supportedCurrencies) {
          setSupportedPaystackCurrencies(resolvePaystackSupportedCurrencies(data.supportedCurrencies));
        }
        if (data.applePayCurrencies) {
          setSupportedApplePayCurrencies(resolveApplePaySupportedCurrencies(data.applePayCurrencies));
        }
      } catch {
        // Keep local fallback config when the server endpoint is unavailable.
      }
    }

    fetchPaystackPublicKey();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const activePricing = useMemo(
    () => buildStorePricingContext(pricingContext, FALLBACK_NGN_PER_USD),
    [pricingContext]
  );
  const supportedPaystackCurrencySet = useMemo(
    () => new Set(resolvePaystackSupportedCurrencies(supportedPaystackCurrencies)),
    [supportedPaystackCurrencies]
  );
  const supportedApplePayCurrencySet = useMemo(
    () => new Set(resolveApplePaySupportedCurrencies(supportedApplePayCurrencies)),
    [supportedApplePayCurrencies]
  );
  const checkoutCurrencySupported = supportedPaystackCurrencySet.has(activePricing.currency);
  const applePayCurrencySupported = supportedApplePayCurrencySet.has(activePricing.currency);
  const supportedCurrencyList = useMemo(
    () => formatCurrencyList(supportedPaystackCurrencies),
    [supportedPaystackCurrencies]
  );
  const applePayCurrencyList = useMemo(
    () => formatCurrencyList(supportedApplePayCurrencies),
    [supportedApplePayCurrencies]
  );

  const {
    cartItems,
    addToCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
  } = useCartContext();
  const cartItemsById = useMemo(() => new Map(cartItems.map((item) => [item.id, item])), [cartItems]);

  const categories = useMemo(() => {
    const dynamicCategories = catalogProducts.map((product) => String(product.category || "").trim()).filter(Boolean);
    const merged = Array.from(new Set([...categoryOptions, ...catalogCategories, ...dynamicCategories]));
    return ["All", ...merged];
  }, [catalogCategories, catalogProducts]);
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
        product.details.toLowerCase().includes(query) ||
        String(product.storageGb || "").toLowerCase().includes(query) ||
        String(product.networkLock || "").toLowerCase().includes(query) ||
        String(product.networkCarrier || "").toLowerCase().includes(query);
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

    if (!checkoutCurrencySupported) {
      setPaymentStatus({
        state: "error",
        message: `Checkout currently supports ${supportedCurrencyList} only.`,
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
  }, [
    activePricing.currency,
    cartItems.length,
    checkout.email,
    checkoutCurrencySupported,
    resolvedPaystackPublicKey,
    supportedCurrencyList,
    total,
  ]);

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

    if (!checkoutCurrencySupported) {
      setPaymentStatus({
        state: "error",
        message: `Checkout currently supports ${supportedCurrencyList} only.`,
      });
      return;
    }

    if (transferOnly && !applePayCurrencySupported) {
      setPaymentStatus({
        state: "error",
        message: `Apple Pay is currently available for ${applePayCurrencyList} only.`,
      });
      return;
    }

    const paystackPublicKey = resolvedPaystackPublicKey;
    if (!paystackPublicKey) {
      setPaymentStatus({ state: "error", message: "Missing Paystack public key." });
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

  const trackingProgressIndex = trackingOrder ? trackingStepIndex(trackingOrder.status) : 0;
  const isTrackingCancelled = trackingOrder
    ? normalizeTrackingStatus(trackingOrder.status) === "cancelled"
    : false;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(6,182,212,0.16),transparent_38%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.1),transparent_35%),linear-gradient(180deg,#f9fcff_0%,#f4f7fb_45%,#eef2f8_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] text-sm font-extrabold tracking-wide text-white shadow-[0_12px_30px_rgba(3,105,161,0.35)]">
                SD
              </span>
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-slate-900">Sirdavid Gadgets</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-700">Premium Storefront</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 sm:gap-3">
              {isCartPage || isTrackingPage || isPolicyPage ? (
                <button
                  type="button"
                  onClick={() => navigate(storeHomePath)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Back To Store
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(3,105,161,0.33)] transition hover:brightness-110"
                >
                  <FiShoppingBag className="h-4 w-4" />
                  Cart ({cartCount})
                </button>
              )}
              {!isTrackingPage && !isPolicyPage ? (
                <button
                  type="button"
                  onClick={() => navigate("/track-order")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FiTruck className="h-4 w-4" />
                  Track
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isPolicyPage ? (
            <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="static h-fit rounded-3xl border border-slate-200/80 bg-white/92 p-5 shadow-[0_22px_48px_rgba(15,23,42,0.1)] backdrop-blur lg:sticky lg:top-24">
                <p className="text-xs font-semibold tracking-[0.08em] text-cyan-700">Policy Hub</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Store Policies & Notices</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{activePolicyMeta.description}</p>
                <nav className="mt-5 space-y-2">
                  {SHOP_POLICY_LINKS.map((link) => {
                    const linkMeta = SHOP_POLICY_META[link.path] || { tag: "Policy" };
                    const isActiveLink = link.path === policyPath;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${isActiveLink
                          ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span className="text-sm font-semibold">{link.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${isActiveLink ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                        >
                          {linkMeta.tag}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-xs font-semibold tracking-[0.08em] text-slate-600">Need help?</p>
                  <p className="mt-1 text-sm text-slate-700">For order or policy questions, contact support.</p>
                  <a
                    href="mailto:support@sirdavid.site"
                    className="mt-2 inline-flex rounded-lg bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_22px_rgba(3,105,161,0.28)] hover:brightness-110"
                  >
                    support@sirdavid.site
                  </a>
                  <p className="mt-2 text-[11px] text-slate-500">Response time: within 24 hours.</p>
                </div>
              </aside>

              <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 sm:px-8">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {activePolicyMeta.tag}
                  </span>
                  <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">{policyPage.title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">{policyPage.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                      Effective March 5, 2026
                    </span>
                    <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                      Applies to all storefront orders
                    </span>
                    <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
                      Business: Sirdavid Gadgets
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-6 sm:p-8">
                  {policyPage.sections.map((section, index) => (
                    <section key={section.heading} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{section.heading}</h2>
                      </div>
                      <div className="mt-3 space-y-3 pl-0.5">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            </section>
          ) : isTrackingPage ? (
            <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 sm:px-8">
                  <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    Order Tracking
                  </p>
                  <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Track your package</h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                    Enter your order reference or tracking number to view real-time fulfillment status.
                  </p>
                </div>

                <div className="space-y-5 p-6 sm:p-8">
                  <form onSubmit={handleTrackOrder} className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Order Reference / Tracking Number
                    </label>
                    <input
                      value={trackingReference}
                      onChange={(event) => setTrackingReference(event.target.value)}
                      className={inputClass}
                      placeholder="Example: SD-12345678 or SDV-12345678-AB12CD"
                    />
                    <button
                      type="submit"
                      disabled={trackingState.state === "loading"}
                      className="w-full rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(3,105,161,0.28)] transition hover:brightness-110 disabled:opacity-70"
                    >
                      {trackingState.state === "loading" ? "Checking..." : "Track Order"}
                    </button>
                  </form>

                  {trackingState.state === "error" ? (
                    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {trackingState.message}
                    </p>
                  ) : null}

                  <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status Flow</p>
                    <div className="mt-3 space-y-3">
                      {[
                        { key: "paid", label: "Payment Confirmed" },
                        { key: "processing", label: "Order Processing" },
                        { key: "in_route", label: "In Route" },
                        { key: "completed", label: "Delivered" },
                      ].map((step, index) => {
                        const stepOrder = index + 1;
                        const isCompleted = trackingProgressIndex >= stepOrder && !isTrackingCancelled;
                        return (
                          <div key={step.key} className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${isCompleted
                                ? "border-cyan-600 bg-cyan-600 text-white"
                                : "border-slate-300 bg-white text-slate-500"
                                }`}
                            >
                              {stepOrder}
                            </span>
                            <p className={`text-sm font-medium ${isCompleted ? "text-slate-900" : "text-slate-500"}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </article>

              <aside className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_48px_rgba(15,23,42,0.1)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Current Status</p>
                {trackingState.state === "success" && trackingOrder ? (
                  <section className="mt-3 space-y-4">
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
                    <p className="text-sm text-slate-700">{trackingOrder.statusMessage}</p>

                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3 text-slate-700">
                        <span>Tracking number</span>
                        <span className="font-semibold text-slate-900">
                          {trackingOrder.trackingNumber || "Not assigned yet"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-700">
                        <span>Created</span>
                        <span className="font-semibold text-slate-900">
                          {trackingOrder.createdAt ? new Date(trackingOrder.createdAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-700">
                        <span>Total</span>
                        <span className="font-semibold text-slate-900">
                          {formatMoney(trackingOrder.total || 0, trackingOrder.currency || activePricing.currency)}
                        </span>
                      </div>
                    </div>
                  </section>
                ) : (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Enter your order reference to load delivery and payment status details.
                  </div>
                )}
              </aside>
            </section>
          ) : lastOrder ? (
            <section className="mx-auto max-w-5xl space-y-6">
              <article className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-cyan-700 px-6 py-7 text-white sm:px-8">
                  <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {lastOrder.paymentStatus === "paid" ? "Payment Successful" : "Order Placed"}
                  </p>
                  <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                    {lastOrder.paymentStatus === "paid" ? "Payment Confirmed" : "Order Received"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50 sm:text-base">
                    Your order has been captured successfully and is now in our fulfillment queue.
                  </p>
                </div>

                <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Reference</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">{lastOrder.reference}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Amount Paid</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatMoney(lastOrder.total, lastOrder.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Payment</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {lastOrder.paymentStatus === "paid" ? "Confirmed" : "Pending"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Order Time</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {lastOrder.createdAt ? new Date(lastOrder.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>
              </article>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.09)] sm:p-7">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">What happens next</h2>
                  <ul className="mt-4 space-y-3 text-sm text-slate-700">
                    <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      1. We confirm product availability and prepare dispatch.
                    </li>
                    <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      2. Tracking status updates as your order moves to processing and in-route.
                    </li>
                    <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      3. Delivery confirmation is reflected on the tracking page.
                    </li>
                  </ul>
                  {sendStatus.state !== "idle" ? (
                    <p
                      className={`mt-4 rounded-xl border px-3 py-2 text-sm ${sendStatus.state === "error"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                    >
                      {sendStatus.message}
                    </p>
                  ) : null}
                </section>

                <aside className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.09)] sm:p-7">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">Order Actions</h2>
                  <p className="mt-2 text-sm text-slate-600">Track this order now or continue shopping.</p>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/track-order?reference=${encodeURIComponent(lastOrder.reference)}`)}
                      className="w-full rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(3,105,161,0.28)] transition hover:brightness-110"
                    >
                      Track This Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLastOrder(null);
                        setSendStatus({ state: "idle", message: "" });
                        setPaymentStatus({ state: "idle", message: "" });
                        navigate(storeHomePath);
                      }}
                      className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </aside>
              </div>
            </section>
          ) : isCartPage ? (
            <section className="mx-auto max-w-6xl space-y-6">
              <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 text-white sm:px-8">
                  <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    Checkout
                  </p>
                  <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Complete your order</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                    Review your cart, confirm delivery details, and place your order securely.
                  </p>
                </div>
                <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Items</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{cartCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Subtotal</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {formatMoney(subtotal, activePricing.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Shipping</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {formatMoney(shipping, activePricing.currency)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-cyan-700">Total</p>
                    <p className="mt-1 text-lg font-semibold text-cyan-900">
                      {formatMoney(total, activePricing.currency)}
                    </p>
                  </div>
                </div>
              </section>

              {cartItems.length === 0 ? (
                <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-10 text-center shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                  <h2 className="font-display text-3xl font-semibold text-slate-900">Your cart is empty</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Add gadgets from the storefront, then return here to complete checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(storeHomePath)}
                    className="mt-6 rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(3,105,161,0.28)] transition hover:brightness-110"
                  >
                    Continue Shopping
                  </button>
                </section>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                  <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.09)] sm:p-7">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-2xl font-semibold text-slate-900">Order Summary</h2>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Clear Cart
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {cartItems.map((item) => (
                        <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                          <div className="flex gap-3">
                            <img
                              src={getProductGallery(item)[0] || PRODUCT_FALLBACK_IMAGE}
                              alt={item.name}
                              className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                                <p className="text-sm font-semibold text-slate-900">
                                  {formatMoney(item.totalPrice, activePricing.currency)}
                                </p>
                              </div>
                              <BrandPill brand={item.brand} className="mt-1" />
                              <p className="mt-1 text-xs text-slate-500">
                                {formatMoney(item.unitPrice, activePricing.currency)} each
                              </p>
                              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                                >
                                  -
                                </button>
                                <span className="w-7 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>

                  <aside className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.09)] sm:p-7">
                    <h2 className="font-display text-2xl font-semibold text-slate-900">Customer Details</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Fill in delivery information and place your order.
                    </p>

                    <form onSubmit={handlePlaceOrder} className="mt-5 space-y-3">
                      {checkoutErrors.cart && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                          {checkoutErrors.cart}
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
                        className="w-full rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(3,105,161,0.28)] transition hover:brightness-110"
                      >
                        {paymentStatus.state === "initializing" || paymentStatus.state === "verifying"
                          ? "Processing..."
                          : "Place Order"}
                      </button>
                      {applePaySupported && applePayCurrencySupported ? (
                        <button
                          type="button"
                          onClick={handleApplePayOrder}
                          disabled={paymentStatus.state === "initializing" || paymentStatus.state === "verifying"}
                          className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-70"
                        >
                          {paymentStatus.state === "initializing" || paymentStatus.state === "verifying"
                            ? "Processing..."
                            : "Pay with Apple Pay"}
                        </button>
                      ) : null}
                      {paymentStatus.message ? (
                        <p
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            paymentStatus.state === "error"
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : paymentStatus.state === "ready"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {paymentStatus.message}
                        </p>
                      ) : null}
                    </form>
                  </aside>
                </div>
              )}
            </section>
          ) : (
            <div className="grid gap-7 lg:grid-cols-[1.72fr_0.88fr]">
              <section className="space-y-5">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-200/60 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-sky-200/70 blur-3xl" />
                  <div className="relative">
                    <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-800">
                      Sirdavid Storefront
                    </p>
                    <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                      High-end gadgets with secure, fast checkout
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                      Shop verified devices, compare by category, and buy confidently with location-aware local pricing.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const firstSection = document.getElementById("catalog-section");
                          if (firstSection) firstSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(3,105,161,0.3)] transition hover:brightness-110"
                      >
                        Browse Catalog
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/track-order")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiTruck className="h-4 w-4" />
                        Track Existing Order
                      </button>
                    </div>

                    <div className="mt-6 grid gap-2 sm:grid-cols-3">
                      {STORE_TRUST_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
                          >
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                              <Icon className="h-4 w-4" />
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.note}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="sticky top-20 z-20 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4">
                  <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <FiFilter className="h-3.5 w-3.5" />
                    Catalog Controls
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search products..."
                        className={`${inputClass} pl-9`}
                      />
                    </div>
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
                </section>

                <section id="catalog-section" className="space-y-8">
                  {groupedVisibleProducts.map((group) => (
                    <section key={group.category} className="space-y-4">
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <h2 className="font-display text-2xl font-semibold text-slate-900">{group.category}</h2>
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Curated selection</p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                          {categoryItemCounts[group.category] ?? group.items.length} items
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
                          const specs = getProductSpecs(product);
                          const cartItem = cartItemsById.get(product.id);
                          const productQuantity = Number(cartItem?.quantity || 0);
                          const maxStock = Math.max(0, Number(product.stock || cartItem?.maxStock || 0));
                          const canDecreaseProductQuantity = productQuantity > 0;
                          const canIncreaseProductQuantity = productQuantity < maxStock;

                          return (
                            <article
                              key={product.id}
                              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_46px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.12)]"
                            >
                              <div className="relative overflow-hidden">
                                <img
                                  src={selectedImage}
                                  alt={product.name}
                                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/45 to-transparent" />
                                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-700">
                                    {product.category}
                                  </span>
                                  <span className="rounded-full bg-cyan-300/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-900">
                                    {product.condition}
                                  </span>
                                </div>
                              </div>

                              {gallery.length > 1 ? (
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
                                      className={`h-12 w-12 flex-none overflow-hidden rounded-lg border ${index === selectedIndex ? "border-cyan-500" : "border-slate-200"
                                        }`}
                                    >
                                      <img src={imageUrl} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              ) : null}

                              <div className="p-5">
                                <h3 className="font-display text-2xl font-semibold text-slate-900">{product.name}</h3>
                                <BrandPill brand={product.brand} className="mt-2" />
                                {specs.length > 0 ? (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {specs.map((spec) => (
                                      <span
                                        key={`${product.id}-${spec}`}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-600"
                                      >
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                                <p className="mt-3 min-h-[44px] text-sm leading-relaxed text-slate-600">{product.details}</p>

                                <div className="mt-4 flex items-end justify-between">
                                  <p className="text-2xl font-bold text-slate-900">
                                    {formatMoney(toPrice(product.basePriceUsd, activePricing), activePricing.currency)}
                                  </p>
                                </div>

                                {productQuantity > 0 ? (
                                  <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/80 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
                                          In Cart
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900">
                                          {productQuantity} {productQuantity === 1 ? "item" : "items"} selected
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => navigate("/cart")}
                                        className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
                                      >
                                        Go to Cart
                                      </button>
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white px-2 py-1.5">
                                      <button
                                        type="button"
                                        aria-label={`Decrease ${product.name} quantity`}
                                        onClick={() => updateQuantity(product.id, productQuantity - 1)}
                                        disabled={!canDecreaseProductQuantity}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-base font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        -
                                      </button>
                                      <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                                        {productQuantity}
                                      </span>
                                      <button
                                        type="button"
                                        aria-label={`Increase ${product.name} quantity`}
                                        onClick={() => updateQuantity(product.id, productQuantity + 1)}
                                        disabled={!canIncreaseProductQuantity}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-base font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => addToCart(product)}
                                    disabled={Number(product.stock) <= 0}
                                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${Number(product.stock) > 0
                                      ? "bg-[linear-gradient(135deg,#0f172a,#0369a1)] shadow-[0_12px_28px_rgba(3,105,161,0.3)] hover:brightness-110"
                                      : "cursor-not-allowed bg-slate-400"
                                      }`}
                                  >
                                    <FiShoppingBag className="h-4 w-4" />
                                    {Number(product.stock) > 0 ? "Add to Cart" : "Out of Stock"}
                                  </button>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  {visibleProducts.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                      No gadgets match your current filters. Try changing category or search keywords.
                    </div>
                  ) : null}
                </section>
              </section>

              <aside className="h-fit rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_22px_48px_rgba(15,23,42,0.1)] lg:sticky lg:top-24">
                <div className="rounded-2xl bg-[linear-gradient(135deg,#0f172a,#075985)] p-4 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">Cart Summary</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{formatMoney(total, activePricing.currency)}</p>
                  <p className="text-xs text-cyan-100">Subtotal + shipping included</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">Your Cart</h2>
                  {cartItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                {cartItems.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No items yet. Add products to start checkout.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <BrandPill brand={item.brand} className="mt-1" />
                        <p className="mt-1 text-xs text-slate-500">{formatMoney(item.unitPrice, activePricing.currency)} each</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-1.5 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 text-slate-700"
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

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, activePricing.currency)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{formatMoney(shipping, activePricing.currency)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                    <span>Total</span>
                    <span>{formatMoney(total, activePricing.currency)}</span>
                  </div>
                </div>

                {cartItems.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0f172a,#0369a1)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(3,105,161,0.3)] transition hover:brightness-110"
                  >
                    Go To Cart & Checkout
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                ) : null}
              </aside>
            </div>
          )}
        </main>
        <footer className="border-t border-slate-200/80 bg-white/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
            <p className="text-xs text-slate-500">
              Sirdavid Gadgets • Premium new and fairly used gadgets with secure checkout and responsive support.
            </p>
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
    </div>
  );
}
