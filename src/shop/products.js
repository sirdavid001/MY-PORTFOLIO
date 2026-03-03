import {
  DEFAULT_PRODUCTS,
  DEFAULT_SHIPPING_CONFIG,
  normalizeProduct,
  normalizeShippingConfig,
} from "../../shared/shop-defaults.js";

export const products = DEFAULT_PRODUCTS.map((product) => normalizeProduct(product));
export const defaultShippingConfig = normalizeShippingConfig(DEFAULT_SHIPPING_CONFIG);

export { normalizeProduct, normalizeShippingConfig };
