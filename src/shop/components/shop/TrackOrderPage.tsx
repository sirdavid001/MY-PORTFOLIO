import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Search, ArrowLeft, CheckCircle2, Clock, Truck, PackageCheck, MapPin, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Header from './Header';
import Footer from './Footer';
import { api } from '../../lib/api';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault();
    if (!trackingInput.trim()) {
      toast.error('Please enter an order reference or tracking number');
      return;
    }

    setLoading(true);
    try {
      const result = await api.trackOrder(trackingInput.trim());
      if (result.success && result.order) {
        setOrder(result.order);
        toast.success('Order found!');
      } else {
        toast.error('Order not found');
        setOrder(null);
      }
    } catch (error: any) {
      console.error('Tracking error:', error);
      toast.error('Order not found. Please check your reference number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadgeVariant(status: string) {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
      case 'in_route':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  const statusSteps = [
    { key: 'paid', label: 'Order Placed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: PackageCheck },
  ];

  function getStepStatus(stepKey: string, currentStatus: string) {
    const statusOrder = ['paid', 'confirmed', 'processing', 'shipped', 'in_route', 'delivered'];
    const stepIndex = statusOrder.indexOf(stepKey);
    const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase() || '');
    
    if (currentIndex >= stepIndex) return 'completed';
    if (statusOrder.indexOf('shipped') === stepIndex && currentStatus?.toLowerCase() === 'in_route') return 'completed';
    return 'pending';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order reference or tracking number to see the status</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <Label htmlFor="tracking" className="text-base">Order Reference or Tracking Number</Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="tracking"
                      type="text"
                      placeholder="e.g., ORD-1234567890 or TRK-1234567890"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="px-8"
                  >
                    {loading ? 'Searching...' : 'Track'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  You can find this information in your order confirmation email
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Order Status Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Order Details</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Reference: {order.orderReference}</p>
                  </div>
                  <Badge 
                    variant={getStatusBadgeVariant(order.status)} 
                    className="text-sm px-4 py-2 w-fit"
                  >
                    {order.status?.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Timeline */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Order Progress</h3>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ 
                          width: `${(statusSteps.findIndex(s => s.key === order.status?.toLowerCase()) + 1) / statusSteps.length * 100}%` 
                        }}
                      />
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-4 gap-2 relative">
                      {statusSteps.map((step, index) => {
                        const status = getStepStatus(step.key, order.status);
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-all ${
                                status === 'completed' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <p className={`text-xs mt-2 text-center ${
                              status === 'completed' ? 'text-blue-600 font-semibold' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-mono text-lg font-semibold">{order.trackingNumber}</p>
                  </div>
                )}

                {/* Order Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Total</p>
                    <p className="font-medium text-lg">{order.currency} {order.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium break-all">{order.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium">
                        {order.address}<br />
                        {order.city}, {order.country}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.currency} {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{order.currency} {order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {order.shippingCost === 0 ? 'FREE' : `${order.currency} ${order.shippingCost?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{order.currency} {order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setOrder(null);
                  setTrackingInput('');
                }}
              >
                Track Another Order
              </Button>
              <Button 
                className="flex-1"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!order && !loading && trackingInput && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Order Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find an order with that reference. Please check and try again.
              </p>
              <Button variant="outline" onClick={() => setTrackingInput('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
