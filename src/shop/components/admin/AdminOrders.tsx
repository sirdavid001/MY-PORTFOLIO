import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Package, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api } from '../../lib/api';

interface AdminOrdersProps {
  isAuthenticated: boolean;
  onAuthError?: () => void;
}

export default function AdminOrders({ isAuthenticated, onAuthError }: AdminOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  async function loadOrders() {
    try {
      setLoading(true);
      const result = await api.getAdminOrders();
      setOrders(result.orders || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      
      // If we get 401/403, the session is invalid
      if (error.message?.includes('401')) {
        console.error('Session expired or unauthorized');
        toast.error('Session expired. Please login again.');
        onAuthError?.();
      } else if (error.message?.includes('403')) {
        console.error('Not authorized as admin');
        toast.error('Not authorized. Please create an admin account at /admin-setup-first-time');
        onAuthError?.();
      } else {
        toast.error('Failed to load orders: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    try {
      await api.updateOrder(orderId, { status: newStatus });
      toast.success('Order status updated');
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    }
  }

  async function handleTrackingUpdate(orderId: string, trackingNumber: string) {
    try {
      await api.updateOrder(orderId, { trackingNumber });
      toast.success('Tracking number updated');
      setShowDialog(false);
      loadOrders();
    } catch (error: any) {
      console.error('Failed to update tracking:', error);
      toast.error('Failed to update tracking number');
    }
  }

  function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'in_route':
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders Management</span>
            <Badge variant="secondary">{orders.length} orders</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {order.currency} {order.total?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in_route">In Route</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDialog(true);
                          }}
                        >
                          {order.trackingNumber || 'Add'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/track-order?ref=${order.reference}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tracking Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Tracking Number</DialogTitle>
            <DialogDescription>Enter the tracking number for the order.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Order Reference</Label>
                <p className="font-medium">{selectedOrder.reference}</p>
              </div>
              <div>
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  defaultValue={selectedOrder.trackingNumber}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTrackingUpdate(selectedOrder.id, e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <Button
                onClick={(e) => {
                  const input = document.getElementById('tracking') as HTMLInputElement;
                  handleTrackingUpdate(selectedOrder.id, input.value);
                }}
                className="w-full"
              >
                Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}