import { ShoppingCart, Package, Search, Menu, X, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import CurrencySelector from './CurrencySelector';
import { PricingContext } from '../../lib/pricing';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pricingContext?: PricingContext | null;
  onCurrencyChange?: (currency: string) => void;
}

export default function Header({
  cartCount = 0,
  onCartClick,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  pricingContext,
  onCurrencyChange,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/shop', label: 'Shop' },
    { path: '/track-order', label: 'Track Order' },
    { path: '/shipping-policy', label: 'Shipping' },
    { path: '/terms-and-conditions', label: 'Support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/shop')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-gray-900">SirDavid</span>
              <span className="text-xs text-gray-500">Gadgets</span>
            </div>
          </div>

          {/* Desktop Search */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={isActive(item.path) ? '' : 'text-gray-600 hover:text-gray-900'}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Section: Currency, Cart, Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Currency Selector - Desktop */}
            {pricingContext && onCurrencyChange && (
              <div className="hidden lg:block">
                <CurrencySelector
                  pricingContext={pricingContext}
                  onCurrencyChange={onCurrencyChange}
                />
              </div>
            )}

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative h-10 w-10 p-0 md:h-9 md:w-auto md:px-4"
            >
              <ShoppingCart className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1 text-xs md:relative md:right-0 md:top-0 md:ml-1">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-10 w-10 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4 space-y-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  className={`justify-start ${isActive(item.path) ? '' : 'text-gray-600'}`}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
            
            {/* Currency Selector - Mobile */}
            {pricingContext && onCurrencyChange && (
              <div className="px-2">
                <CurrencySelector
                  pricingContext={pricingContext}
                  onCurrencyChange={onCurrencyChange}
                  className="w-full justify-start"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}