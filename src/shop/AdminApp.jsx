import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiRefreshCw } from "react-icons/fi";
import usePricingContext from "../hooks/usePricingContext";
import { formatMoney } from "../lib/pricing";
import { BrandPill } from "./brandIdentity";
import { defaultShippingConfig, normalizeProduct, normalizeShippingConfig } from "./products";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-cyan-300/60 focus:border-cyan-500 focus:ring";

const statusOptions = ["new", "processing", "paid", "shipped", "completed", "cancelled"];
const initialCategoryOptions = [
  "Phones",
  "Laptops",
  "Tablets",
  "Wearables",
  "Audio",
  "Gaming",
  "Accessories",
  "Smart Home",
  "Cameras",
  "Networking",
  "Storage",
  "Monitors",
  "Components",
];
const initialConditionOptions = ["New", "Used", "Used - Excellent", "Used - Very Good", "Used - Good"];
const FALLBACK_NGN_PER_USD = 1600;
const ADMIN_BASE_PATH = "/secure-admin-portal-xyz";
const adminPages = [
  { id: "orders", label: "Orders", description: "Track and update order statuses" },
  { id: "add-gadget", label: "Add Gadget", description: "Create and edit catalog items" },
  { id: "gadgets", label: "Gadgets List", description: "Manage all listed products" },
  { id: "shipping", label: "Shipping", description: "Configure checkout shipping rules" },
];
const allowedAdminPageIds = new Set(adminPages.map((page) => page.id));
const phoneModelsByBrand = {
  Apple: [
    "iPhone SE (2nd Gen)",
    "iPhone 12 mini",
    "iPhone 12",
    "iPhone 12 Pro",
    "iPhone 12 Pro Max",
    "iPhone 13 mini",
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 13 Pro Max",
    "iPhone SE (3rd Gen)",
    "iPhone 14",
    "iPhone 14 Plus",
    "iPhone 14 Pro",
    "iPhone 14 Pro Max",
    "iPhone 15",
    "iPhone 15 Plus",
    "iPhone 15 Pro",
    "iPhone 15 Pro Max",
    "iPhone 16",
    "iPhone 16 Plus",
    "iPhone 16 Pro",
    "iPhone 16 Pro Max",
    "iPhone 17",
    "iPhone 17 Plus",
    "iPhone 17 Pro",
    "iPhone 17 Pro Max",
  ],
  Samsung: [
    "Galaxy S20",
    "Galaxy S20+",
    "Galaxy S20 Ultra",
    "Galaxy S20 FE",
    "Galaxy S21",
    "Galaxy S21+",
    "Galaxy S21 Ultra",
    "Galaxy S21 FE",
    "Galaxy S22",
    "Galaxy S22+",
    "Galaxy S22 Ultra",
    "Galaxy S23",
    "Galaxy S23+",
    "Galaxy S23 Ultra",
    "Galaxy S23 FE",
    "Galaxy S24",
    "Galaxy S24+",
    "Galaxy S24 Ultra",
    "Galaxy S24 FE",
    "Galaxy S25",
    "Galaxy S25+",
    "Galaxy S25 Ultra",
    "Galaxy A52",
    "Galaxy A53",
    "Galaxy A54",
    "Galaxy A55",
    "Galaxy A56",
    "Galaxy Z Fold2",
    "Galaxy Z Fold3",
    "Galaxy Z Fold4",
    "Galaxy Z Fold5",
    "Galaxy Z Fold6",
    "Galaxy Z Flip3",
    "Galaxy Z Flip4",
    "Galaxy Z Flip5",
    "Galaxy Z Flip6",
  ],
  Google: [
    "Pixel 5",
    "Pixel 5a",
    "Pixel 6",
    "Pixel 6 Pro",
    "Pixel 6a",
    "Pixel 7",
    "Pixel 7 Pro",
    "Pixel 7a",
    "Pixel 8",
    "Pixel 8 Pro",
    "Pixel 8a",
    "Pixel 9",
    "Pixel 9 Pro",
    "Pixel 9 Pro XL",
    "Pixel 9a",
    "Pixel 10",
    "Pixel 10 Pro",
  ],
  Xiaomi: [
    "Mi 10T Pro",
    "Mi 11",
    "11T",
    "11T Pro",
    "Xiaomi 12",
    "Xiaomi 12 Pro",
    "Xiaomi 12T",
    "Xiaomi 12T Pro",
    "Xiaomi 13",
    "Xiaomi 13 Pro",
    "Xiaomi 13T",
    "Xiaomi 13T Pro",
    "Xiaomi 14",
    "Xiaomi 14 Pro",
    "Xiaomi 14T",
    "Xiaomi 14T Pro",
    "Xiaomi 15",
    "Xiaomi 15 Pro",
    "Redmi Note 10",
    "Redmi Note 11",
    "Redmi Note 12",
    "Redmi Note 13",
    "Redmi Note 14",
    "POCO X3 Pro",
    "POCO F3",
    "POCO F4",
    "POCO F5",
    "POCO F6",
  ],
  OnePlus: [
    "OnePlus 8T",
    "OnePlus 9",
    "OnePlus 9 Pro",
    "OnePlus 10 Pro",
    "OnePlus 10T",
    "OnePlus 11",
    "OnePlus 12",
    "OnePlus 13",
    "OnePlus Nord N10",
    "OnePlus Nord 2",
    "OnePlus Nord 3",
    "OnePlus Nord 4",
  ],
  Tecno: [
    "Camon 17",
    "Camon 18",
    "Camon 19",
    "Camon 20",
    "Camon 30",
    "Phantom X",
    "Phantom V Fold",
    "Spark 8",
    "Spark 10 Pro",
    "Spark 20",
    "Pova 5",
    "Pova 6",
  ],
  Infinix: [
    "Note 10 Pro",
    "Note 11",
    "Note 12",
    "Note 30 Pro",
    "Note 40 Pro",
    "Zero 8",
    "Zero 20",
    "Zero 30",
    "Hot 12",
    "Hot 20",
    "Hot 40 Pro",
  ],
};

