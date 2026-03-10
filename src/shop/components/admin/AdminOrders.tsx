import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { toast } from 'sonner';
import {
  Package, Search, ExternalLink, RefreshCw,
  TrendingUp, Truck, CheckCircle, CreditCard,
  ChevronDown, ChevronUp, X, ShieldCheck, PackageCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { api } from '../../lib/api';

interface AdminOrdersProps {
  isAuthenticated: boolean;
  onAuthError?: () => void;
}

// Only statuses that can appear after payment is confirmed
const STATUS_OPTIONS = [
  { value: 'all',        label: 'All Paid Orders' },
  { value: 'paid',       label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'in_route',   label: 'In Route' },
  { value: 'shipped',    label: 'Shipped' },
  { value: 'delivered',  label: 'Delivered' },
  { value: 'cancelled',  label: 'Cancelled' },
];

const STATUS_BADGE: Record<string, string> = {
  paid:       'bg-green-100 text-green-800 border border-green-200',
  processing: 'bg-blue-100 text-blue-800 border border-blue-200',
  in_route:   'bg-purple-100 text-purple-800 border border-purple-200',
  shipped:    'bg-purple-100 text-purple-800 border border-purple-200',
  delivered:  'bg-cyan-100 text-cyan-800 border border-cyan-200',
  completed:  'bg-cyan-100 text-cyan-800 border border-cyan-200',
  cancelled:  'bg-red-100 text-red-800 border border-red-200',
};

export default function AdminOrders({ isAuthenticated, onAuthError }: AdminOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => { if (isAuthenticated) loadOrders(); }, [isAuthenticated]);

  async function loadOrders() {
    try {
      setLoading(true);
      const result = await api.getAdminOrders();
      setOrders(result.orders || []);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) onAuthError?.();
      else toast.error('Failed to load orders: ' + err.message);
    } finally { setLoading(false); }
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdatingStatus(orderId);
    try {
      await api.updateOrder(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingStatus(null); }
  }

  async function saveTracking(orderId: string) {
    try {
      await api.updateOrder(orderId, { trackingNumber: trackingInput });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingNumber: trackingInput } : o));
      setEditingTracking(null);
      toast.success('Tracking number updated');
    } catch { toast.error('Failed to update tracking'); }
  }

  // ── Stats (all based on paid+ orders only) ──────────────────────────────────
  const stats = useMemo(() => ({
    total:      orders.length,
    revenue:    orders
      .filter(o => ['paid', 'processing', 'in_route', 'shipped', 'delivered', 'completed'].includes(o.status))
      .reduce((s, o) => s + (o.total || 0), 0),
    paid:       orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    inRoute:    orders.filter(o => ['in_route', 'shipped'].includes(o.status)).length,
    delivered:  orders.filter(o => ['delivered', 'completed'].includes(o.status)).length,
  }), [orders]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter(o => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      if (!q) return matchStatus;
      const hay = [o.reference, o.customerName, o.customerEmail, o.customerPhone, o.address, o.city, o.country, o.trackingNumber].join(' ').toLowerCase();
      return matchStatus && hay.includes(q);
    });
  }, [orders, search, statusFilter]);

  if (loading) return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Loading orders…</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">

      {/* Payment-confirmed notice */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          <span className="font-semibold">Payment-confirmed orders only.</span>{' '}
          Orders with unpaid / pending status are hidden — they appear here automatically once Paystack confirms payment.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Orders',  value: stats.total,                   icon: <Package className="w-4 h-4 text-gray-500" />,       cls: 'text-gray-800' },
          { label: 'Revenue',       value: `$${stats.revenue.toFixed(0)}`,icon: <TrendingUp className="w-4 h-4 text-green-500" />,   cls: 'text-green-700' },
          { label: 'Paid',          value: stats.paid,                    icon: <CreditCard className="w-4 h-4 text-blue-500" />,    cls: 'text-blue-700' },
          { label: 'Processing',    value: stats.processing,              icon: <Package className="w-4 h-4 text-indigo-500" />,     cls: 'text-indigo-700' },
          { label: 'In Route',      value: stats.inRoute,                 icon: <Truck className="w-4 h-4 text-purple-500" />,       cls: 'text-purple-700' },
          { label: 'Delivered',     value: stats.delivered,               icon: <PackageCheck className="w-4 h-4 text-cyan-500" />, cls: 'text-cyan-700' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">{s.icon}<span className="text-xs text-gray-500">{s.label}</span></div>
              <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by reference, name, email, phone, city, tracking…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    statusFilter === s.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={loadOrders} className="h-7 px-2">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filtered.length} of {orders.length} paid orders</p>
        </CardContent>
      </Card>

      {/* Empty */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              {orders.length === 0 ? 'No paid orders yet' : 'No orders match'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {orders.length === 0
                ? 'Orders will appear here once customers complete payment via Paystack'
                : 'Try a different search or filter'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => (
                  <React.Fragment key={order.id}>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-mono text-blue-600 text-xs">{order.reference}</span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-gray-400 text-xs">{order.customerEmail}</p>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {order.currency} {(order.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {updatingStatus === order.id ? (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        ) : (
                          <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
                            <SelectTrigger className={`h-7 text-xs w-[130px] rounded-full px-2 ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.filter(s => s.value !== 'all').map(s => (
                                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingTracking === order.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={trackingInput}
                              onChange={e => setTrackingInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveTracking(order.id);
                                if (e.key === 'Escape') setEditingTracking(null);
                              }}
                              className="h-7 text-xs w-28"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => saveTracking(order.id)} className="h-7 px-2 text-xs">✓</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingTracking(null)} className="h-7 px-1">✕</Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingTracking(order.id); setTrackingInput(order.trackingNumber || ''); }}
                            className="text-xs text-blue-600 hover:underline font-mono"
                          >
                            {order.trackingNumber || <span className="text-gray-400 italic">+ Add</span>}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-1 text-gray-400 hover:text-gray-700"
                          >
                            {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <a
                            href={`/track-order?ref=${order.reference}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow key={`${order.id}-detail`} className="bg-gray-50">
                        <TableCell colSpan={7} className="px-6 py-4">
                          <OrderDetail order={order} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-mono text-blue-600 text-xs mb-0.5">{order.reference}</p>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{order.currency} {(order.total || 0).toLocaleString()}</p>
                      <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {order.status}
                    </span>
                    <span className="text-gray-400 text-xs">{order.items?.length || 0} item(s)</span>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="ml-auto text-gray-500 text-xs flex items-center gap-1 hover:text-gray-800"
                    >
                      {expandedOrder === order.id ? 'Less' : 'Details'}
                      {expandedOrder === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1.5">Update Status</p>
                        <Select value={order.status} onValueChange={v => updateStatus(order.id, v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.filter(s => s.value !== 'all').map(s => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <OrderDetail order={order} />
                      <a
                        href={`/track-order?ref=${order.reference}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 text-xs hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View tracking page
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrderDetail({ order }: { order: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</p>
        <p className="font-medium">{order.customerName}</p>
        <p className="text-gray-500">{order.customerEmail}</p>
        {order.customerPhone && <p className="text-gray-500">{order.customerPhone}</p>}
        {order.address && <p className="text-gray-500 text-xs">{order.address}, {order.city}, {order.country}</p>}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</p>
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>{order.currency} {(order.subtotal || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span>{order.shipping === 0 ? 'FREE' : `${order.currency} ${(order.shipping || 0).toLocaleString()}`}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-1 mt-1">
          <span>Total Paid</span>
          <span>{order.currency} {(order.total || 0).toLocaleString()}</span>
        </div>
        <p className="text-gray-400 text-xs capitalize">via {order.paymentMethod}</p>
        {order.paymentVerifiedAt && (
          <p className="text-green-600 text-xs">
            ✓ Verified {new Date(order.paymentVerifiedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({order.items?.length || 0})</p>
        {(order.items || []).map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-700">{item.name} × {item.quantity}</span>
            <span className="text-gray-500">{order.currency} {((item.price || 0) * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        {order.notes && <p className="text-gray-400 text-xs italic mt-1">"{order.notes}"</p>}
      </div>
    </div>
  );
}