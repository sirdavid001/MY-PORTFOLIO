export const SHOP_CATEGORY_OPTIONS = [
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

export const STORAGE_GB_OPTIONS = [16, 32, 64, 128, 256, 512, 1024, 2048];
export const NETWORK_LOCK_OPTIONS = ["Unlocked", "Locked"];
export const NETWORK_CARRIER_OPTIONS = [
  "MTN",
  "Airtel",
  "Glo",
  "9mobile",
  "Verizon",
  "AT&T",
  "T-Mobile",
  "Vodafone",
  "Orange",
  "EE",
  "O2",
  "Other",
];

export const DEFAULT_PRODUCTS = [
  {
    id: "iphone-13-used",
    name: "iPhone 13",
    brand: "Apple",
    condition: "Used - Excellent",
    category: "Phones",
    storageGb: 128,
    batteryHealth: 89,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 520,
    stock: 4,
    image:
      "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=900&q=80",
    details: "128GB, battery health 89%, unlocked and fully tested.",
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "s24-new",
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    condition: "New",
    category: "Phones",
    storageGb: 256,
    batteryHealth: null,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 760,
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80",
    details: "Factory sealed, dual SIM, one-year manufacturer warranty.",
    isActive: true,
    sortOrder: 20,
  },
  {
    id: "xps13-used",
    name: "Dell XPS 13",
    brand: "Dell",
    condition: "Used - Very Good",
    category: "Laptops",
    storageGb: 512,
    batteryHealth: null,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 680,
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=900&q=80",
    details: "Core i7, 16GB RAM, 512GB SSD, fresh OS install included.",
    isActive: true,
    sortOrder: 30,
  },
  {
    id: "airpods-pro-new",
    name: "AirPods Pro (2nd Gen)",
    brand: "Apple",
    condition: "New",
    category: "Accessories",
    storageGb: null,
    batteryHealth: null,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 210,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80",
    details: "Original package with active noise cancellation support.",
    isActive: true,
    sortOrder: 40,
  },
  {
    id: "ps5-used",
    name: "PlayStation 5",
    brand: "Sony",
    condition: "Used - Excellent",
    category: "Gaming",
    storageGb: 825,
    batteryHealth: null,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 440,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80",
    details: "Includes one controller, HDMI cable, and power cable.",
    isActive: true,
    sortOrder: 50,
  },
  {
    id: "watch-9-new",
    name: "Apple Watch Series 9",
    brand: "Apple",
    condition: "New",
    category: "Wearables",
    storageGb: 64,
    batteryHealth: null,
    networkLock: "Unlocked",
    networkCarrier: "",
    basePriceUsd: 350,
    stock: 7,
    image:
      "https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?auto=format&fit=crop&w=900&q=80",
    details: "45mm GPS model with original charger and strap.",
    isActive: true,
    sortOrder: 60,
  },
];

export const DEFAULT_SHIPPING_CONFIG = {
  mode: "hybrid",
  flatUsd: 15,
  percentRate: 0.03,
  minUsd: 15,
};

const SHIPPING_MODES = new Set(["flat", "percent", "hybrid"]);

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toInteger(value, fallback = 0) {
  const num = Number.parseInt(String(value), 10);
  return Number.isFinite(num) ? num : fallback;
}

function toNullableInteger(value, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = {}) {
  if (value == null || value === "") return null;
  const num = Number.parseInt(String(value), 10);
  if (!Number.isFinite(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

function parseImageList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeProductImages(raw) {
  const candidates = [];

  const append = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    candidates.push(trimmed);
  };

  parseImageList(raw?.images).forEach(append);

  const imageField = raw?.image;
  const imageListFromImageField = parseImageList(imageField);
  if (imageListFromImageField.length > 0) {
    imageListFromImageField.forEach(append);
  } else {
    append(imageField);
  }

  const unique = [];
  const seen = new Set();
  candidates.forEach((url) => {
    if (seen.has(url)) return;
    seen.add(url);
    unique.push(url);
  });

  return unique.slice(0, 5);
}

function normalizeNetworkLock(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "locked" ? "Locked" : "Unlocked";
}

export function normalizeShippingConfig(raw) {
  const mode = SHIPPING_MODES.has(String(raw?.mode || "").toLowerCase())
    ? String(raw.mode).toLowerCase()
    : DEFAULT_SHIPPING_CONFIG.mode;

  return {
    mode,
    flatUsd: Math.max(0, toNumber(raw?.flatUsd, DEFAULT_SHIPPING_CONFIG.flatUsd)),
    percentRate: Math.max(0, toNumber(raw?.percentRate, DEFAULT_SHIPPING_CONFIG.percentRate)),
    minUsd: Math.max(0, toNumber(raw?.minUsd, DEFAULT_SHIPPING_CONFIG.minUsd)),
  };
}

export function normalizeProduct(raw) {
  const id = String(raw?.id || "").trim();
  const images = normalizeProductImages(raw);
  const networkLock = normalizeNetworkLock(raw?.networkLock ?? raw?.network_lock);
  const networkCarrier =
    networkLock === "Locked" ? String(raw?.networkCarrier ?? raw?.network_carrier ?? "").trim() : "";

  return {
    id,
    name: String(raw?.name || "").trim() || "Untitled Gadget",
    brand: String(raw?.brand || "").trim() || "Sirdavidgadget",
    condition: String(raw?.condition || "").trim() || "Used - Good",
    category: String(raw?.category || "").trim() || "Accessories",
    storageGb: toNullableInteger(raw?.storageGb ?? raw?.storage_gb, { min: 1, max: 8192 }),
    batteryHealth: toNullableInteger(raw?.batteryHealth ?? raw?.battery_health, { min: 0, max: 100 }),
    networkLock,
    networkCarrier,
    basePriceUsd: Math.max(0, toNumber(raw?.basePriceUsd, 0)),
    stock: Math.max(0, toInteger(raw?.stock, 0)),
    image: images[0] || "",
    images,
    details: String(raw?.details || "").trim(),
    isActive: normalizeBoolean(raw?.isActive, true),
    sortOrder: Math.max(0, toInteger(raw?.sortOrder, 0)),
  };
}
