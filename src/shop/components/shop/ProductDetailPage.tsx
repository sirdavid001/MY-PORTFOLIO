import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ShoppingCart, Package, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Product, addToCart } from '../../lib/cart';
import { api } from '../../lib/api';
import {
  PricingContext,
  convertPrice,
  formatCurrency,
  fetchExchangeRates,
  savePricingContext,
  loadPricingContext,
} from '../../lib/pricing';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pricingContext, setPricingContext] = useState<PricingContext | null>(null);

  useEffect(() => {
    initializePricing();
    loadProduct();
  }, [productId]);

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

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await api.getShopConfig();
      const foundProduct = data.products.find((p: Product) => p.id === productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
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

  function handleAddToCart() {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity}x ${product.name} added to cart`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currency = pricingContext?.currency || 'USD';
  const exchangeRates = pricingContext?.exchangeRates || { USD: 1 };
  const price = convertPrice(product.priceUSD, currency, exchangeRates);
  
  // Get all images (main image + additional images from imageUrls array)
  const allImages = [product.imageUrl, ...(product.imageUrls || [])];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sirdavid Gadgets</h1>
            </div>
            <Button onClick={() => navigate('/cart')} variant="outline">
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{product.brand}</p>
                </div>
                <Badge variant={product.condition === 'New' ? 'default' : 'secondary'}>
                  {product.condition}
                </Badge>
              </div>
              
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(price, currency)}
                </span>
                {product.compareAtPriceUSD && product.compareAtPriceUSD > product.priceUSD && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(convertPrice(product.compareAtPriceUSD, currency, exchangeRates), currency)}
                  </span>
                )}
              </div>

              {product.stock !== undefined && (
                <p className={`text-sm mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock !== undefined && quantity >= product.stock}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock !== undefined && product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    handleAddToCart();
                    navigate('/cart');
                  }}
                  disabled={product.stock !== undefined && product.stock === 0}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="flex flex-col items-center text-center p-4">
                  <Truck className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Fast Shipping</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-4">
                  <Shield className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Secure Payment</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center text-center p-4">
                  <RefreshCw className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Easy Returns</p>
                </CardContent>
              </Card>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{product.details}</p>
                </div>
              </TabsContent>
              <TabsContent value="specs" className="mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Brand:</span>
                    <span className="text-gray-600">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Category:</span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Condition:</span>
                    <span className="text-gray-600">{product.condition}</span>
                  </div>
                  {product.warranty && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Warranty:</span>
                      <span className="text-gray-600">{product.warranty}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
