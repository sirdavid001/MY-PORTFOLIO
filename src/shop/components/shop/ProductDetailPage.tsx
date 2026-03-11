import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ShoppingCart, Truck, Shield, RefreshCw,
  ChevronLeft, ChevronRight, Check, Share2, Heart,
  Battery, HardDrive, Wifi, Tag, Star, Zap,
  ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Product, addToCart, loadCart, getCartItemCount } from '../../lib/cart';
import { api } from '../../lib/api';
import {
  PricingContext,
  DEFAULT_EXCHANGE_RATES,
  createPricingContext,
  convertPrice,
  formatCurrency,
  fetchExchangeRates,
  savePricingContext,
  loadPricingContext,
} from '../../lib/pricing';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import Header from './Header';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<any>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    initializePricing();
    loadProduct();
    updateCartCount();
  }, [productId]);

  function updateCartCount() {
    const cart = loadCart();
    setCartCount(getCartItemCount(cart));
  }

  async function initializePricing() {
    try {
      const cached = loadPricingContext();
      if (cached) {
        setPricingContext(cached);
        return;
      }
      const [locationData, exchangeRates] = await Promise.all([
        api.getLocation().catch(() => ({ countryCode: 'US', countryName: 'United States', currency: 'USD' })),
        fetchExchangeRates(),
      ]);
      const context: PricingContext = createPricingContext(locationData, exchangeRates, {
        countryCode: 'US',
        countryName: 'United States',
        currency: 'USD',
      });
      savePricingContext(context);
      setPricingContext(context);
    } catch (error) {
      console.error('Pricing initialization error:', error);
      setPricingContext(
        createPricingContext(undefined, DEFAULT_EXCHANGE_RATES, {
          countryCode: 'US',
          countryName: 'United States',
          currency: 'USD',
        })
      );
    }
  }

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await api.getShopConfig();
      const products: Product[] = data.products || [];
      setAllProducts(products);
      setShippingSettings(data.shipping);
      const found = products.find((p) => p.id === productId);
      if (found) {
        setProduct(found);
      } else {
        toast.error('Product not found');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(flash = false) {
    if (!product) return;
    addToCart(product, quantity);
    updateCartCount();
    toast.success(`${quantity}× ${product.name} added to cart`);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    if (flash) setShowCartSidebar(true);
  }

  function handleCurrencyChange(newCurrency: string) {
    if (!pricingContext) return;
    const updated: PricingContext = { ...pricingContext, currency: newCurrency };
    setPricingContext(updated);
    savePricingContext(updated);
    toast.success(`Currency changed to ${newCurrency}`);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href }).catch(() => {});
    } else {
      // Fallback: use a temporary textarea + execCommand for broad compatibility
      try {
        const el = document.createElement('textarea');
        el.value = window.location.href;
        el.setAttribute('readonly', '');
        el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast.success('Link copied to clipboard');
      } catch {
        toast('Share this link: ' + window.location.href);
      }
    }
  }

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !product) return;
      const imgs = product.images?.filter(Boolean) || [];
      if (imgs.length === 0) return;
      if (e.key === 'ArrowRight') setSelectedImage((i) => (i + 1) % imgs.length);
      if (e.key === 'ArrowLeft') setSelectedImage((i) => (i - 1 + imgs.length) % imgs.length);
      if (e.key === 'Escape') setLightboxOpen(false);
    },
    [lightboxOpen, product]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          cartCount={0}
          onCartClick={() => {}}
          pricingContext={null}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image skeleton */}
            <div className="space-y-3">
              <div className="aspect-square bg-gray-200 animate-pulse rounded-2xl" />
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
            {/* Info skeleton */}
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
              <div className="h-10 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-24 bg-gray-200 animate-pulse rounded" />
              <div className="flex gap-3">
                <div className="h-12 bg-gray-200 animate-pulse rounded flex-1" />
                <div className="h-12 bg-gray-200 animate-pulse rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const currency = pricingContext?.currency || 'USD';
  const exchangeRates = pricingContext?.exchangeRates || { USD: 1 };
  const price = convertPrice(product.priceUSD, currency, exchangeRates);
  const images = product.images?.filter(Boolean) || [];

  // Related products: same category, not this product
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  // Condition color
  const conditionColor: Record<string, string> = {
    New: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Like New': 'bg-blue-100 text-blue-700 border-blue-200',
    Excellent: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    Good: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Fair: 'bg-orange-100 text-orange-700 border-orange-200',
    Refurbished: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const conditionClass = conditionColor[product.condition] || 'bg-gray-100 text-gray-700 border-gray-200';

  // Gadget-specific fields
  const gadgetFields: { icon: ReactNode; label: string; value: string }[] = [];
  if (product.model) gadgetFields.push({ icon: <Tag className="w-4 h-4" />, label: 'Model', value: String(product.model) });
  if (product.storageGb) gadgetFields.push({ icon: <HardDrive className="w-4 h-4" />, label: 'Storage', value: `${product.storageGb}` });
  if (product.batteryHealth) gadgetFields.push({ icon: <Battery className="w-4 h-4" />, label: 'Battery Health', value: `${product.batteryHealth}%` });
  if (product.networkLock) gadgetFields.push({ icon: <Wifi className="w-4 h-4" />, label: 'Network', value: product.networkLock });
  if (product.networkCarrier) gadgetFields.push({ icon: <Zap className="w-4 h-4" />, label: 'Carrier', value: product.networkCarrier });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Header */}
      <Header
        cartCount={cartCount}
        onCartClick={() => setShowCartSidebar(true)}
        pricingContext={pricingContext}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <button
              onClick={() => navigate('/shop')}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Shop
            </button>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <button
              onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category}
            </button>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main Image */}
            <div
              className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <ImageWithFallback
                src={images[selectedImage] || undefined}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i - 1 + images.length) % images.length);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage((i) => (i + 1) % images.length);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs rounded-full px-2.5 py-1">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600 shadow-md ring-1 ring-blue-600'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <ImageWithFallback
                      src={img || undefined}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <Truck className="w-5 h-5 text-blue-600" />, title: 'Fast Delivery', sub: 'Nationwide shipping' },
                { icon: <Shield className="w-5 h-5 text-green-600" />, title: 'Secure Pay', sub: 'SSL encrypted' },
                { icon: <RefreshCw className="w-5 h-5 text-purple-600" />, title: 'Easy Returns', sub: '7-day policy' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center text-center bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                >
                  {item.icon}
                  <p className="text-xs font-semibold text-gray-800 mt-1.5">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-5">
            {/* Brand + Badges */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium">
                  {product.brand}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  {product.category}
                </Badge>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${conditionClass}`}
              >
                {product.condition === 'New' && <Star className="w-3 h-3 fill-current" />}
                {product.condition}
              </span>
            </div>

            {/* Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.model && (
                <p className="text-sm text-gray-500 mt-1">Model: {product.model}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 bg-blue-50 rounded-xl px-4 py-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 tracking-tight">
                {formatCurrency(price, currency)}
              </span>
              {currency !== 'USD' && (
                <span className="text-sm text-gray-500">
                  ≈ ${product.priceUSD.toFixed(2)} USD
                </span>
              )}
            </div>

            {/* Gadget-specific quick facts */}
            {gadgetFields.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {gadgetFields.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm"
                  >
                    <span className="text-gray-400 flex-shrink-0">{field.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 leading-none">{field.label}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.specs.map((spec, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs text-gray-600 bg-gray-50"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Quantity + Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Qty:</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="px-5 py-2 text-center font-semibold min-w-[48px] border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 transition-all duration-200 ${
                    addedToCart ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                  onClick={() => handleAddToCart(false)}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white"
                  onClick={() => {
                    handleAddToCart(false);
                    navigate('/cart');
                  }}
                >
                  Buy Now
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className={`w-12 h-12 flex-shrink-0 ${wishlisted ? 'text-red-500 border-red-300 bg-red-50' : ''}`}
                  onClick={() => {
                    setWishlisted(!wishlisted);
                    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
                  }}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className="w-12 h-12 flex-shrink-0"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Tabs: Details + Specifications */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {product.details || 'No description available.'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-4">
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  {[
                    { label: 'Brand', value: product.brand },
                    { label: 'Model', value: product.model },
                    { label: 'Category', value: product.category },
                    { label: 'Condition', value: product.condition },
                    product.storageGb ? { label: 'Storage', value: `${product.storageGb}` } : null,
                    product.batteryHealth ? { label: 'Battery Health', value: `${product.batteryHealth}%` } : null,
                    product.networkLock ? { label: 'Network Lock', value: product.networkLock } : null,
                    product.networkCarrier ? { label: 'Carrier', value: product.networkCarrier } : null,
                  ]
                    .filter(Boolean)
                    .map((row, idx, arr) => (
                      <div
                        key={row!.label}
                        className={`flex justify-between items-center px-4 py-3 text-sm ${
                          idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <span className="font-medium text-gray-700 w-1/2">{row!.label}</span>
                        <span className="text-gray-600 text-right">{row!.value || '—'}</span>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
                <p className="text-sm text-gray-500 mt-0.5">More {product.category} you might like</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/shop')}
                className="hidden sm:flex"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  pricingContext={pricingContext}
                  onAddToCart={(prod) => {
                    addToCart(prod, 1);
                    updateCartCount();
                    toast.success(`${prod.name} added to cart`);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-light"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((i) => (i - 1 + images.length) % images.length);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((i) => (i + 1) % images.length);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div
            className="max-w-3xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={images[selectedImage] || undefined}
              alt={product.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            {images.length > 1 && (
              <p className="text-white/60 text-sm text-center mt-3">
                {selectedImage + 1} / {images.length} · Press ← → to navigate, Esc to close
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <Sheet open={showCartSidebar} onOpenChange={setShowCartSidebar}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription className="sr-only">
              Review your cart items and proceed to checkout.
            </SheetDescription>
          </SheetHeader>
          <CartSidebar
            pricingContext={pricingContext}
            shippingSettings={shippingSettings}
            onCartUpdate={updateCartCount}
            onClose={() => setShowCartSidebar(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
