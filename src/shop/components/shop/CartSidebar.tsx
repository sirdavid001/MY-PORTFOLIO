import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Minus, Trash2, ShoppingBag, Truck, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  loadCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  Cart,
  getCartTotal,
  calculateShipping,
} from '../../lib/cart';
import { PricingContext, convertPrice, formatCurrency } from '../../lib/pricing';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartSidebarProps {
  pricingContext: PricingContext | null;
  shippingSettings: any;
  onCartUpdate: () => void;
  onClose: () => void;
}

export default function CartSidebar({ pricingContext, shippingSettings, onCartUpdate, onClose }: CartSidebarProps) {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: '' });

  useEffect(() => {
    setCart(loadCart());
  }, []);

  function refresh() {
    setCart(loadCart());
  }

  function handleQty(productId: string, qty: number) {
    updateCartItemQuantity(productId, qty);
    refresh();
    onCartUpdate();
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    refresh();
    onCartUpdate();
  }

  function handleClear() {
    if (confirm('Clear all items from your cart?')) {
      clearCart();
      refresh();
      onCartUpdate();
    }
  }

  function goToCart() {
    onClose();
    navigate('/cart');
  }

  const currency     = pricingContext?.currency || 'USD';
  const rates        = pricingContext?.exchangeRates || { USD: 1 };
  const subUSD       = getCartTotal(cart);
  const shipUSD      = shippingSettings ? calculateShipping(subUSD, shippingSettings) : 0;
  const totalUSD     = subUSD + shipUSD;
  const subtotal     = convertPrice(subUSD,   currency, rates);
  const shipping     = convertPrice(shipUSD,  currency, rates);
  const total        = convertPrice(totalUSD, currency, rates);
  const itemCount    = cart.items.reduce((s, i) => s + i.quantity, 0);

  const freeThreshold = shippingSettings?.freeThreshold || 0;
  const freeProgress  = freeThreshold > 0 ? Math.min((subUSD / freeThreshold) * 100, 100) : 0;
  const toFree        = freeThreshold > 0
    ? convertPrice(Math.max(0, freeThreshold - subUSD), currency, rates)
    : 0;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Your cart is empty</h3>
        <p className="text-gray-500 text-sm mb-6 leading-snug">Browse our gadgets and add items to get started</p>
        <Button onClick={onClose} className="w-full" size="lg">
          Continue Shopping
        </Button>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Free-shipping banner */}
      {freeThreshold > 0 && (
        <div className={`mx-3 mt-3 mb-1 rounded-xl px-4 py-2.5 flex-shrink-0 ${
          freeProgress >= 100 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-100'
        }`}>
          <div className="flex items-center gap-2 mb-1.5">
            {freeProgress >= 100 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-green-700">Free shipping unlocked! 🎉</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-blue-700">
                  Add <span className="font-bold">{formatCurrency(toFree, currency)}</span> more for free shipping
                </span>
              </>
            )}
          </div>
          {freeProgress < 100 && (
            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${freeProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Items list — scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-3 space-y-1">
        {cart.items.map((item, idx) => {
          const itemPrice = convertPrice(item.product.priceUSD, currency, rates);
          const itemTotal = itemPrice * item.quantity;

          return (
            <div key={item.product.id}>
              <div className="flex gap-3 py-3">
                {/* Image */}
                <button
                  onClick={() => { onClose(); navigate(`/product/${item.product.id}`); }}
                  className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 active:opacity-80 transition-opacity focus:outline-none"
                  aria-label={`View ${item.product.name}`}
                >
                  <ImageWithFallback
                    src={item.product.images?.[0] || undefined}
                    alt={item.product.name}
                    query={`${item.product.brand} ${item.product.name} gadget`}
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => { onClose(); navigate(`/product/${item.product.id}`); }}
                    className="text-sm font-semibold text-gray-900 line-clamp-2 text-left hover:text-blue-600 active:text-blue-700 transition-colors leading-snug w-full"
                  >
                    {item.product.name}
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{item.product.brand}</span>
                    {item.product.condition && (
                      <Badge variant="outline" className="text-xs py-0 px-1.5 h-4 leading-none">
                        {item.product.condition}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQty(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold bg-white border-x border-gray-300 h-8 flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQty(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 active:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="flex-shrink-0 text-right pl-1">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{formatCurrency(itemTotal, currency)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatCurrency(itemPrice, currency)} ea
                    </p>
                  )}
                </div>
              </div>
              {idx < cart.items.length - 1 && <Separator />}
            </div>
          );
        })}
      </div>

      {/* ── Footer (fixed at bottom of panel) ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 pt-3 pb-4 space-y-3">
        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal <span className="text-gray-400">({itemCount} item{itemCount !== 1 ? 's' : ''})</span></span>
            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Shipping</span>
            <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
              {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-2.5">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-extrabold text-lg text-blue-700">{formatCurrency(total, currency)}</span>
        </div>

        {/* CTA */}
        <Button onClick={goToCart} className="w-full h-12 text-sm font-semibold" size="lg">
          Checkout
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </Button>

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Secure
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">Paystack</span>
          <span className="text-gray-300">·</span>
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
