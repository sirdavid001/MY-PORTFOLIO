import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Product } from '../../lib/cart';
import { PricingContext, convertPrice, formatCurrency } from '../../lib/pricing';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  pricingContext: PricingContext | null;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, pricingContext, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();
  const price = pricingContext
    ? convertPrice(product.priceUSD, pricingContext.currency, pricingContext.exchangeRates)
    : product.priceUSD;
  
  const currency = pricingContext?.currency || 'USD';
  const inStock = product.stock > 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div 
          className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <ImageWithFallback
            src={product.images[0] || ''}
            alt={product.name}
            query={`${product.name} ${product.brand} gadget`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="rounded-full">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.brand}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.condition}
            </Badge>
          </div>
          
          <h3 
            className="font-semibold text-lg line-clamp-2 min-h-[3.5rem] cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.details}
          </p>
          
          {product.specs && product.specs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.specs.slice(0, 3).map((spec, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(price, currency)}
          </p>
          <p className="text-xs text-gray-500">
            {inStock ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={!inStock}
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}