const nonPhoneModelsByBrand = {
  Apple: {
    Laptops: ["MacBook Air M1", "MacBook Air M2", "MacBook Air M3", "MacBook Pro 14", "MacBook Pro 16"],
    Tablets: ["iPad 10th Gen", "iPad Air (5th Gen)", "iPad Pro 11", "iPad Pro 13", "iPad mini (6th Gen)"],
    Wearables: ["Apple Watch SE (2nd Gen)", "Apple Watch Series 8", "Apple Watch Series 9", "Apple Watch Ultra 2"],
    Audio: ["AirPods (3rd Gen)", "AirPods Pro (2nd Gen)", "AirPods Max"],
    Accessories: ["Apple Pencil (2nd Gen)", "Magic Keyboard"],
  },
  Samsung: {
    Laptops: ["Galaxy Book2 Pro", "Galaxy Book3 Pro", "Galaxy Book4 Pro"],
    Tablets: ["Galaxy Tab S8", "Galaxy Tab S9", "Galaxy Tab A9+"],
    Wearables: ["Galaxy Watch 5", "Galaxy Watch 6", "Galaxy Watch 7"],
    Audio: ["Galaxy Buds2", "Galaxy Buds2 Pro", "Galaxy Buds3 Pro"],
    Accessories: ["S Pen Pro", "45W Super Fast Charger"],
  },
  Google: {
    Tablets: ["Pixel Tablet"],
    Wearables: ["Pixel Watch", "Pixel Watch 2", "Pixel Watch 3"],
    Audio: ["Pixel Buds A-Series", "Pixel Buds Pro"],
    "Smart Home": ["Nest Hub (2nd Gen)", "Nest Audio", "Nest Cam"],
    Networking: ["Nest Wifi Pro"],
  },
  Xiaomi: {
    Tablets: ["Xiaomi Pad 5", "Xiaomi Pad 6", "Xiaomi Pad 6 Pro"],
    Wearables: ["Xiaomi Watch S3", "Redmi Watch 4", "Smart Band 8"],
    Audio: ["Redmi Buds 4 Pro", "Xiaomi Buds 5"],
    "Smart Home": ["Xiaomi Smart Camera C300", "Mi Smart Home Hub"],
  },
  OnePlus: {
    Tablets: ["OnePlus Pad", "OnePlus Pad 2"],
    Wearables: ["OnePlus Watch 2"],
    Audio: ["OnePlus Buds Pro 2", "OnePlus Buds 3"],
    Accessories: ["SUPERVOOC 100W Charger"],
  },
  Dell: {
    Laptops: ["XPS 13", "XPS 15", "Inspiron 15", "Latitude 5420", "G15"],
    Monitors: ["UltraSharp U2720Q", "P2422H"],
    Accessories: ["WD19 Dock"],
  },
  Lenovo: {
    Laptops: ["ThinkPad X1 Carbon", "ThinkPad T14", "IdeaPad 5", "Legion 5", "Yoga 7"],
    Tablets: ["Tab P11"],
    Gaming: ["Legion Go"],
    Accessories: ["ThinkPad Universal USB-C Dock"],
  },
  HP: {
    Laptops: ["Spectre x360 14", "Envy x360 13", "Pavilion 15", "OMEN 16", "ProBook 440"],
    Monitors: ["M24f", "E24 G4"],
    Accessories: ["HP USB-C Dock G5"],
  },
  Sony: {
    Gaming: ["PlayStation 4 Pro", "PlayStation 5", "PlayStation 5 Digital Edition"],
    Audio: ["WH-1000XM4", "WH-1000XM5", "WF-1000XM5", "Pulse 3D Headset"],
    Cameras: ["Alpha A6400", "Alpha A7 III", "ZV-E10"],
  },
  Tecno: {
    Tablets: ["MegaPad 10"],
    Audio: ["Sonic 1 Earbuds"],
    Accessories: ["Fast Charger 45W"],
  },
  Infinix: {
    Tablets: ["XPAD"],
    Audio: ["XE23 Earbuds"],
    Accessories: ["Fast Charge Adapter 45W"],
  },
};

