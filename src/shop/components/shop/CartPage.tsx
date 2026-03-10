import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Package, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  Cart,
  getCartTotal,
  calculateShipping,
  loadCheckoutData,
  saveCheckoutData,
  CheckoutData,
} from '../../lib/cart';
import {
  PricingContext,
  convertPrice,
  formatCurrency,
  fetchExchangeRates,
  savePricingContext,
  loadPricingContext,
  isPaystackSupported,
} from '../../lib/pricing';
import { api } from '../../lib/api';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: '' });
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  });
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState('');

  useEffect(() => {
    initializePricing();
    loadCartData();
    loadCheckout();
    fetchPaystackKey();
  }, []);

  async function initializePricing() {
    try {
      const cached = loadPricingContext();
      if (cached) {
        setPricingContext(cached);
        return;
      }

      const [locationData, exchangeRates] = await Promise.all([
        api.getLocation().catch(() => ({ country: 'US', currency: 'USD' })),
        fetchExchangeRates(),
      ]);

      const context: PricingContext = {
        country: locationData.country,
        currency: locationData.currency,
        exchangeRates,
        lastUpdated: new Date().toISOString(),
      };

      savePricingContext(context);
      setPricingContext(context);
    } catch (error) {
      console.error('Pricing initialization error:', error);
    }
  }

  async function loadCartData() {
    const cartData = loadCart();
    setCart(cartData);

    // Load shipping settings
    try {
      const config = await api.getShopConfig();
      setShippingSettings(config.shipping);
    } catch (error) {
      console.error('Failed to load shipping settings:', error);
    }
  }

  function loadCheckout() {
    const data = loadCheckoutData();
    setCheckoutData(data);
  }

  async function fetchPaystackKey() {
    try {
      const result = await api.getPaystackPublicKey();
      setPaystackPublicKey(result.publicKey);
    } catch (error) {
      console.error('Failed to fetch Paystack key:', error);
    }
  }

  function handleQuantityChange(productId: string, newQuantity: number) {
    updateCartItemQuantity(productId, newQuantity);
    loadCartData();
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    loadCartData();
  }

  function handleInputChange(field: keyof CheckoutData, value: string) {
    const updated = { ...checkoutData, [field]: value };
    setCheckoutData(updated);
    saveCheckoutData(updated);
  }

  async function handleCheckout() {
    if (!checkoutData.customerName || !checkoutData.customerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const currency = pricingContext?.currency || 'USD';
    
    if (!isPaystackSupported(currency)) {
      toast.error(`Paystack does not support ${currency}. Please contact support.`);
      return;
    }

    if (!paystackPublicKey) {
      toast.error('Payment system not configured');
      return;
    }

    setLoading(true);

    try {
      const subtotalUSD = getCartTotal(cart);
      const shippingUSD = shippingSettings ? calculateShipping(subtotalUSD, shippingSettings) : 0;
      const totalUSD = subtotalUSD + shippingUSD;

      const exchangeRates = pricingContext?.exchangeRates || { USD: 1 };
      const subtotal = convertPrice(subtotalUSD, currency, exchangeRates);
      const shipping = convertPrice(shippingUSD, currency, exchangeRates);
      const total = convertPrice(totalUSD, currency, exchangeRates);

      const reference = `ORD-${Date.now()}`;

      // Submit order first
      await api.submitOrder({
        reference,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        address: checkoutData.address,
        city: checkoutData.city,
        country: pricingContext?.country || checkoutData.country,
        paymentMethod: 'paystack',
        currency,
        subtotal,
        shipping,
        total,
        notes: checkoutData.notes,
        items: cart.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: convertPrice(item.product.priceUSD, currency, exchangeRates),
        })),
      });

      // Then initialize payment
      const paymentResult = await api.initializePayment({
        email: checkoutData.customerEmail,
        amount: total,
        currency,
        reference,
        metadata: {
          customerName: checkoutData.customerName,
          items: cart.items.length,
        },
      });

      if (!paymentResult.status || !paymentResult.data?.authorization_url) {
        throw new Error('Payment initialization failed');
      }

      // Redirect to Paystack
      window.location.href = paymentResult.data.authorization_url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Checkout failed');
      setLoading(false);
    }
  }

  async function handlePaymentSuccess(reference: string) {
    try {
      // Verify payment
      const result = await api.verifyPayment(reference);
      
      if (result.status && result.data.status === 'success') {
        toast.success('Payment successful! Your order has been confirmed.');
        // Clear cart
        clearCart();
        // Redirect to shop
        setTimeout(() => navigate('/shop?payment=success&reference=' + reference), 2000);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    }
  }

  function handlePaymentClose() {
    setLoading(false);
  }

  const subtotalUSD = getCartTotal(cart);
  const shippingUSD = shippingSettings ? calculateShipping(subtotalUSD, shippingSettings) : 0;
  const totalUSD = subtotalUSD + shippingUSD;

  const currency = pricingContext?.currency || 'USD';
  const exchangeRates = pricingContext?.exchangeRates || { USD: 1 };

  const subtotal = convertPrice(subtotalUSD, currency, exchangeRates);
  const shipping = convertPrice(shippingUSD, currency, exchangeRates);
  const total = convertPrice(totalUSD, currency, exchangeRates);

  const canCheckout = cart.items.length > 0 && 
                       checkoutData.customerName && 
                       checkoutData.customerEmail &&
                       isPaystackSupported(currency);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sirdavid Gadgets</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Your cart is empty</p>
                ) : (
                  cart.items.map(item => {
                    const itemPrice = convertPrice(item.product.priceUSD, currency, exchangeRates);
                    const itemTotal = itemPrice * item.quantity;

                    return (
                      <div key={item.product.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                        <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.product.images[0] || ''}
                            alt={item.product.name}
                            query={`${item.product.name} gadget`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.product.brand}</p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemove(item.product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(itemTotal, currency)}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(itemPrice, currency)} each
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={checkoutData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={checkoutData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={checkoutData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={checkoutData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={checkoutData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={checkoutData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={checkoutData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">{formatCurrency(total, currency)}</span>
                  </div>
                </div>

                {!isPaystackSupported(currency) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    Payment in {currency} is not supported. Please contact support.
                  </div>
                )}

                {!paystackPublicKey && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                    Payment system not configured. Please contact support.
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={!canCheckout || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Secured by Paystack • Supports Apple Pay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}