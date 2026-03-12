import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Package, Search, CheckCircle2, Clock, Truck, PackageCheck,
  MapPin, User, Mail, Phone, Copy, Check, ChevronRight,
  ShoppingBag, AlertCircle, XCircle, ArrowRight, RefreshCw,
  Calendar, CreditCard, Hash, FileText, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import Header from './Header';
import Footer from './Footer';
import { api } from '../../lib/api';
import { normalizeOrderRecord } from '../../lib/orders';

// ─── Status configuration ─────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string;
  dotColor: string; icon: any; description: string;
}> = {
  pending: {
    label: 'Pending Payment', color: 'text-amber-700', bg: 'bg-amber-50',
    border: 'border-amber-200', dotColor: 'bg-amber-500',
    icon: Clock,
    description: 'Your order is awaiting payment confirmation.',
  },
  paid: {
    label: 'Payment Confirmed', color: 'text-blue-700', bg: 'bg-blue-50',
    border: 'border-blue-200', dotColor: 'bg-blue-500',
    icon: CheckCircle2,
    description: 'Payment received! Your order is being reviewed.',
  },
  confirmed: {
    label: 'Order Confirmed', color: 'text-blue-700', bg: 'bg-blue-50',
    border: 'border-blue-200', dotColor: 'bg-blue-500',
    icon: CheckCircle2,
    description: 'Your order has been confirmed and is queued for processing.',
  },
  processing: {
    label: 'Processing', color: 'text-purple-700', bg: 'bg-purple-50',
    border: 'border-purple-200', dotColor: 'bg-purple-500',
    icon: Package,
    description: 'Your order is being carefully packed and prepared.',
  },
  shipped: {
    label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-50',
    border: 'border-indigo-200', dotColor: 'bg-indigo-500',
    icon: Truck,
    description: 'Your order is on its way! Track with your tracking number.',
  },
  in_route: {
    label: 'In Transit', color: 'text-indigo-700', bg: 'bg-indigo-50',
    border: 'border-indigo-200', dotColor: 'bg-indigo-500',
    icon: Truck,
    description: 'Your order is in transit and heading to you.',
  },
  delivered: {
    label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50',
    border: 'border-green-200', dotColor: 'bg-green-500',
    icon: PackageCheck,
    description: 'Your order has been delivered. Enjoy your gadget!',
  },
  cancelled: {
    label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50',
    border: 'border-red-200', dotColor: 'bg-red-500',
    icon: XCircle,
    description: 'This order has been cancelled.',
  },
};

// Status progression order (for timeline)
const STATUS_STEPS = [
  { key: 'paid',       label: 'Order Placed',  icon: CheckCircle2  },
  { key: 'processing', label: 'Processing',    icon: Package       },
  { key: 'shipped',    label: 'Shipped',       icon: Truck         },
  { key: 'delivered',  label: 'Delivered',     icon: PackageCheck  },
];

const STATUS_ORDER = ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'in_route', 'delivered'];

function getStepState(stepKey: string, currentStatus: string): 'completed' | 'active' | 'pending' {
  const normalised = currentStatus?.toLowerCase() || 'pending';
  if (normalised === 'cancelled') return 'pending';

  // Map aliases
  const mapped = normalised === 'in_route' ? 'shipped'
               : normalised === 'confirmed' ? 'paid'
               : normalised;

  const stepIdx    = STATUS_ORDER.indexOf(stepKey);
  const currentIdx = STATUS_ORDER.indexOf(mapped === 'paid' && normalised === 'confirmed' ? 'confirmed' : mapped);

  if (currentIdx > stepIdx) return 'completed';
  if (currentIdx === stepIdx) return 'active';
  return 'pending';
}

function getProgressPercent(status: string): number {
  const normalised = status?.toLowerCase() || 'pending';
  if (normalised === 'cancelled') return 0;
  const mapped = normalised === 'in_route' ? 'shipped' : normalised === 'confirmed' ? 'paid' : normalised;
  const idx = STATUS_ORDER.indexOf(mapped);
  return Math.max(0, Math.min(100, ((idx) / (STATUS_ORDER.length - 1)) * 100));
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtCurrency(amount: number, currency: string) {
  if (!amount && amount !== 0) return '—';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// ─── Copy-to-clipboard hook ───────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  function copy(text: string) {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    } catch {
      // ignore
    }
    setCopied(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setCopied(false), 2000);
  }
  return { copied, copy };
}

