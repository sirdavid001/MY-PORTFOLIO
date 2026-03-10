import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  loadCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart, 
  Cart,
  getCartTotal,
  calculateShipping 
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
    loadCartData();
  }, []);

  function loadCartData() {
    const cartData = loadCart();
    setCart(cartData);
  }

  function handleQuantityChange(productId: string, newQuantity: number) {
    updateCartItemQuantity(productId, newQuantity);
    loadCartData();
    onCartUpdate();
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    loadCartData();
    onCartUpdate();
  }

  function handleClearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      loadCartData();
      onCartUpdate();
    }
  }

  function handleGoToCart() {
    onClose();
    navigate('/cart');
  }

  const subtotalUSD = getCartTotal(cart);
  const shippingUSD = shippingSettings ? calculateShipping(subtotalUSD, shippingSettings) : 0;
  const totalUSD = subtotalUSD + shippingUSD;

  const currency = pricingContext?.currency || 'USD';
  const exchangeRates = pricingContext?.exchangeRates || { USD: 1 };

  const subtotal = convertPrice(subtotalUSD, currency, exchangeRates);
  const shipping = convertPrice(shippingUSD, currency, exchangeRates);
  const total = convertPrice(totalUSD, currency, exchangeRates);

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-600 mb-6">Add some products to get started</p>
        <Button onClick={onClose}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {cart.items.map(item => {
          const itemPrice = convertPrice(item.product.priceUSD, currency, exchangeRates);
          const itemTotal = itemPrice * item.quantity;

          return (
            <div key={item.product.id} className="flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={item.product.images[0] || ''}
                  alt={item.product.name}
                  query={`${item.product.name} gadget`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">
                  {item.product.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {formatCurrency(itemPrice, currency)}
                </p>
                
                <div className="flex items-center gap-2">
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
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleRemove(item.product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatCurrency(itemTotal, currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? 'FREE' : formatCurrency(shipping, currency)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatCurrency(total, currency)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleGoToCart} className="w-full" size="lg">
            Go to Cart & Checkout
          </Button>
          <Button onClick={handleClearCart} variant="outline" className="w-full">
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
