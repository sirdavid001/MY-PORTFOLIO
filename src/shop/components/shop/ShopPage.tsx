import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Filter, Loader2, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import Header from './Header';
import Footer from './Footer';
import { Product } from '../../lib/cart';
import { addToCart, loadCart, getCartItemCount } from '../../lib/cart';
import { api } from '../../lib/api';
import { 
  PricingContext, 
  createPricingContext,
  DEFAULT_EXCHANGE_RATES,
  fetchExchangeRates, 
  savePricingContext, 
  loadPricingContext,
} from '../../lib/pricing';
import { Globe } from 'lucide-react';

export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [cartCount, setCartCount] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);
  const [shippingSettings, setShippingSettings] = useState<any>(null);

  useEffect(() => {
    initializePricing();
    loadProducts();
    updateCartCount();
    
    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      const reference = searchParams.get('reference');
      if (reference) {
        handlePaymentSuccess(reference);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, conditionFilter, sortBy]);

  async function initializePricing() {
    try {
      // Try to load from cache
      const cached = loadPricingContext();
      if (cached) {
        setPricingContext(cached);
        return;
      }

      // Fetch location and exchange rates
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
      // Fallback context
      const fallback: PricingContext = createPricingContext(undefined, DEFAULT_EXCHANGE_RATES, {
        countryCode: 'US',
        countryName: 'United States',
        currency: 'USD',
      });
      setPricingContext(fallback);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await api.getShopConfig();
      setProducts(data.products || []);
      setShippingSettings(data.shipping);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Don't show error toast on initial load - products might not exist yet
      setProducts([]);
      setShippingSettings({
        mode: 'flat',
        flatAmount: 10,
        percentAmount: 0,
        freeThreshold: 0
      });
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortProducts() {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.details.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(p => p.condition === conditionFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceUSD - b.priceUSD;
        case 'price-high':
          return b.priceUSD - a.priceUSD;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProducts(filtered);
  }

  function handleAddToCart(product: Product) {
    addToCart(product, 1);
    updateCartCount();
    toast.success(`${product.name} added to cart`);
  }

  function updateCartCount() {
    const cart = loadCart();
    setCartCount(getCartItemCount(cart));
  }

  async function handlePaymentSuccess(reference: string) {
    try {
      const result = await api.verifyPayment(reference);
      if (result?.paid || result?.data?.status === 'success') {
        toast.success('Payment successful! Your order has been confirmed.');
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  }

  function handleCurrencyChange(newCurrency: string) {
    if (!pricingContext) return;
    
    const updatedContext: PricingContext = {
      ...pricingContext,
      currency: newCurrency,
    };
    
    setPricingContext(updatedContext);
    savePricingContext(updatedContext);
    toast.success(`Currency changed to ${newCurrency}`);
  }

  const categories = Array.from(new Set(products.map(p => p.category)));
  const conditions = Array.from(new Set(products.map(p => p.condition)));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header 
        cartCount={cartCount}
        onCartClick={() => setShowCartSidebar(true)}
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pricingContext={pricingContext}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location & Currency Info Banner */}
        {pricingContext && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  Shopping from <span className="font-semibold">{pricingContext.countryName || pricingContext.country}</span>
                  {' • '}
                  Prices shown in <span className="font-semibold">{pricingContext.currency}</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">
                You can change currency in the header
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {conditions.map(cond => (
                  <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              {pricingContext && (
                <span className="ml-2">• Showing prices in {pricingContext.currency}</span>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available yet</h3>
            <p className="text-gray-600">The store is being set up. Please check back soon!</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                pricingContext={pricingContext}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>

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

      {/* Footer */}
      <Footer />
    </div>
  );
}
