import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Truck, DollarSign, Percent, GitMerge, Info, RefreshCw } from 'lucide-react';
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

type ShippingMode = 'flat' | 'percent' | 'hybrid';

interface ShippingSettings {
  mode: ShippingMode;
  flatAmount: number;
  percentAmount: number;
  freeThreshold: number;
}

const DEFAULT: ShippingSettings = { mode: 'flat', flatAmount: 10, percentAmount: 5, freeThreshold: 0 };

function calcPreview(s: ShippingSettings, subtotal: number): number {
  if (s.freeThreshold > 0 && subtotal >= s.freeThreshold) return 0;
  if (s.mode === 'flat')    return s.flatAmount;
  if (s.mode === 'percent') return (subtotal * s.percentAmount) / 100;
  if (s.mode === 'hybrid')  return Math.max(s.flatAmount, (subtotal * s.percentAmount) / 100);
  return 0;
}

export default function AdminShipping({ isAuthenticated, onAuthError }: AdminShippingProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT);
  const [savedSettings, setSavedSettings] = useState<ShippingSettings>(DEFAULT);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isAuthenticated) loadSettings(); }, [isAuthenticated]);

  async function loadSettings() {
    try {
      setLoading(true);
      const result = await api.getShippingSettings();
      if (result.settings) {
        const next = { ...DEFAULT, ...result.settings };
        setSettings(next);
        setSavedSettings(next);
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('403')) onAuthError?.();
      else toast.error('Failed to load shipping settings: ' + err.message);
    } finally { setLoading(false); }
  }

  function set<K extends keyof ShippingSettings>(key: K, val: ShippingSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (settings.flatAmount < 0)   e.flatAmount    = 'Must be 0 or more';
    if (settings.percentAmount < 0 || settings.percentAmount > 100) e.percentAmount = 'Must be between 0 and 100';
    if (settings.freeThreshold < 0) e.freeThreshold = 'Must be 0 or more';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.updateShippingSettings(settings);
      setSavedSettings(settings);
      toast.success('Shipping settings saved successfully');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    } finally { setSaving(false); }
  }

  if (loading) return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Loading settings…</p>
      </CardContent>
    </Card>
  );

  const SAMPLE = [25, 75, 150, 300];
  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const previewForDefaultCart = calcPreview(settings, 150);
  const modeLabel =
    settings.mode === 'flat' ? 'Flat Rate'
    : settings.mode === 'percent' ? 'Percentage'
    : 'Hybrid';

  return (
    <div className="max-w-2xl space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Delivery policy workspace</p>
              <p className="mt-1 text-sm text-gray-600">
                Adjust your shipping formula and preview how it affects checkout totals before publishing the change.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={loadSettings}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </Button>
              <Button type="button" variant="outline" onClick={() => setSettings(savedSettings)} disabled={!hasChanges}>
                Reset changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setSettings(DEFAULT)}>
                Use defaults
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mode</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{modeLabel}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">$150 preview</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {previewForDefaultCart === 0 ? 'FREE' : `$${previewForDefaultCart.toFixed(2)}`}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Free shipping</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {settings.freeThreshold > 0 ? `$${settings.freeThreshold.toFixed(2)}` : 'Disabled'}
              </p>
            </div>
          </div>

          {hasChanges ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Unsaved changes are present. Save to publish the new delivery policy.
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Shipping settings are in sync with the current saved configuration.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="w-4 h-4 text-blue-600" /> Shipping Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.mode}
            onValueChange={v => set('mode', v as ShippingMode)}
            className="space-y-3"
          >
            {[
              {
                value: 'flat' as ShippingMode,
                icon: <DollarSign className="w-4 h-4 text-green-600" />,
                label: 'Flat Rate',
                desc: 'A fixed fee is added to every order, regardless of order size.',
              },
              {
                value: 'percent' as ShippingMode,
                icon: <Percent className="w-4 h-4 text-blue-600" />,
                label: 'Percentage',
                desc: 'Shipping = subtotal × rate. Scales proportionally with order size.',
              },
              {
                value: 'hybrid' as ShippingMode,
                icon: <GitMerge className="w-4 h-4 text-purple-600" />,
                label: 'Hybrid',
                desc: 'Shipping = max(minimum fee, subtotal × rate). Balances small and large orders.',
              },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  settings.mode === opt.value
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {opt.icon}
                    <span className="font-medium text-sm">{opt.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Flat / Hybrid min fee */}
          {(settings.mode === 'flat' || settings.mode === 'hybrid') && (
            <div>
              <Label htmlFor="s-flat">
                {settings.mode === 'hybrid' ? 'Minimum Fee (USD)' : 'Flat Rate (USD)'}
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <Input
                  id="s-flat" type="number" min="0" step="0.5"
                  value={settings.flatAmount}
                  onChange={e => set('flatAmount', parseFloat(e.target.value) || 0)}
                  className={`pl-7 ${errors.flatAmount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.flatAmount && <p className="text-red-500 text-xs mt-1">{errors.flatAmount}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {settings.mode === 'hybrid'
                  ? 'Orders will never be charged less than this amount'
                  : 'Applied to every order as a fixed shipping cost'}
              </p>
            </div>
          )}

          {/* Percent / Hybrid rate */}
          {(settings.mode === 'percent' || settings.mode === 'hybrid') && (
            <div>
              <Label htmlFor="s-pct">Rate (%)</Label>
              <div className="relative mt-1">
                <Input
                  id="s-pct" type="number" min="0" max="100" step="0.1"
                  value={settings.percentAmount}
                  onChange={e => set('percentAmount', parseFloat(e.target.value) || 0)}
                  className={`pr-8 ${errors.percentAmount ? 'border-red-500' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              {errors.percentAmount && <p className="text-red-500 text-xs mt-1">{errors.percentAmount}</p>}
              <p className="text-xs text-gray-500 mt-1">Percentage of the order subtotal charged as shipping</p>
            </div>
          )}

          {/* Free threshold */}
          <div>
            <Label htmlFor="s-free">Free Shipping Threshold (USD)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <Input
                id="s-free" type="number" min="0" step="5"
                value={settings.freeThreshold}
                onChange={e => set('freeThreshold', parseFloat(e.target.value) || 0)}
                className={`pl-7 ${errors.freeThreshold ? 'border-red-500' : ''}`}
                placeholder="0 = disabled"
              />
            </div>
            {errors.freeThreshold && <p className="text-red-500 text-xs mt-1">{errors.freeThreshold}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {settings.freeThreshold > 0
                ? `Orders ≥ $${settings.freeThreshold} qualify for free shipping`
                : 'Set to any value > 0 to enable a free-shipping threshold'}
            </p>
          </div>

          {/* Formula display */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-blue-800 text-sm font-medium mb-0.5">Shipping formula</p>
                {settings.mode === 'flat'    && <p className="text-blue-700 text-xs font-mono">shipping = ${settings.flatAmount.toFixed(2)}</p>}
                {settings.mode === 'percent' && <p className="text-blue-700 text-xs font-mono">shipping = subtotal × {settings.percentAmount}%</p>}
                {settings.mode === 'hybrid'  && <p className="text-blue-700 text-xs font-mono">shipping = max(${settings.flatAmount.toFixed(2)}, subtotal × {settings.percentAmount}%)</p>}
                {settings.freeThreshold > 0  && <p className="text-green-700 text-xs mt-1">→ Free when subtotal ≥ ${settings.freeThreshold}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {SAMPLE.map(sub => {
                  const ship = calcPreview(settings, sub);
                  return (
                    <tr key={sub} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700">${sub.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right">
                        {ship === 0
                          ? <span className="text-green-600 font-medium">FREE</span>
                          : <span className="text-amber-700">${ship.toFixed(2)}</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">${(sub + ship).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving…' : 'Save Shipping Settings'}
      </Button>
    </div>
  );
}
