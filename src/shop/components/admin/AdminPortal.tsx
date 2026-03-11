import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Shield, LogOut, Package, Layers, Truck, Activity, ChevronRight, Lock, Mail, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminShipping from './AdminShipping';
import { api } from '../../lib/api';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type Tab = 'orders' | 'products' | 'shipping';

const TAB_STORAGE_KEY = 'admin-active-tab';

const TAB_META: Record<Tab, { title: string; description: string; support: string }> = {
  orders: {
    title: 'Order Operations',
    description: 'Track paid orders, update delivery progress, and assign tracking numbers from one queue.',
    support: 'Best for daily fulfilment and after-payment support.',
  },
  products: {
    title: 'Catalog Control',
    description: 'Manage listings, pricing, publishing state, images, and exchange-rate inputs for the storefront.',
    support: 'Best for stock updates, pricing edits, and new launches.',
  },
  shipping: {
    title: 'Delivery Rules',
    description: 'Tune flat, percentage, or hybrid shipping logic and preview how shipping affects checkout totals.',
    support: 'Best for delivery policy, free-shipping thresholds, and margin protection.',
  },
};

function getValidTab(value: string | null | undefined): Tab | null {
  return value === 'orders' || value === 'products' || value === 'shipping' ? value : null;
}

export default function AdminPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'orders';
    return (
      getValidTab(new URLSearchParams(window.location.search).get('tab')) ||
      getValidTab(window.localStorage.getItem(TAB_STORAGE_KEY)) ||
      'orders'
    );
  });
  const [loginHint, setLoginHint] = useState<string | null>(null);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);
  const activeMeta = useMemo(() => TAB_META[activeTab], [activeTab]);

  useEffect(() => { checkSession(); }, []);

  useEffect(() => {
    const requestedTab = getValidTab(searchParams.get('tab'));
    if (requestedTab && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TAB_STORAGE_KEY, activeTab);

    const currentTab = getValidTab(searchParams.get('tab'));
    if (currentTab === activeTab) return;

    const next = new URLSearchParams(searchParams);
    next.set('tab', activeTab);
    setSearchParams(next, { replace: true });
  }, [activeTab, searchParams, setSearchParams]);

  async function checkSession() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { setLoading(false); return; }
      const session = await api.adminSession();
      setIsAuthenticated(true);
      setAdminEmail(session?.user?.email || '');
    } catch (err: any) {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdminEmail('');
      if (err.message?.includes('401')) toast.error('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoginLoading(true);
    setLoginHint(null);
    setLoginErrorMsg(null);
    try {
      const result = await api.adminLogin(email, password);
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        setIsAuthenticated(true);
        setAdminEmail(email.trim());
        toast.success('Welcome back!');
      } else {
        toast.error('Login failed');
      }
    } catch (err: any) {
      // The server now sends a hint field — surface it in the UI
      const msg = err.message || 'Invalid credentials';
      setLoginErrorMsg(msg);
      // Try to parse hint from the raw error text
      if (msg.includes('No admin account') || msg.includes('no_account')) {
        setLoginHint('no_account');
      } else if (msg.includes('not fully set up') || msg.includes('incomplete_setup')) {
        setLoginHint('incomplete_setup');
      } else if (msg.includes('Incorrect password') || msg.includes('wrong_password')) {
        setLoginHint('wrong_password');
      } else {
        setLoginHint('unknown');
      }
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try { await api.adminLogout(); } catch {}
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAdminEmail('');
    toast.success('Logged out');
  }

  async function handleDebug() {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda4aae5/api/admin/debug`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'X-Admin-Token': localStorage.getItem('adminToken') || '',
          },
        }
      );
      const data = await res.json();
      console.log('🔍 Debug:', data);
      data.isAdmin
        ? toast.success('✓ Auth working correctly')
        : toast.error(`Debug: ${data.message || data.error}`);
    } catch { toast.error('Debug request failed'); }
  }

  function handleAuthError() {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAdminEmail('');
    toast.error('Session expired. Please log in again.');
  }

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600" />
        <p className="text-gray-500 text-sm">Loading admin portal…</p>
      </div>
    </div>
  );

  // ── Login ──
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching shop */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none text-gray-900">SirDavid</span>
                <span className="text-xs text-gray-500">Gadgets</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-lg">
          <Card className="shadow-lg border">
            <CardHeader className="text-center pb-6 space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Sign in to access the management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@settlex.site"
                      className="pl-10 h-11"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={loginLoading}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loginLoading}
                  className="w-full h-11"
                >
                  {loginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Dynamic hint after a failed login */}
              {loginHint && loginErrorMsg && (
                <div className={`mt-5 rounded-lg border p-4 text-sm flex items-start gap-3 ${
                  loginHint === 'wrong_password'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    loginHint === 'wrong_password' ? 'text-amber-600' : 'text-red-600'
                  }`} />
                  <div>
                    <p className={`font-semibold mb-1 ${
                      loginHint === 'wrong_password' ? 'text-amber-900' : 'text-red-900'
                    }`}>
                      {loginHint === 'no_account' && 'No Account Found'}
                      {loginHint === 'wrong_password' && 'Incorrect Password'}
                      {loginHint === 'incomplete_setup' && 'Setup Incomplete'}
                      {loginHint === 'unknown' && 'Login Failed'}
                    </p>
                    <p className={`text-xs mb-2 ${
                      loginHint === 'wrong_password' ? 'text-amber-800' : 'text-red-800'
                    }`}>
                      {loginErrorMsg}
                    </p>
                    <a
                      href="/admin-setup-first-time"
                      className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
                        loginHint === 'wrong_password' ? 'text-amber-700' : 'text-red-700'
                      }`}
                    >
                      {loginHint === 'wrong_password' ? 'Reset Password →' : 'Go to Setup Page →'}
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-900 font-semibold mb-1">First Time Setup</p>
                      <p className="text-blue-700 text-xs mb-3">
                        Create your admin account or reset your password if you're locked out.
                      </p>
                      <a
                        href="/admin-setup-first-time"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                      >
                        Go to Setup Page
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Protected by secure authentication · All actions are logged
          </p>
        </div>
      </div>
    </div>
  );

  // ── Dashboard ──
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders',   label: 'Orders',   icon: <Package className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Layers className="w-4 h-4" /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Matching Shop Design */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Matching Shop */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none text-gray-900">SirDavid</span>
                <span className="text-xs text-gray-500">Admin Portal</span>
              </div>
            </div>

            {/* Navigation Tabs - Matching Shop Style */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? '' : 'text-gray-600 hover:text-gray-900'}
                >
                  {tab.icon}
                  <span className="ml-1.5">{tab.label}</span>
                </Button>
              ))}
            </nav>

            {/* Mobile Tabs */}
            <nav className="flex md:hidden items-center gap-1">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? 'px-2' : 'text-gray-600 hover:text-gray-900 px-2'}
                >
                  {tab.icon}
                </Button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDebug}
                className="text-gray-600 hover:text-gray-900 hidden sm:flex"
              >
                <Activity className="w-4 h-4 mr-1.5" />
                Debug
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Shield className="h-3.5 w-3.5" />
                    Secure admin workspace
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{activeMeta.title}</h1>
                    <p className="mt-1 max-w-2xl text-sm text-gray-600">{activeMeta.description}</p>
                  </div>
                  <p className="text-xs text-gray-500">{activeMeta.support}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Session</p>
                  <p className="mt-1 font-medium text-gray-900">{adminEmail || 'Authenticated admin'}</p>
                  <p className="mt-1 text-xs text-gray-500">Tab state is saved, so reopening the portal returns you to the last workspace.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="grid gap-3 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Quick Actions</p>
                <p className="mt-1 text-sm text-gray-600">Jump between the storefront, setup, and the active admin tab without losing context.</p>
              </div>
              <div className="grid gap-2">
                <a
                  href="/shop"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  Open storefront
                </a>
                <a
                  href="/admin-setup-first-time"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  Setup or reset access
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeTab === 'orders'   && <AdminOrders   isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />}
        {activeTab === 'products' && <AdminProducts isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />}
        {activeTab === 'shipping' && <AdminShipping isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />}
      </main>
    </div>
  );
}