// ─── CopyField component ──────────────────────────────────────────────────────
function CopyField({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy();
  if (!value) return null;
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 gap-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="font-mono text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
      <button
        onClick={() => { copy(value); toast.success(`${label} copied!`); }}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-track if ?ref= is in the URL
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setInput(ref);
      trackOrder(ref);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function trackOrder(ref: string) {
    const trimmed = ref.trim();
    if (!trimmed) {
      toast.error('Please enter an order reference or tracking number');
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setSearched(false);
    setOrder(null);
    try {
      const result = await api.trackOrder(trimmed);
      if (result?.success && result?.order) {
        setOrder(normalizeOrderRecord(result.order));
      } else {
        setOrder(null);
        toast.error('No order found with that reference.');
      }
    } catch (err: any) {
      console.error('Tracking error:', err);
      setOrder(null);
      toast.error('Order not found. Double-check your reference number.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    trackOrder(input);
  }

  function reset() {
    setOrder(null);
    setInput('');
    setSearched(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const statusKey   = order?.status?.toLowerCase() || 'pending';
  const statusCfg   = STATUS_CONFIG[statusKey] || STATUS_CONFIG['pending'];
  const StatusIcon  = statusCfg.icon;
  const isCancelled = statusKey === 'cancelled';
  const isDelivered = statusKey === 'delivered';
  const progress    = order ? getProgressPercent(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-sm mx-auto">
            Enter your order reference or tracking number to get a live update on your delivery.
          </p>
        </div>
      </div>

      {/* ── Search card (overlapping hero) ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Order Reference or Tracking Number
            </label>
            <div className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="e.g. ORD-1234567890 or TRK-1234567890"
                  className="pl-9 h-11 sm:h-12 text-sm sm:text-base"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="h-11 sm:h-12 px-5 sm:px-7 flex-shrink-0">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span className="hidden sm:inline">Track Order</span><Search className="w-4 h-4 sm:hidden" /></>
                }
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Find this in your order confirmation email.
            </p>
          </form>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 w-full py-6 sm:py-8 space-y-5 sm:space-y-6">

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[80, 48, 64].map((h, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100" style={{ height: `${h}px` }} />
            ))}
          </div>
        )}

        {/* ── Not found state ── */}
        {!loading && searched && !order && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
              We couldn't find an order with that reference. Please check the number and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />Try Again
              </Button>
              <Button onClick={() => navigate('/shop')}>
                Browse Products
              </Button>
            </div>
          </div>
        )}

        {/* ════ ORDER FOUND ════ */}
        {!loading && order && (
          <div className="space-y-5 sm:space-y-6">

            {/* ── Status banner ── */}
            <div className={`rounded-2xl border ${statusCfg.bg} ${statusCfg.border} px-5 py-4 sm:px-6 sm:py-5`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCancelled ? 'bg-red-100' : isDelivered ? 'bg-green-100' : 'bg-white shadow-sm'
                }`}>
                  <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${statusCfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor} mr-1.5`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <p className={`text-sm ${statusCfg.color} font-medium`}>{statusCfg.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ordered {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Reference / Tracking numbers ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CopyField label="Order Reference" value={order.reference || order.id} />
              {order.trackingNumber && <CopyField label="Tracking Number" value={order.trackingNumber} />}
            </div>

            {/* ── Progress timeline ── */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Order Progress</h2>
                </div>
                <div className="px-5 sm:px-6 py-5 sm:py-6">
                  {/* Progress bar (mobile: horizontal, scrollable) */}
                  <div className="relative overflow-x-auto pb-1">
                    <div className="min-w-[280px]">
                      {/* Connector line */}
                      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full" style={{ zIndex: 0 }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                            background: isDelivered
                              ? 'linear-gradient(to right, #16a34a, #22c55e)'
                              : 'linear-gradient(to right, #2563eb, #6366f1)',
                          }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="grid grid-cols-4 gap-1 relative" style={{ zIndex: 1 }}>
                        {STATUS_STEPS.map((step) => {
                          const state  = getStepState(step.key, order.status);
                          const Icon   = step.icon;
                          const done   = state === 'completed';
                          const active = state === 'active';
                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                done
                                  ? isDelivered ? 'bg-green-600 border-green-600' : 'bg-blue-600 border-blue-600'
                                  : active
                                  ? isDelivered ? 'bg-green-50 border-green-400' : 'bg-blue-50 border-blue-400'
                                  : 'bg-white border-gray-300'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  done
                                    ? 'text-white'
                                    : active
                                    ? isDelivered ? 'text-green-600' : 'text-blue-600'
                                    : 'text-gray-400'
                                }`} />
                              </div>
                              <p className={`text-xs mt-2 text-center leading-tight ${
                                done || active
                                  ? isDelivered ? 'text-green-700 font-semibold' : 'text-blue-700 font-semibold'
                                  : 'text-gray-400'
                              }`}>
                                {step.label}
                              </p>
                              {active && (
                                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* What happens next */}
                  {!isDelivered && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What happens next?</p>
                      <p className="text-sm text-gray-600">
                        {statusKey === 'pending'   && 'Complete your payment to get your order moving.'}
                        {(statusKey === 'paid' || statusKey === 'confirmed') && 'Our team is reviewing your order and will begin packing shortly.'}
                        {statusKey === 'processing' && 'Your item is being carefully packed. Expect a shipping update soon.'}
                        {(statusKey === 'shipped' || statusKey === 'in_route') && 'Your package is en route. Check your tracking number with the courier for live updates.'}
                      </p>
                    </div>
                  )}

                  {isDelivered && (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-start gap-3">
                      <PackageCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-700">Order successfully delivered!</p>
                        <p className="text-xs text-gray-500 mt-0.5">We hope you love your new gadget. Consider leaving a review.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Cancelled state details ── */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-5 flex items-start gap-4">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Order Cancelled</p>
                  <p className="text-xs text-red-600">
                    This order has been cancelled. If you believe this is an error or need assistance, please contact our support team with your order reference.
                  </p>
                </div>
              </div>
            )}

            {/* ── Order items ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Order Items
                  {order.items?.length > 0 && (
                    <span className="text-gray-400 font-normal ml-1">({order.items.length})</span>
                  )}
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items?.length > 0 ? (
                  order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          Qty: {item.quantity} × {fmtCurrency(item.price, order.currency)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {fmtCurrency(item.price * item.quantity, order.currency)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 sm:px-6 py-6 text-center text-sm text-gray-400">No items recorded</div>
                )}
              </div>

              {/* Pricing summary */}
              <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{fmtCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-medium ${order.shipping === 0 ? 'text-green-600' : ''}`}>
                    {order.shipping === 0 ? 'FREE' : fmtCurrency(order.shipping, order.currency)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-lg text-blue-700">
                    {fmtCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Two-column: Customer + Delivery ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              {/* Customer info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-800 text-sm">Customer</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <InfoRow icon={<User className="w-4 h-4 text-gray-400" />} label="Name" value={order.customerName} />
                  <InfoRow icon={<Mail className="w-4 h-4 text-gray-400" />} label="Email" value={order.customerEmail} truncate />
                  {order.customerPhone && (
                    <InfoRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone" value={order.customerPhone} />
                  )}
                  <InfoRow
                    icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                    label="Payment"
                    value={order.paymentMethod
                      ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
                      : 'Paystack'}
                  />
                </div>
              </div>

              {/* Delivery info */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-800 text-sm">Delivery</h3>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <InfoRow icon={<MapPin className="w-4 h-4 text-gray-400" />} label="Address" value={order.address} />
                  {order.city && (
                    <InfoRow icon={<MapPin className="w-4 h-4 text-gray-400" />} label="City" value={`${order.city}${order.country ? `, ${order.country}` : ''}`} />
                  )}
                  <InfoRow icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Order Date" value={formatDate(order.createdAt)} />
                  {order.notes && (
                    <InfoRow icon={<FileText className="w-4 h-4 text-gray-400" />} label="Notes" value={order.notes} />
                  )}
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={reset} className="flex-1 h-11">
                <Hash className="w-4 h-4 mr-2" />
                Track Another Order
              </Button>
              <Button onClick={() => navigate('/shop')} className="flex-1 h-11">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* ── Help strip ── */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-800">Need help with your order?</p>
                <p className="text-xs text-blue-600 mt-0.5">Our team is ready to assist you with any questions.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs"
                  onClick={() => navigate('/faqs')}
                >
                  FAQs <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs"
                  onClick={() => navigate('/shipping-policy')}
                >
                  Shipping Policy
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* ── Initial idle state (no search yet) ── */}
        {!loading && !searched && !order && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-2">
            {[
              {
                icon: <Hash className="w-5 h-5 text-blue-600" />,
                title: 'Order Reference',
                desc: 'Use the ORD-XXXXXXXXXX reference from your confirmation email.',
              },
              {
                icon: <Truck className="w-5 h-5 text-blue-600" />,
                title: 'Tracking Number',
                desc: 'Or use the TRK-XXXXXXXXXX tracking number sent after dispatch.',
              },
              {
                icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
                title: 'Live Status',
                desc: 'See exactly where your order is — from placement to delivery.',
              },
            ].map((card) => (
              <div key={card.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  {card.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{card.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

// ─── InfoRow helper ───────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, truncate }: {
  icon: ReactNode; label: string; value?: string; truncate?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium text-gray-900 ${truncate ? 'truncate' : 'break-words'}`}>{value}</p>
      </div>
    </div>
  );
}
