import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Minus, Trash2, ShoppingBag, ShieldCheck,
  Truck, ChevronRight, CreditCard, AlertCircle,
  MapPin, User, Phone, FileText, Tag, CheckCircle2,
  ChevronDown, ChevronUp, RefreshCw, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  clearCheckoutData,
  Cart,
  getCartTotal,
  calculateShipping,
  createEmptyCheckoutData,
  loadCheckoutData,
  saveCheckoutData,
  CheckoutData,
} from '../../lib/cart';
import {
  PricingContext,
  DEFAULT_EXCHANGE_RATES,
  createPricingContext,
  convertPrice,
  formatCurrency,
  fetchExchangeRates,
  savePricingContext,
  loadPricingContext,
  isPaystackSupported,
} from '../../lib/pricing';
import { api } from '../../lib/api';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import Header from './Header';
import Footer from './Footer';

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (config: any) => void;
      resumeTransaction: (config: any) => void;
      checkout: (config: any) => Promise<void>;
      paymentRequest: (config: any) => Promise<void>;
    };
  }
}

const DIAL_CODES = [
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ZA', dial: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India' },
  { code: 'AE', dial: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: 'TZ', dial: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'UG', dial: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: 'ET', dial: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: 'EG', dial: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: 'MA', dial: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France' },
  { code: 'IT', dial: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dial: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: 'BR', dial: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', dial: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', name: 'China' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: 'KR', dial: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'PK', dial: '+92',  flag: '🇵🇰', name: 'Pakistan' },
];

function getDefaultDial(countryCode: string | undefined): string {
  if (!countryCode) return '+234';
  const match = DIAL_CODES.find(d => d.code === countryCode);
  return match ? match.dial : '+234';
}