function buildPhoneEntries(models) {
  return models.map((model) => ({
    model,
    category: "Phones",
    condition: "Used - Excellent",
    details: "Popular phone model from 2020 to current lineup. Confirm exact storage and variant before publishing.",
  }));
}

function buildCategoryEntries(brand) {
  const byCategory = nonPhoneModelsByBrand[brand] || {};
  return Object.entries(byCategory).flatMap(([category, models]) =>
    models.map((model) => ({
      model,
      category,
      condition: "Used - Very Good",
      details: `${brand} ${category.toLowerCase()} model. Confirm exact variant and included accessories before publishing.`,
    }))
  );
}

const popularBrandCatalog = {
  Apple: [
    ...buildPhoneEntries(phoneModelsByBrand.Apple),
    ...buildCategoryEntries("Apple"),
  ],
  Samsung: [
    ...buildPhoneEntries(phoneModelsByBrand.Samsung),
    ...buildCategoryEntries("Samsung"),
  ],
  Dell: [...buildCategoryEntries("Dell")],
  Lenovo: [...buildCategoryEntries("Lenovo")],
  Sony: [...buildCategoryEntries("Sony")],
  HP: [...buildCategoryEntries("HP")],
  Google: [
    ...buildPhoneEntries(phoneModelsByBrand.Google),
    ...buildCategoryEntries("Google"),
  ],
  Xiaomi: [
    ...buildPhoneEntries(phoneModelsByBrand.Xiaomi),
    ...buildCategoryEntries("Xiaomi"),
  ],
  OnePlus: [
    ...buildPhoneEntries(phoneModelsByBrand.OnePlus),
    ...buildCategoryEntries("OnePlus"),
  ],
  Tecno: [
    ...buildPhoneEntries(phoneModelsByBrand.Tecno),
    ...buildCategoryEntries("Tecno"),
  ],
  Infinix: [
    ...buildPhoneEntries(phoneModelsByBrand.Infinix),
    ...buildCategoryEntries("Infinix"),
  ],
};

const emptyProductForm = {
  id: "",
  model: "",
  name: "",
  brand: "",
  condition: "New",
  category: "",
  basePriceNgn: "",
  image: "",
  details: "",
  isActive: true,
};

function normalizeProductForForm(product, ngnPerUsd) {
  const normalized = normalizeProduct(product);
  const brandCatalog = popularBrandCatalog[normalized.brand] || [];
  const exactModel = brandCatalog.find((entry) => entry.model.toLowerCase() === normalized.name.toLowerCase());
  const prefixedModel = brandCatalog.find(
    (entry) => `${normalized.brand} ${entry.model}`.toLowerCase() === normalized.name.toLowerCase()
  );
  const inferredModel = exactModel?.model || prefixedModel?.model || normalized.name;

  return {
    id: normalized.id,
    model: inferredModel,
    name: normalized.name,
    brand: normalized.brand,
    condition: normalized.condition,
    category: normalized.category,
    basePriceNgn: String(Math.round(normalized.basePriceUsd * ngnPerUsd)),
    image: normalized.image,
    details: normalized.details,
    isActive: Boolean(normalized.isActive),
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read selected image."));
    reader.readAsDataURL(file);
  });
}

function getModelTemplate(brand, category, model) {
  const brandCatalog = popularBrandCatalog[String(brand || "").trim()] || [];
  const wantedModel = String(model || "").trim().toLowerCase();
  const wantedCategory = String(category || "").trim().toLowerCase();
  if (!wantedModel) return null;
  return (
    brandCatalog.find(
      (entry) =>
        entry.model.toLowerCase() === wantedModel &&
        (!wantedCategory || String(entry.category || "").trim().toLowerCase() === wantedCategory)
    ) || null
  );
}

