export interface OrderCheckoutData {
  fullName?: string;
  email?: string;
  phone?: string;
  callNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface OrderRecord {
  id?: string;
  reference?: string;
  checkout?: OrderCheckoutData | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentMethod?: string;
  notes?: string;
  currency?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  status?: string;
  trackingNumber?: string;
  createdAt?: string;
  paymentVerifiedAt?: string;
  items?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  [key: string]: unknown;
}

function firstNonEmpty(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

export function normalizeOrderRecord<T extends OrderRecord>(order: T): T {
  const checkout = (order.checkout || {}) as OrderCheckoutData;

  return {
    ...order,
    checkout,
    customerName: firstNonEmpty(order.customerName, checkout.fullName),
    customerEmail: firstNonEmpty(order.customerEmail, checkout.email),
    customerPhone: firstNonEmpty(order.customerPhone, checkout.phone, checkout.callNumber),
    address: firstNonEmpty(order.address, checkout.address),
    city: firstNonEmpty(order.city, checkout.city),
    country: firstNonEmpty(order.country, checkout.country),
    paymentMethod: firstNonEmpty(order.paymentMethod, checkout.paymentMethod),
    notes: firstNonEmpty(order.notes, checkout.notes),
  };
}

export function normalizeOrderRecords<T extends OrderRecord>(orders: T[] = []): T[] {
  return orders.map((order) => normalizeOrderRecord(order));
}