// ─── Reusable Section card ────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-blue-600 flex-shrink-0">{icon}</span>
        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h2>
      </div>
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: '' });
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(createEmptyCheckoutData());
  const [dialCode, setDialCode] = useState('+234');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackReady, setPaystackReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cartCount, setCartCount] = useState(0);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    initializePricing();
    loadCartData();
    loadCheckout();
    fetchPaystackKey();
    loadPaystackScript();
  }, []);

  useEffect(() => {
    const detectedCountryCode = pricingContext?.countryCode || pricingContext?.country;
    if (detectedCountryCode && !checkoutData.customerPhone) {
      setDialCode(getDefaultDial(detectedCountryCode));
    }
  }, [pricingContext?.countryCode, pricingContext?.country, checkoutData.customerPhone]);

  useEffect(() => {
    const detectedCountryName = pricingContext?.countryName || pricingContext?.country || '';
    if (!detectedCountryName) return;

    setCheckoutData((current) => {
      if (current.country.trim()) return current;

      const updated = { ...current, country: detectedCountryName };
      saveCheckoutData(updated);
      return updated;
    });
  }, [pricingContext?.countryName, pricingContext?.country]);

  function loadPaystackScript() {
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => setPaystackReady(true);
      document.body.appendChild(script);
    } else {
      setPaystackReady(true);
    }
  }

  async function initializePricing() {
    try {
      const cached = loadPricingContext();
      if (cached) { setPricingContext(cached); return; }
      const [locationData, exchangeRates] = await Promise.all([
        api.getLocation().catch(() => ({ countryCode: 'NG', countryName: 'Nigeria', currency: 'NGN' })),
        fetchExchangeRates(),
      ]);
      const ctx: PricingContext = createPricingContext(locationData, exchangeRates, {
        countryCode: 'NG',
        countryName: 'Nigeria',
        currency: 'NGN',
      });
      savePricingContext(ctx);
      setPricingContext(ctx);
    } catch (err) {
      console.error('Pricing init error:', err);
      setPricingContext(
        createPricingContext(undefined, DEFAULT_EXCHANGE_RATES, {
          countryCode: 'NG',
          countryName: 'Nigeria',
          currency: 'NGN',
        })
      );
    }
  }

  async function loadCartData() {
    const cartData = loadCart();
    setCart(cartData);
    setCartCount(cartData.items.reduce((s, i) => s + i.quantity, 0));
    try {
      const config = await api.getShopConfig();
      setShippingSettings(config.shipping);
    } catch (err) {
      console.error('Failed to load shipping settings:', err);
    }
  }

  function loadCheckout() {
    const data = loadCheckoutData();
    setCheckoutData(data);
    if (data.customerPhone) {
      const match = DIAL_CODES.find(d => data.customerPhone.startsWith(d.dial));
      if (match) {
        setDialCode(match.dial);
        setPhoneLocal(data.customerPhone.slice(match.dial.length).trim());
      } else {
        setPhoneLocal(data.customerPhone);
      }
    }
  }

  async function fetchPaystackKey() {
    try {
      const result = await api.getPaystackPublicKey();
      setPaystackPublicKey(result.publicKey);
    } catch (err) {
      console.error('Failed to fetch Paystack key:', err);
    }
  }

  function refreshCart() {
    const updated = loadCart();
    setCart(updated);
    setCartCount(updated.items.reduce((s, i) => s + i.quantity, 0));
  }

  function handleQuantityChange(productId: string, qty: number) {
    updateCartItemQuantity(productId, qty);
    refreshCart();
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    refreshCart();
    toast.success('Item removed from cart');
  }

  function handleInputChange(field: keyof CheckoutData, value: string) {
    const updated = { ...checkoutData, [field]: value };
    setCheckoutData(updated);
    saveCheckoutData(updated);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function handlePhoneChange(local: string) {
    setPhoneLocal(local);
    handleInputChange('customerPhone', local ? `${dialCode}${local}` : '');
  }

  function handleDialChange(dial: string) {
    setDialCode(dial);
    handleInputChange('customerPhone', phoneLocal ? `${dial}${phoneLocal}` : '');
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!checkoutData.customerName.trim())   e.customerName  = 'Full name is required';
    if (!checkoutData.customerEmail.trim())  e.customerEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.customerEmail))
      e.customerEmail = 'Enter a valid email address';
    if (!checkoutData.customerPhone.trim())  e.customerPhone = 'Phone number is required';
    else if (checkoutData.customerPhone.replace(/\D/g, '').length < 7)
      e.customerPhone = 'Enter a valid phone number';
    if (!checkoutData.address.trim()) e.address = 'Delivery address is required';
    if (!checkoutData.city.trim())    e.city    = 'City is required';
    if (!checkoutData.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function buildOrderPayload(reference: string) {
    return {
      reference,
      currency,
      subtotal,
      shipping,
      total,
      items: cart.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: convertPrice(item.product.priceUSD, currency, rates),
      })),
      checkout: {
        fullName: checkoutData.customerName.trim(),
        email: checkoutData.customerEmail.trim(),
        phone: checkoutData.customerPhone.trim(),
        callNumber: checkoutData.customerPhone.trim(),
        address: checkoutData.address.trim(),
        city: checkoutData.city.trim(),
        country: checkoutCountry,
        paymentMethod: 'Paystack',
        notes: checkoutData.notes.trim(),
      },
    };
  }

  async function handleCheckout() {
    if (cart.items.length === 0) { toast.error('Your cart is empty'); return; }
    if (!validate()) {
      toast.error('Please fill in all required fields');
      setTimeout(() => {
        const el = document.querySelector('[data-field-error="true"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    if (!isPaystackSupported(currency)) {
      toast.error(`Paystack does not support ${currency}. Contact support.`); return;
    }
    if (!paystackPublicKey) { toast.error('Payment system not configured'); return; }
    if (!paystackReady || !window.PaystackPop) {
      toast.error('Payment is still loading. Try again shortly.'); return;
    }

    setLoading(true);
    try {
      const ref   = `ORD-${Date.now()}`;
      const orderPayload = buildOrderPayload(ref);
      const expectedAmountKobo = Math.round(orderPayload.total * 100);

      // Use Paystack Inline v2 checkout() method — this auto-detects Apple
      // devices / Safari and shows a pre-checkout modal with Apple Pay button
      // + "More payment options" for other channels. On non-Apple devices it
      // opens the standard Paystack checkout with all available methods.
      const handler = new window.PaystackPop!();
      await handler.checkout({
        key:      paystackPublicKey,
        email:    checkoutData.customerEmail,
        amount:   expectedAmountKobo,
        currency,
        ref,
        metadata: {
          order_reference: ref,
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: checkoutData.customerName },
            { display_name: 'Phone',         variable_name: 'phone',         value: checkoutData.customerPhone },
            { display_name: 'Items',         variable_name: 'items',         value: String(cart.items.length) },
          ],
        },
        onSuccess: async (tx: any) => {
          const paymentReference = tx.reference || ref;
          let paymentVerified = false;

          try {
            const verification = await api.verifyPayment(paymentReference, {
              expectedAmountKobo,
              expectedCurrency: currency,
              expectedEmail: orderPayload.checkout.email,
            });

            paymentVerified = Boolean(verification?.paid || verification?.data?.status === 'success');
            if (!paymentVerified) {
              throw new Error(verification?.error || 'Payment could not be verified.');
            }

            await api.submitOrder(orderPayload);
            clearCart();
            refreshCart();

            const emptyCheckout = clearCheckoutData();
            setCheckoutData(emptyCheckout);
            setPhoneLocal('');
            setDialCode(getDefaultDial(pricingContext?.countryCode || pricingContext?.country));

            toast.success('Payment successful! Order confirmed.');
            navigate('/shop?payment=success&reference=' + ref);
          } catch (err) {
            console.error('Checkout finalization error:', err);
            if (paymentVerified) {
              clearCart();
              refreshCart();
              toast.error(`Payment succeeded, but order confirmation needs manual review. Ref: ${ref}`);
            } else {
              toast.error('Payment received but verification failed. Ref: ' + paymentReference);
            }
          } finally { setLoading(false); }
        },
        onCancel: () => {
          setLoading(false);
          toast.info('Payment cancelled. Your order is saved — retry anytime.');
        },
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  }

  // ── Derived pricing ───────────────────────────────────────────────────────
  const currency      = pricingContext?.currency || 'USD';
  const rates         = pricingContext?.exchangeRates || { USD: 1 };
  const subUSD        = getCartTotal(cart);
  const shipUSD       = shippingSettings ? calculateShipping(subUSD, shippingSettings) : 0;
  const totalUSD      = subUSD + shipUSD;
  const subtotal      = convertPrice(subUSD,   currency, rates);
  const shipping      = convertPrice(shipUSD,  currency, rates);
  const total         = convertPrice(totalUSD, currency, rates);
  const itemCount     = cart.items.reduce((s, i) => s + i.quantity, 0);
  const checkoutCountry = checkoutData.country.trim()
    || pricingContext?.countryName
    || pricingContext?.country
    || pricingContext?.countryCode
    || '';
  const deliveryDestination = [
    checkoutData.address.trim(),
    checkoutData.city.trim(),
    checkoutCountry,
  ].filter(Boolean).join(', ');

  const freeThreshold = shippingSettings?.freeThreshold || 0;
  const freeProgress  = freeThreshold > 0 ? Math.min((subUSD / freeThreshold) * 100, 100) : 0;
  const toFreeShip    = freeThreshold > 0
    ? Math.max(0, convertPrice(freeThreshold - subUSD, currency, rates))
    : 0;

  const canCheckout = cart.items.length > 0 && isPaystackSupported(currency) && paystackReady;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header cartCount={0} pricingContext={pricingContext} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 sm:p-12 max-w-sm w-full text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Browse our gadgets and find something you love!</p>
            <Button size="lg" onClick={() => navigate('/shop')} className="w-full">
              Start Shopping
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        cartCount={cartCount}
        pricingContext={pricingContext}
        onCurrencyChange={(c) => {
          if (!pricingContext) return;
          const updated = { ...pricingContext, currency: c };
          setPricingContext(updated);
          savePricingContext(updated);
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <button onClick={() => navigate('/shop')} className="hover:text-blue-600 transition-colors">Shop</button>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-gray-900 font-medium">Cart &amp; Checkout</span>
          </nav>
        </div>
      </div>

      {/* ── MOBILE: collapsible order summary strip ── */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <button
          className="w-full px-4 py-3 flex items-center justify-between"
          onClick={() => setSummaryExpanded(v => !v)}
        >
          <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
            <ShoppingBag className="w-4 h-4" />
            Show order summary
            <span className="text-gray-500 font-normal">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{formatCurrency(total, currency)}</span>
            {summaryExpanded
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {summaryExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-3">
            {/* Items list */}
            <div className="pt-3 space-y-2">
              {cart.items.map(item => {
                const p = convertPrice(item.product.priceUSD, currency, rates) * item.quantity;
                return (
                  <div key={item.product.id} className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.images?.[0] || undefined}
                        alt={item.product.name}
                        query={`${item.product.brand} gadget`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatCurrency(p, currency)}</span>
                  </div>
                );
              })}
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-700">{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 w-full pb-28 lg:pb-8">
        {/* Page title */}
        <div className="mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Cart &amp; Checkout</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 sm:gap-8 items-start">

          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">

            {/* Free shipping progress */}
            {freeThreshold > 0 && (
              <div className={`rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 ${
                freeProgress >= 100
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <Truck className={`w-5 h-5 flex-shrink-0 ${freeProgress >= 100 ? 'text-green-600' : 'text-blue-600'}`} />
                <div className="flex-1 min-w-0">
                  {freeProgress >= 100 ? (
                    <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      You've unlocked FREE shipping!
                    </p>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm text-blue-700">
                        Add <span className="font-bold">{formatCurrency(toFreeShip, currency)}</span> more for free shipping
                      </p>
                      <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${freeProgress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Cart items ── */}
            <Section icon={<ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />} title={`Your Items (${cart.items.length})`}>
              <div className="space-y-4 sm:space-y-5">
                {cart.items.map((item, idx) => {
                  const itemPrice = convertPrice(item.product.priceUSD, currency, rates);
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <div key={item.product.id}>
                      <div className="flex gap-3 sm:gap-4">
                        {/* Thumbnail */}
                        <button
                          onClick={() => navigate(`/product/${item.product.id}`)}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 focus:outline-none"
                          aria-label={`View ${item.product.name}`}
                        >
                          <ImageWithFallback
                            src={item.product.images?.[0] || undefined}
                            alt={item.product.name}
                            query={`${item.product.name} ${item.product.brand} gadget`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </button>

                        {/* Info + controls */}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => navigate(`/product/${item.product.id}`)}
                            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left text-sm sm:text-base line-clamp-2 leading-snug"
                          >
                            {item.product.name}
                          </button>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-xs text-gray-400">{item.product.brand}</span>
                            {item.product.condition && (
                              <Badge variant="outline" className="text-xs py-0 px-1.5 h-4 leading-none">
                                {item.product.condition}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatCurrency(itemPrice, currency)} each
                          </p>

                          {/* Qty + Remove */}
                          <div className="flex items-center gap-2 mt-2.5">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold border-x border-gray-300 h-8 flex items-center justify-center bg-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemove(item.product.id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors py-1 px-2 rounded-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="text-right flex-shrink-0 pl-1">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(itemTotal, currency)}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
                          )}
                        </div>
                      </div>
                      {idx < cart.items.length - 1 && <Separator className="mt-4 sm:mt-5" />}
                    </div>
                  );
                })}
              </div>

              {/* Footer actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <button
                  onClick={() => navigate('/shop')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  ← Continue shopping
                </button>
                <button
                  onClick={() => {
                    if (confirm('Clear all items from cart?')) {
                      clearCart(); refreshCart();
                    }
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Clear cart
                </button>
              </div>
            </Section>

            {/* ── Contact details ── */}
            <Section icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />} title="Contact Details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required error={errors.customerName}>
                    <Input
                      data-field-error={!!errors.customerName || undefined}
                      value={checkoutData.customerName}
                      onChange={e => handleInputChange('customerName', e.target.value)}
                      placeholder="e.g. Chukwuemeka Obi"
                      autoComplete="name"
                      className={errors.customerName ? 'border-red-400 focus-visible:ring-red-300' : ''}
                    />
                  </Field>
                  <Field label="Email Address" required error={errors.customerEmail}>
                    <Input
                      data-field-error={!!errors.customerEmail || undefined}
                      type="email"
                      value={checkoutData.customerEmail}
                      onChange={e => handleInputChange('customerEmail', e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={errors.customerEmail ? 'border-red-400 focus-visible:ring-red-300' : ''}
                    />
                  </Field>
                </div>

                {/* Phone with country dial */}
                  <Field label="Phone Number" required error={errors.customerPhone}>
                  <div className="flex">
                    <div className="relative flex-shrink-0">
                      <select
                        value={dialCode}
                        onChange={e => handleDialChange(e.target.value)}
                        className="h-10 appearance-none pl-2.5 pr-7 rounded-l-md border border-r-0 border-input bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 cursor-pointer"
                        style={{ minWidth: '80px', maxWidth: '100px' }}
                      >
                        {DIAL_CODES.map(c => (
                          <option key={`${c.code}-${c.dial}`} value={c.dial}>
                            {c.flag} {c.dial}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                    </div>
                    <Input
                      data-field-error={!!errors.customerPhone || undefined}
                      type="tel"
                      value={phoneLocal}
                      onChange={e => handlePhoneChange(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                      placeholder="8012345678"
                      autoComplete="tel"
                      className={`rounded-l-none border-l-0 flex-1 min-w-0 ${errors.customerPhone ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                    />
                  </div>
                  {dialCode && phoneLocal && (
                    <p className="text-xs text-gray-400 mt-1">
                      Full: <span className="font-medium text-gray-600">{dialCode}{phoneLocal}</span>
                    </p>
                  )}
                </Field>
              </div>
            </Section>

            {/* ── Delivery address ── */}
            <Section icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />} title="Delivery Address">
              <div className="space-y-4">
                <Field label="Street Address" required error={errors.address}>
                  <Input
                    data-field-error={!!errors.address || undefined}
                    value={checkoutData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                    autoComplete="street-address"
                    className={errors.address ? 'border-red-400 focus-visible:ring-red-300' : ''}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City / Town" required error={errors.city}>
                    <Input
                      data-field-error={!!errors.city || undefined}
                      value={checkoutData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder="e.g. Lagos"
                      autoComplete="address-level2"
                      className={errors.city ? 'border-red-400 focus-visible:ring-red-300' : ''}
                    />
                  </Field>
                  <Field label="Country" required error={errors.country}>
                    <Input
                      data-field-error={!!errors.country || undefined}
                      value={checkoutData.country || pricingContext?.countryName || pricingContext?.country || ''}
                      onChange={e => handleInputChange('country', e.target.value)}
                      placeholder="e.g. Nigeria"
                      autoComplete="country-name"
                      className={errors.country ? 'border-red-400 focus-visible:ring-red-300' : ''}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ── Order notes ── */}
            <Section icon={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />} title="Order Notes (Optional)">
              <Textarea
                value={checkoutData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Special instructions, preferred delivery time, gate code…"
                rows={3}
                className="resize-none text-sm"
              />
            </Section>
          </div>

          {/* ════ RIGHT COLUMN — desktop summary ════ */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-20 space-y-4">

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-800">Order Summary</h2>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {/* Itemised */}
                  <div className="space-y-2.5">
                    {cart.items.map(item => {
                      const p = convertPrice(item.product.priceUSD, currency, rates) * item.quantity;
                      return (
                        <div key={item.product.id} className="flex justify-between items-start gap-2 text-sm">
                          <span className="text-gray-700 line-clamp-2 flex-1">
                            {item.product.name}
                            {item.quantity > 1 && <span className="text-gray-400 ml-1">×{item.quantity}</span>}
                          </span>
                          <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(p, currency)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                        {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
                      </span>
                    </div>
                    {deliveryDestination && (
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium text-right text-gray-700">{deliveryDestination}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-xl text-blue-700">{formatCurrency(total, currency)}</span>
                  </div>

                  {currency !== 'USD' && (
                    <p className="text-xs text-gray-400 text-center">≈ ${totalUSD.toFixed(2)} USD</p>
                  )}

                  {/* Warnings */}
                  {!isPaystackSupported(currency) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-sm text-amber-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Payment in <b>{currency}</b> is not supported. Switch currency.</span>
                    </div>
                  )}
                  {!paystackPublicKey && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Payment system not configured. Contact support.</span>
                    </div>
                  )}

                  {/* Pay button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={!canCheckout || loading}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing…
                      </span>
                    ) : !paystackReady ? 'Loading payment…' : (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pay {formatCurrency(total, currency)}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secure Checkout</p>
                <div className="space-y-2.5">
                  {[
                    { icon: <ShieldCheck className="w-4 h-4 text-green-600" />, text: 'SSL encrypted & secure payment' },
                    { icon: <CreditCard className="w-4 h-4 text-blue-600" />, text: 'Card, Bank, USSD, Mobile Money' },
                    { icon: <Truck className="w-4 h-4 text-purple-600" />, text: 'Fast nationwide delivery' },
                    { icon: <Phone className="w-4 h-4 text-orange-500" />, text: 'Apple Pay & Google Pay supported' },
                  ].map(b => (
                    <div key={b.text} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 mt-0.5">{b.icon}</span>
                      <span className="text-xs text-gray-600">{b.text}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">
                    Powered by <span className="font-semibold text-gray-600">Paystack</span>
                  </p>
                </div>
              </div>

              {/* Need help */}
              <div className="bg-blue-50 rounded-2xl border border-blue-100 px-5 py-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Need help?</p>
                <p className="text-xs text-blue-600">
                  Check our{' '}
                  <button onClick={() => navigate('/faqs')} className="underline hover:text-blue-800">FAQs</button>
                  {' '}or{' '}
                  <button onClick={() => navigate('/track-order')} className="underline hover:text-blue-800">track your order</button>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ════ MOBILE sticky bottom bar ════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
        {/* Warnings */}
        {(!isPaystackSupported(currency) || !paystackPublicKey) && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {!isPaystackSupported(currency)
              ? `${currency} not supported — switch currency`
              : 'Payment system not configured'}
          </div>
        )}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 leading-none mb-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
            <p className="font-bold text-gray-900 text-lg leading-tight">{formatCurrency(total, currency)}</p>
            {shipping === 0 && (
              <p className="text-xs text-green-600 leading-none mt-0.5">Free shipping</p>
            )}
          </div>
          <Button
            onClick={handleCheckout}
            disabled={!canCheckout || loading}
            size="lg"
            className="flex-shrink-0 h-12 px-6 text-sm font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing…
              </span>
            ) : !paystackReady ? 'Loading…' : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Pay Now
              </span>
            )}
          </Button>
        </div>
        {/* Safe area spacer for phones with home indicator */}
        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>

      <Footer />
    </div>
  );
}
