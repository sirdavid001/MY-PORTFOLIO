import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bda4aae5`;

interface VerifyPaymentOptions {
  expectedAmountKobo?: number;
  expectedCurrency?: string;
  expectedEmail?: string;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  useAuth: boolean = false
) {
  // Always use the publicAnonKey in Authorization so Supabase's edge-function
  // gateway is always satisfied — it validates this header as a JWT and will
  // reject an expired admin token before it even reaches our Hono app.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...(options.headers as Record<string, string>),
  };

  if (useAuth) {
    // Send the admin session token in a separate header so the gateway never
    // sees it (no expiry issues). The backend reads X-Admin-Token first.
    const token = localStorage.getItem('adminToken');
    if (token) {
      headers['X-Admin-Token'] = token;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(errorBody.error || errorBody.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Location
  getLocation: () => apiRequest('/api/location'),

  // Shop
  getShopConfig: () => apiRequest('/api/shop/config'),
  submitOrder: (orderData: any) => apiRequest('/api/send-order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  trackOrder: (ref: string) => apiRequest(`/api/track-order/${ref}`),

  // Paystack
  getPaystackPublicKey: () => apiRequest('/api/payments/paystack/public-key'),
  initializePayment: (paymentData: any) => apiRequest('/api/payments/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  verifyPayment: (reference: string, options: VerifyPaymentOptions = {}) => {
    const params = new URLSearchParams({ reference });

    if (Number.isFinite(options.expectedAmountKobo)) {
      params.set('expected_amount_kobo', String(options.expectedAmountKobo));
    }
    if (options.expectedCurrency) {
      params.set('expected_currency', options.expectedCurrency);
    }
    if (options.expectedEmail) {
      params.set('expected_email', options.expectedEmail);
    }

    return apiRequest(`/api/payments/paystack/verify?${params.toString()}`);
  },

  // Admin Auth
  adminSignup: (name: string, email: string, password: string) => apiRequest('/api/admin/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
  adminLogin: (email: string, password: string) => apiRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  adminLogout: () => apiRequest('/api/admin/logout', { method: 'POST' }, true),
  adminSession: () => apiRequest('/api/admin/session', {}, true),

  // Admin Orders
  getAdminOrders: () => apiRequest('/api/admin/orders', {}, true),
  updateOrder: (id: string, updates: any) => apiRequest(`/api/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, true),

  // Admin Products
  getAdminProducts: () => apiRequest('/api/admin/products', {}, true),
  createProduct: (product: any) => apiRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }, true),
  updateProduct: (id: string, updates: any) => apiRequest(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, true),
  deleteProduct: (id: string) => apiRequest(`/api/admin/products/${id}`, {
    method: 'DELETE',
  }, true),

  // Admin Shipping
  getShippingSettings: () => apiRequest('/api/admin/shipping', {}, true),
  updateShippingSettings: (settings: any) => apiRequest('/api/admin/shipping', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }, true),

  // Exchange Rate
  getExchangeRate: () => apiRequest('/api/settings/exchange-rate'),
  updateExchangeRate: (ngnPerUsd: number) => apiRequest('/api/admin/settings/exchange-rate', {
    method: 'PUT',
    body: JSON.stringify({ ngnPerUsd }),
  }, true),

  // Image Upload — also uses anon key in Authorization + X-Admin-Token
  uploadImage: async (file: File) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/admin/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        ...(token ? { 'X-Admin-Token': token } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorBody.error || 'Upload failed');
    }

    return response.json();
  },
};
