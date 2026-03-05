import {
  DEFAULT_PRODUCTS,
  DEFAULT_SHIPPING_CONFIG,
  NETWORK_CARRIER_OPTIONS,
  NETWORK_LOCK_OPTIONS,
  SHOP_CATEGORY_OPTIONS,
  STORAGE_GB_OPTIONS,
  normalizeProduct,
  normalizeShippingConfig,
} from "../../shared/shop-defaults.js";

export const products = DEFAULT_PRODUCTS.map((product) => normalizeProduct(product));
export const defaultShippingConfig = normalizeShippingConfig(DEFAULT_SHIPPING_CONFIG);
export const categoryOptions = [...SHOP_CATEGORY_OPTIONS];
export const storageGbOptions = [...STORAGE_GB_OPTIONS];
export const networkLockOptions = [...NETWORK_LOCK_OPTIONS];
export const networkCarrierOptions = [...NETWORK_CARRIER_OPTIONS];

export { normalizeProduct, normalizeShippingConfig };
