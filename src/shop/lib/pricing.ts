export interface ExchangeRates {
  [currency: string]: number;
}

export interface PricingContext {
  country: string;
  countryCode?: string;
  countryName?: string;
  currency: string;
  exchangeRates: ExchangeRates;
  lastUpdated: string;
}

interface PricingLocationInput {
  country?: string;
  countryCode?: string;
  countryName?: string;
  currency?: string;
}

interface PricingFallback {
  countryCode: string;
  countryName: string;
  currency: string;
}

export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GHS', 'KES', 'ZAR', 'XOF'];

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  NGN: 1500,
  GHS: 15,
  KES: 130,
  ZAR: 18,
  XOF: 600,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  XOF: 'CFA',
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN',
  US: 'USD',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  BF: 'XOF', BJ: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF', NE: 'XOF', SN: 'XOF', TG: 'XOF',
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    return data.rates || {};
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return DEFAULT_EXCHANGE_RATES;
  }
}

export function createPricingContext(
  locationData: PricingLocationInput | null | undefined,
  exchangeRates: ExchangeRates,
  fallback: PricingFallback
): PricingContext {
  const rawCountry = String(locationData?.country || '').trim();
  const derivedCountryCode = /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : '';
  const countryCode = String(locationData?.countryCode || derivedCountryCode).trim().toUpperCase() || fallback.countryCode;
  const countryName = String(locationData?.countryName || locationData?.country || '').trim() || fallback.countryName;
  const currency = String(locationData?.currency || fallback.currency || 'USD').trim().toUpperCase() || fallback.currency;

  return {
    country: countryName || countryCode,
    countryCode,
    countryName: countryName || countryCode,
    currency,
    exchangeRates,
    lastUpdated: new Date().toISOString(),
  };
}

export function convertPrice(priceUSD: number, currency: string, exchangeRates: ExchangeRates): number {
  if (currency === 'USD') return priceUSD;
  const rate = exchangeRates[currency] || 1;
  return priceUSD * rate;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function savePricingContext(context: PricingContext) {
  localStorage.setItem('pricingContext', JSON.stringify(context));
}

export function loadPricingContext(): PricingContext | null {
  try {
    const stored = localStorage.getItem('pricingContext');
    if (!stored) return null;
    const context = JSON.parse(stored) as PricingContext;
    // Check if context is stale (older than 24 hours)
    const lastUpdated = new Date(context.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate > 24) return null;
    const rawCountry = String(context.country || '').trim();
    const derivedCountryCode = /^[A-Za-z]{2}$/.test(rawCountry) ? rawCountry.toUpperCase() : '';
    const countryCode = String(context.countryCode || derivedCountryCode).trim().toUpperCase();
    const countryName = String(context.countryName || context.country || countryCode).trim();
    return {
      ...context,
      country: countryName || countryCode,
      countryCode: countryCode || undefined,
      countryName: countryName || undefined,
      currency: String(context.currency || 'USD').trim().toUpperCase() || 'USD',
    };
  } catch {
    return null;
  }
}

export function getPaystackSupportedCurrencies(): string[] {
  // These would come from env vars in production
  return ['NGN', 'USD', 'GHS', 'KES', 'ZAR'];
}

export function isPaystackSupported(currency: string): boolean {
  return getPaystackSupportedCurrencies().includes(currency);
}
