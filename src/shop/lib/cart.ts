export interface Product {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  condition: string;
  priceUSD: number;
  details: string;
  images: string[];
  specs?: string[];
  isActive: boolean;
  // Extended gadget fields
  storageGb?: number | string;
  batteryHealth?: number | string;
  networkLock?: string;
  networkCarrier?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

export interface CheckoutData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}

export function createEmptyCheckoutData(): CheckoutData {
  return {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  };
}

export function loadCart(): Cart {
  try {
    const stored = localStorage.getItem('cart');
    if (!stored) return { items: [], updatedAt: new Date().toISOString() };
    return JSON.parse(stored);
  } catch {
    return { items: [], updatedAt: new Date().toISOString() };
  }
}

export function saveCart(cart: Cart) {
  cart.updatedAt = new Date().toISOString();
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product: Product, quantity: number = 1): Cart {
  const cart = loadCart();
  const existingIndex = cart.items.findIndex(item => item.product.id === product.id);
  
  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity = cart.items[existingIndex].quantity + quantity;
  } else {
    cart.items.push({
      product,
      quantity,
    });
  }
  
  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(productId: string, quantity: number): Cart {
  const cart = loadCart();
  const index = cart.items.findIndex(item => item.product.id === productId);
  
  if (index >= 0) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): Cart {
  const cart = loadCart();
  cart.items = cart.items.filter(item => item.product.id !== productId);
  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const cart = { items: [], updatedAt: new Date().toISOString() };
  saveCart(cart);
  return cart;
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + (item.quantity * item.product.priceUSD), 0);
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function loadCheckoutData(): CheckoutData {
  try {
    const stored = localStorage.getItem('checkoutData');
    if (!stored) return createEmptyCheckoutData();
    return {
      ...createEmptyCheckoutData(),
      ...JSON.parse(stored),
    };
  } catch {
    return createEmptyCheckoutData();
  }
}

export function saveCheckoutData(data: CheckoutData) {
  localStorage.setItem('checkoutData', JSON.stringify(data));
}

export function clearCheckoutData(): CheckoutData {
  const empty = createEmptyCheckoutData();
  saveCheckoutData(empty);
  return empty;
}

export function calculateShipping(
  subtotal: number,
  shippingSettings: { mode: string; flatAmount: number; percentAmount: number; freeThreshold: number }
): number {
  if (shippingSettings.freeThreshold > 0 && subtotal >= shippingSettings.freeThreshold) {
    return 0;
  }

  if (shippingSettings.mode === 'flat') {
    return shippingSettings.flatAmount;
  } else if (shippingSettings.mode === 'percent') {
    return (subtotal * shippingSettings.percentAmount) / 100;
  } else if (shippingSettings.mode === 'hybrid') {
    // Higher of the minimum flat fee OR the percentage-based fee
    const percentFee = (subtotal * shippingSettings.percentAmount) / 100;
    return Math.max(shippingSettings.flatAmount, percentFee);
  }

  return 0;
}