export default function AdminApp() {
  const pricingContext = usePricingContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState({});

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");
  const [selectedGadgetCategory, setSelectedGadgetCategory] = useState("All");
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploadMessage, setImageUploadMessage] = useState("");

  const [shipping, setShipping] = useState(() => normalizeShippingConfig(defaultShippingConfig));
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const [authError, setAuthError] = useState("");

  const isOrdersTableMissing = ordersError.includes("public.orders is missing");
  const isProductsTableMissing = productsError.includes("public.shop_products");
  const isShippingTableMissing = shippingError.includes("public.shop_settings");
  const brandSuggestions = useMemo(() => {
    return Array.from(
      new Set([
        ...Object.keys(popularBrandCatalog),
        ...products.map((product) => String(product.brand || "").trim()),
        String(productForm.brand || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.brand, products]);
  const modelSuggestions = useMemo(() => {
    const selectedCategory = String(productForm.category || "").trim().toLowerCase();
    if (!selectedCategory) {
      return Array.from(new Set([String(productForm.model || "").trim(), String(productForm.name || "").trim()])).filter(
        Boolean
      );
    }
    const catalogModels = (popularBrandCatalog[productForm.brand] || [])
      .filter(
        (entry) =>
          !selectedCategory || String(entry.category || "").trim().toLowerCase() === selectedCategory
      )
      .map((entry) => entry.model);
    return Array.from(
      new Set([
        ...catalogModels,
        String(productForm.model || "").trim(),
        String(productForm.name || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.brand, productForm.category, productForm.model, productForm.name]);
  const categorySuggestions = useMemo(() => {
    const catalogCategories = Object.values(popularBrandCatalog)
      .flatMap((entries) => entries.map((entry) => String(entry.category || "").trim()))
      .filter(Boolean);
    return Array.from(
      new Set([
        ...initialCategoryOptions,
        ...catalogCategories,
        ...products.map((product) => String(product.category || "").trim()),
        String(productForm.category || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.category, products]);
  const conditionSuggestions = useMemo(() => {
    return Array.from(
      new Set([
        ...initialConditionOptions,
        ...products.map((product) => String(product.condition || "").trim()),
        String(productForm.condition || "").trim(),
      ])
    ).filter(Boolean);
  }, [productForm.condition, products]);
  const gadgetCategories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => String(product.category || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  );
  const filteredGadgetProducts = useMemo(() => {
    if (selectedGadgetCategory === "All") return products;
    return products.filter((product) => String(product.category || "").trim() === selectedGadgetCategory);
  }, [products, selectedGadgetCategory]);
  const groupedGadgetProducts = useMemo(() => {
    const grouped = new Map();
    const sorted = [...filteredGadgetProducts].sort((a, b) => {
      const categoryCompare = String(a.category || "").localeCompare(String(b.category || ""));
      if (categoryCompare !== 0) return categoryCompare;
      const orderCompare = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      if (orderCompare !== 0) return orderCompare;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    sorted.forEach((product) => {
      const category = String(product.category || "").trim() || "Uncategorized";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(product);
    });

    return Array.from(grouped.entries()).map(([category, items]) => ({ category, items }));
  }, [filteredGadgetProducts]);
  const ngnPerUsd = useMemo(() => {
    const fromRates = Number(pricingContext?.rates?.NGN || 0);
    const fromExchange = pricingContext?.currency === "NGN" ? Number(pricingContext?.exchangeRate || 0) : 0;
    if (Number.isFinite(fromRates) && fromRates > 0) return fromRates;
    if (Number.isFinite(fromExchange) && fromExchange > 0) return fromExchange;
    return FALLBACK_NGN_PER_USD;
  }, [pricingContext.currency, pricingContext.exchangeRate, pricingContext.rates]);
  const activePage = useMemo(() => {
    const normalizedPath = String(location.pathname || "").replace(/\/+$/, "");
    if (!normalizedPath.startsWith(ADMIN_BASE_PATH)) return "orders";
    const tail = normalizedPath.slice(ADMIN_BASE_PATH.length).replace(/^\/+/, "");
    if (!tail) return "orders";
    return allowedAdminPageIds.has(tail) ? tail : "orders";
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setCheckingSession(true);
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (!response.ok || !data?.ok) {
          setCheckingSession(false);
          return;
        }

        setIsAuthed(true);
        setAdminEmail(data?.user?.email || "");
        await loadAllAdminData();
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthed) return;

    const normalizedPath = String(location.pathname || "").replace(/\/+$/, "");
    const inAdminBase = normalizedPath.startsWith(ADMIN_BASE_PATH);
    const tail = inAdminBase ? normalizedPath.slice(ADMIN_BASE_PATH.length).replace(/^\/+/, "") : "";
    const isValidPage = allowedAdminPageIds.has(tail);

    if (!inAdminBase || !tail || !isValidPage) {
      navigate(`${ADMIN_BASE_PATH}/orders`, { replace: true });
    }
  }, [isAuthed, location.pathname, navigate]);

  useEffect(() => {
    if (selectedGadgetCategory === "All") return;
    if (gadgetCategories.includes(selectedGadgetCategory)) return;
    setSelectedGadgetCategory("All");
  }, [gadgetCategories, selectedGadgetCategory]);

  async function loadAllAdminData() {
    await Promise.all([loadOrders(), loadProducts(), loadShipping()]);
  }

  function goToAdminPage(pageId) {
    navigate(`${ADMIN_BASE_PATH}/${pageId}`);
  }

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setOrdersError(data?.error || "Failed to load orders.");
        }
        setOrdersLoading(false);
        return false;
      }

      setOrders(data.orders || []);
      return true;
    } catch {
      setOrdersError("Failed to load orders.");
      return false;
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");
    try {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setProductsError(data?.error || "Failed to load products.");
        }
        setProductsLoading(false);
        return false;
      }

      setProducts(Array.isArray(data.products) ? data.products.map((product) => normalizeProduct(product)) : []);
      return true;
    } catch {
      setProductsError("Failed to load products.");
      return false;
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadShipping() {
    setShippingLoading(true);
    setShippingError("");
    try {
      const response = await fetch("/api/admin/shipping", {
        method: "GET",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
        } else {
          setShippingError(data?.error || "Failed to load shipping settings.");
        }
        setShippingLoading(false);
        return false;
      }

      setShipping(normalizeShippingConfig(data.shipping || defaultShippingConfig));
      return true;
    } catch {
      setShippingError("Failed to load shipping settings.");
      return false;
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        setAuthError(data?.error || "Unable to sign in.");
        return;
      }

      setIsAuthed(true);
      setPassword("");
      await loadAllAdminData();
    } catch {
      setAuthError("Unable to sign in.");
    }
  }

  async function updateStatus(orderId, nextStatus) {
    setUpdatingOrderStatus((prev) => ({ ...prev, [orderId]: true }));
    setOrdersError("");
    try {
      const response = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setOrdersError(data?.error || "Status update failed.");
        return;
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
      );
    } catch {
      setOrdersError("Status update failed.");
    } finally {
      setUpdatingOrderStatus((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  function handleBrandChange(nextBrand) {
    const brand = String(nextBrand || "").trim();
    setProductForm((prev) => {
      const selectedCategory = String(prev.category || "").trim().toLowerCase();
      const brandCatalog = (popularBrandCatalog[brand] || []).filter(
        (entry) =>
          !selectedCategory || String(entry.category || "").trim().toLowerCase() === selectedCategory
      );
      const existingModelStillValid = brandCatalog.some((entry) => entry.model === prev.model);
      const nextModel = existingModelStillValid ? prev.model : "";
      return {
        ...prev,
        brand,
        model: nextModel,
      };
    });
  }

  function handleCategoryChange(nextCategory) {
    const category = String(nextCategory || "").trim();
    const normalizedCategory = category.toLowerCase();

    setProductForm((prev) => {
      const selectedBrand = String(prev.brand || "").trim();
      const selectedBrandCatalog = popularBrandCatalog[selectedBrand] || [];
      const existingModelStillValid = selectedBrandCatalog.some(
        (entry) =>
          entry.model === prev.model &&
          (!normalizedCategory || String(entry.category || "").trim().toLowerCase() === normalizedCategory)
      );

      return {
        ...prev,
        category,
        model: existingModelStillValid ? prev.model : "",
      };
    });
  }

  function handleModelChange(nextModel) {
    const model = String(nextModel || "").trim();
    const template = getModelTemplate(productForm.brand, productForm.category, model);

    setProductForm((prev) => ({
      ...prev,
      model,
      name: model || prev.name,
      category: template?.category || prev.category,
      condition: template?.condition || prev.condition,
      details: template?.details || prev.details,
      image: prev.image || template?.image || prev.image,
    }));
  }

  async function handleSaveProduct(event) {
    event.preventDefault();
    setProductsError("");
    setImageUploadError("");
    setSavingProduct(true);

    const payload = {
      id: productForm.id.trim(),
      name: String(productForm.model || productForm.name || "").trim(),
      brand: String(productForm.brand || "").trim(),
      condition: String(productForm.condition || "").trim(),
      category: String(productForm.category || "").trim(),
      basePriceUsd: Number(productForm.basePriceNgn || 0) / Math.max(1, ngnPerUsd),
      image: String(productForm.image || "").trim(),
      details: String(productForm.details || "").trim(),
      isActive: Boolean(productForm.isActive),
    };

    const isEditing = Boolean(editingProductId);

    try {
      const endpoint = isEditing
        ? `/api/admin/products?id=${encodeURIComponent(editingProductId)}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setProductsError(data?.error || "Failed to save product.");
        return;
      }

      const nextProduct = normalizeProduct(data.product || payload);
      if (isEditing) {
        setProducts((prev) => prev.map((item) => (item.id === editingProductId ? nextProduct : item)));
      } else {
        setProducts((prev) => [nextProduct, ...prev]);
      }

      setProductForm(emptyProductForm);
      setEditingProductId("");
      setImageUploadMessage("");
      await loadProducts();
    } catch {
      setProductsError("Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleDeleteProduct(id) {
    setProductsError("");
    setDeletingProductId(id);

    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setProductsError(data?.error || "Failed to delete product.");
        return;
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch {
      setProductsError("Failed to delete product.");
    } finally {
      setDeletingProductId("");
    }
  }

  async function handleProductImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageUploadError("");
    setImageUploadMessage("");

    if (!String(file.type || "").startsWith("image/")) {
      setImageUploadError("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image is too large. Max size is 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          base64Data: dataUrl,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setImageUploadError(data?.error || "Image upload failed.");
        return;
      }

      setProductForm((prev) => ({ ...prev, image: data.url || prev.image }));
      setImageUploadMessage("Image uploaded successfully.");
    } catch {
      setImageUploadError("Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function saveShippingSettings(event) {
    event.preventDefault();
    setShippingError("");
    setShippingSaving(true);

    try {
      const response = await fetch("/api/admin/shipping", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shipping }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthed(false);
          setAuthError("Your admin session expired. Sign in again.");
          return;
        }
        setShippingError(data?.error || "Failed to save shipping settings.");
        return;
      }

      setShipping(normalizeShippingConfig(data.shipping || shipping));
    } catch {
      setShippingError("Failed to save shipping settings.");
    } finally {
      setShippingSaving(false);
    }
  }

  function logout() {
    fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => {
      // Best-effort logout.
    });

    setIsAuthed(false);
    setOrders([]);
    setProducts([]);
    setPassword("");
    setEditingProductId("");
    setProductForm(emptyProductForm);
    setImageUploadError("");
    setImageUploadMessage("");
    setAuthError("");
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-3xl font-bold text-slate-900">Store Admin</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in with your admin account email and password.</p>
          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              type="email"
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="Admin email"
              className={inputClass}
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className={inputClass}
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
          </form>
          {authError && <p className="mt-3 text-sm text-rose-600">{authError}</p>}
          {isOrdersTableMissing && (
            <p className="mt-2 text-xs text-slate-600">
              Create the table in Supabase SQL Editor using <code>supabase/orders.sql</code>, then try sign in again.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#e0f2fe_0%,#f8fafc_45%,#f1f5f9_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900">Store Admin</h1>
              <p className="text-sm text-slate-600">
                {orders.length} orders, {products.length} products {adminEmail ? `• ${adminEmail}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => loadAllAdminData()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                <FiLogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-4">
            <div className="sm:hidden">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Admin Menu</label>
              <select
                value={activePage}
                onChange={(event) => goToAdminPage(event.target.value)}
                className={inputClass}
              >
                {adminPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>

            <nav className="hidden gap-2 sm:grid sm:grid-cols-2 xl:grid-cols-4">
              {adminPages.map((page) => {
                const isActive = activePage === page.id;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => goToAdminPage(page.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold">{page.label}</p>
                    <p className={`mt-1 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>{page.description}</p>
                  </button>
                );
              })}
            </nav>
          </div>
          {authError && <p className="mt-3 text-sm text-rose-600">{authError}</p>}
        </header>

        <main className="mt-6 space-y-6">
            {activePage === "orders" && (
              <section className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="font-display text-xl font-semibold text-slate-900">Orders</h2>
                  {ordersLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
                </div>
                {ordersError && <p className="px-4 pt-3 text-sm text-rose-600">{ordersError}</p>}
                {isOrdersTableMissing && (
                  <p className="px-4 pt-2 text-xs text-slate-600">
                    Run <code>supabase/orders.sql</code> in Supabase SQL Editor, then refresh.
                  </p>
                )}

                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-slate-100 align-top">
                        <td className="px-4 py-3 font-semibold text-slate-900">{order.reference}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{order.customer_name || "N/A"}</p>
                          <p className="text-xs text-slate-500">{order.customer_email || ""}</p>
                          <p className="text-xs text-slate-500">{order.country || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {formatMoney(order.total || 0, order.currency || "USD")}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status || "new"}
                            disabled={Boolean(updatingOrderStatus[order.id])}
                            onChange={(event) => updateStatus(order.id, event.target.value)}
                            className={inputClass}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!ordersLoading && orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                          No orders found yet. Only paid orders synced to Supabase appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {activePage === "add-gadget" && (
              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    {editingProductId ? "Edit Gadget" : "Add Gadget"}
                  </h2>
                  {productsLoading ? <span className="text-xs text-slate-500">Loading products...</span> : null}
                </div>

                <form onSubmit={handleSaveProduct} className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Category</p>
                      <select
                        className={inputClass}
                        value={productForm.category}
                        onChange={(event) => handleCategoryChange(event.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        {categorySuggestions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Brand</p>
                        {productForm.brand ? <BrandPill brand={productForm.brand} /> : null}
                      </div>
                      <select
                        className={inputClass}
                        value={productForm.brand}
                        onChange={(event) => handleBrandChange(event.target.value)}
                        required
                      >
                        <option value="">Select brand</option>
                        {brandSuggestions.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Model</p>
                      <select
                        className={inputClass}
                        value={productForm.model}
                        onChange={(event) => handleModelChange(event.target.value)}
                        disabled={!productForm.brand || !productForm.category}
                      >
                        <option value="">
                          {!productForm.brand
                            ? "Select brand first"
                            : !productForm.category
                              ? "Select category first"
                              : "Select model"}
                        </option>
                        {modelSuggestions.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pick category first, then brand and model to auto-fill common specifications. You can still edit any field.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Product Name</p>
                      <input
                        className={inputClass}
                        placeholder="Product name"
                        value={productForm.name}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Condition</p>
                      <select
                        className={inputClass}
                        value={productForm.condition}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, condition: event.target.value }))}
                      >
                        {conditionSuggestions.map((condition) => (
                          <option key={condition} value={condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Price (NGN)</p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        placeholder="Price (NGN)"
                        value={productForm.basePriceNgn}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, basePriceNgn: event.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(productForm.isActive)}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                      />
                      Active on storefront
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Stock and sort order are assigned automatically.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        className={inputClass}
                        placeholder="Image URL (auto-filled after upload)"
                        value={productForm.image}
                        onChange={(event) => setProductForm((prev) => ({ ...prev, image: event.target.value }))}
                      />
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProductImageUpload}
                          disabled={uploadingImage}
                        />
                        {uploadingImage ? "Uploading..." : "Upload Image"}
                      </label>
                    </div>
                    {imageUploadError ? <p className="text-xs text-rose-600">{imageUploadError}</p> : null}
                    {imageUploadMessage ? <p className="text-xs text-emerald-700">{imageUploadMessage}</p> : null}
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Product preview"
                        className="h-28 w-28 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : null}
                  </div>

                  <textarea
                    className={inputClass}
                    rows={3}
                    placeholder="Details"
                    value={productForm.details}
                    onChange={(event) => setProductForm((prev) => ({ ...prev, details: event.target.value }))}
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {savingProduct ? "Saving..." : editingProductId ? "Update Gadget" : "Add Gadget"}
                    </button>

                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId("");
                          setProductForm(emptyProductForm);
                          setImageUploadError("");
                          setImageUploadMessage("");
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>

                {productsError && <p className="mt-3 text-sm text-rose-600">{productsError}</p>}
                {isProductsTableMissing && (
                  <p className="mt-2 text-xs text-slate-600">
                    Run <code>supabase/catalog.sql</code> in Supabase SQL Editor to create product + shipping tables.
                  </p>
                )}
              </section>
            )}

            {activePage === "shipping" && (
              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-slate-900">Shipping Settings</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Set how shipping is charged. For percentage, enter a whole number (example: 3 means 3%).
                </p>

                <form onSubmit={saveShippingSettings} className="mt-4 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Shipping style
                  </label>
                  <select
                    value={shipping.mode}
                    onChange={(event) => setShipping((prev) => ({ ...prev, mode: event.target.value }))}
                    className={inputClass}
                    disabled={shippingLoading || shippingSaving}
                  >
                    <option value="hybrid">Smart (higher of minimum fee or percentage)</option>
                    <option value="flat">Fixed fee only</option>
                    <option value="percent">Percentage only</option>
                  </select>

                  {shipping.mode !== "percent" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Fixed fee (base amount)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={shipping.flatUsd}
                        onChange={(event) => setShipping((prev) => ({ ...prev, flatUsd: Number(event.target.value || 0) }))}
                        placeholder="Example: 15"
                        disabled={shippingLoading || shippingSaving}
                      />
                    </div>
                  )}

                  {shipping.mode !== "flat" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Percent of subtotal (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputClass}
                        value={Number((Number(shipping.percentRate || 0) * 100).toFixed(3))}
                        onChange={(event) =>
                          setShipping((prev) => ({
                            ...prev,
                            percentRate: Number(event.target.value || 0) / 100,
                          }))
                        }
                        placeholder="Example: 3"
                        disabled={shippingLoading || shippingSaving}
                      />
                    </div>
                  )}

                  {shipping.mode === "hybrid" && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Minimum shipping floor</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={shipping.minUsd}
                        onChange={(event) => setShipping((prev) => ({ ...prev, minUsd: Number(event.target.value || 0) }))}
                        placeholder="Example: 15"
                        disabled={shippingLoading || shippingSaving}
                      />
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    {shipping.mode === "flat" ? (
                      <p>Customers pay only the fixed shipping fee on every order.</p>
                    ) : shipping.mode === "percent" ? (
                      <p>Shipping = subtotal × percentage (example: 3 means 3% of order subtotal).</p>
                    ) : (
                      <p>Shipping = higher of minimum fee or subtotal percentage. This is best for small and large orders.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={shippingSaving || shippingLoading}
                    className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    {shippingSaving ? "Saving..." : "Save Shipping"}
                  </button>
                </form>

                {shippingError && <p className="mt-3 text-sm text-rose-600">{shippingError}</p>}
                {isShippingTableMissing && (
                  <p className="mt-2 text-xs text-slate-600">
                    Run <code>supabase/catalog.sql</code> in Supabase SQL Editor to create product + shipping tables.
                  </p>
                )}
              </section>
            )}

            {activePage === "gadgets" && (
              <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-slate-900">Gadget List</h2>
                  <span className="text-xs text-slate-500">{filteredGadgetProducts.length} items</span>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGadgetCategory("All")}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedGadgetCategory === "All"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {gadgetCategories.map((category) => {
                    const totalInCategory = products.filter((product) => product.category === category).length;
                    const isActive = selectedGadgetCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedGadgetCategory(category)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          isActive
                            ? "border-cyan-600 bg-cyan-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {category} ({totalInCategory})
                      </button>
                    );
                  })}
                </div>

                {groupedGadgetProducts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No gadgets found in this category.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedGadgetProducts.map((group) => (
                      <section key={group.category} className="overflow-x-auto rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                          <h3 className="text-sm font-semibold text-slate-800">{group.category}</h3>
                          <span className="text-xs text-slate-500">{group.items.length} items</span>
                        </div>
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-white text-slate-600">
                            <tr>
                              <th className="px-3 py-2">Name</th>
                              <th className="px-3 py-2">Brand</th>
                              <th className="px-3 py-2">Price (NGN)</th>
                              <th className="px-3 py-2">Stock</th>
                              <th className="px-3 py-2">Active</th>
                              <th className="px-3 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((product) => (
                              <tr key={product.id} className="border-t border-slate-100">
                                <td className="px-3 py-2">
                                  <p className="font-medium text-slate-900">{product.name}</p>
                                  <p className="text-xs text-slate-500">{product.id}</p>
                                </td>
                                <td className="px-3 py-2">
                                  <BrandPill brand={product.brand} />
                                </td>
                                <td className="px-3 py-2 font-semibold text-slate-900">
                                  {formatMoney(product.basePriceUsd * ngnPerUsd, "NGN")}
                                </td>
                                <td className="px-3 py-2 text-slate-700">{product.stock}</td>
                                <td className="px-3 py-2 text-slate-700">{product.isActive ? "Yes" : "No"}</td>
                                <td className="px-3 py-2">
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProductId(product.id);
                                        setProductForm(normalizeProductForForm(product, ngnPerUsd));
                                        setImageUploadError("");
                                        setImageUploadMessage("");
                                        goToAdminPage("add-gadget");
                                      }}
                                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      disabled={deletingProductId === product.id}
                                      className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                    >
                                      {deletingProductId === product.id ? "Deleting..." : "Delete"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </section>
                    ))}
                  </div>
                )}
              </section>
            )}
        </main>
      </div>
    </div>
  );
}
