import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, PricingContext } from '../../lib/pricing';

interface CurrencySelectorProps {
  pricingContext: PricingContext | null;
  onCurrencyChange: (currency: string) => void;
  className?: string;
}

export default function CurrencySelector({ pricingContext, onCurrencyChange, className = '' }: CurrencySelectorProps) {
  if (!pricingContext) return null;

  const currentCurrency = pricingContext.currency;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={currentCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span className="font-semibold">{CURRENCY_SYMBOLS[currentCurrency]}</span>
              <span className="text-sm">{currentCurrency}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <SelectItem key={currency} value={currency}>
              <span className="flex items-center gap-2">
                <span className="font-semibold">{CURRENCY_SYMBOLS[currency]}</span>
                <span>{currency}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
