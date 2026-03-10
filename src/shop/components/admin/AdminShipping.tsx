import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { api } from '../../lib/api';

interface AdminShippingProps {
  isAuthenticated: boolean;
  onAuthError?: () => void;
}

export default function AdminShipping({ isAuthenticated, onAuthError }: AdminShippingProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    mode: 'flat',
    flatAmount: 10,
    percentAmount: 0,
    freeThreshold: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  async function loadSettings() {
    try {
      setLoading(true);
      const result = await api.getShippingSettings();
      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (error: any) {
      console.error('Failed to load shipping settings:', error);
      // If we get 401/403, the session is invalid
      if (error.message?.includes('401') || error.message?.includes('403')) {
        console.error('Session expired or unauthorized');
        onAuthError?.();
      } else {
        toast.error('Failed to load shipping settings: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateShippingSettings(settings);
      toast.success('Shipping settings updated');
    } catch (error: any) {
      console.error('Failed to save shipping settings:', error);
      toast.error('Failed to save shipping settings');
    } finally {
      setSaving(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Shipping Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block">Shipping Mode</Label>
          <RadioGroup
            value={settings.mode}
            onValueChange={(value) => setSettings({ ...settings, mode: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flat" id="flat" />
              <Label htmlFor="flat">Flat Rate</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percent" id="percent" />
              <Label htmlFor="percent">Percentage of Subtotal</Label>
            </div>
          </RadioGroup>
        </div>

        {settings.mode === 'flat' && (
          <div>
            <Label htmlFor="flatAmount">Flat Shipping Amount (USD)</Label>
            <Input
              id="flatAmount"
              type="number"
              min="0"
              step="0.01"
              value={settings.flatAmount}
              onChange={(e) =>
                setSettings({ ...settings, flatAmount: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-600 mt-1">
              Fixed shipping cost applied to all orders
            </p>
          </div>
        )}

        {settings.mode === 'percent' && (
          <div>
            <Label htmlFor="percentAmount">Shipping Percentage (%)</Label>
            <Input
              id="percentAmount"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.percentAmount}
              onChange={(e) =>
                setSettings({ ...settings, percentAmount: parseFloat(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-gray-600 mt-1">
              Percentage of subtotal charged as shipping
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="freeThreshold">Free Shipping Threshold (USD)</Label>
          <Input
            id="freeThreshold"
            type="number"
            min="0"
            step="0.01"
            value={settings.freeThreshold}
            onChange={(e) =>
              setSettings({ ...settings, freeThreshold: parseFloat(e.target.value) || 0 })
            }
          />
          <p className="text-sm text-gray-600 mt-1">
            Orders above this amount get free shipping (0 to disable)
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Preview</h4>
          <div className="space-y-1 text-sm text-blue-800">
            {settings.mode === 'flat' && (
              <p>Flat rate: ${settings.flatAmount} per order</p>
            )}
            {settings.mode === 'percent' && (
              <p>Percentage: {settings.percentAmount}% of subtotal</p>
            )}
            {settings.freeThreshold > 0 && (
              <p>Free shipping on orders above ${settings.freeThreshold}</p>
            )}
            {settings.freeThreshold === 0 && <p>Free shipping: Disabled</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}