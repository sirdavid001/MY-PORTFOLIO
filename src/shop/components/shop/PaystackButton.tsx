import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaystackButtonProps {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  publicKey: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
  disabled?: boolean;
  className?: string;
}

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

export default function PaystackButton({
  email,
  amount,
  currency,
  reference,
  publicKey,
  onSuccess,
  onClose,
  metadata = {},
  disabled = false,
  className = '',
}: PaystackButtonProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Paystack inline script
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const handlePayment = () => {
    if (!scriptLoaded || !window.PaystackPop) {
      console.error('Paystack script not loaded');
      return;
    }

    setLoading(true);

    const handler = new window.PaystackPop!();

    handler.newTransaction({
      key: publicKey,
      email,
      amount: Math.round(amount * 100), // Convert to kobo/cents
      currency,
      ref: reference,
      metadata,
      onSuccess: (transaction: any) => {
        setLoading(false);
        onSuccess(transaction.reference);
      },
      onCancel: () => {
        setLoading(false);
        onClose();
      },
    });
  };

  // Check if Apple Pay is available
  const isApplePayAvailable = typeof window !== 'undefined' && 
    (window as any).ApplePaySession && 
    (window as any).ApplePaySession.canMakePayments();

  return (
    <div className={className}>
      <Button
        onClick={handlePayment}
        disabled={disabled || !scriptLoaded || loading}
        size="lg"
        className="w-full"
      >
        {loading ? (
          <>Processing...</>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay {currency} {amount.toLocaleString()}
          </>
        )}
      </Button>

      {isApplePayAvailable && (
        <Button
          onClick={handlePayment}
          disabled={disabled || !scriptLoaded || loading}
          variant="outline"
          size="lg"
          className="w-full mt-3 bg-black text-white hover:bg-gray-800 border-black"
        >
          <Smartphone className="w-5 h-5 mr-2" />
          Pay with Apple Pay
        </Button>
      )}

      {!scriptLoaded && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Loading payment system...
        </p>
      )}
    </div>
  );
}