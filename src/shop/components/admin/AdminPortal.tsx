import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Shield, LogOut } from 'lucide-react';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminShipping from './AdminShipping';
import { api } from '../../lib/api';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('No token found in localStorage');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      console.log('Checking session with token...');
      const response = await api.adminSession();
      console.log('Session check response:', response);
      setIsAuthenticated(true);
      setAuthToken(token);
    } catch (error: any) {
      console.error('Session check failed:', error);
      
      // Parse error message for helpful feedback
      if (error.message.includes('401')) {
        toast.error('Session expired. Please login again.');
      } else if (error.message.includes('403')) {
        toast.error('Not authorized as admin. Please create an admin account at /admin-setup-first-time');
      } else {
        toast.error('Session check failed: ' + error.message);
      }
      
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminTokenTimestamp');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await api.adminLogin(email, password);
      console.log('Login result:', result);
      
      if (result.success && result.token) {
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminTokenTimestamp', Date.now().toString());
        setAuthToken(result.token);
        setIsAuthenticated(true);
        toast.success('Login successful');
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.adminLogout();
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAuthToken(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async function handleDebug() {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-bda4aae5/api/admin/debug`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Token': localStorage.getItem('adminToken') || '',
        },
      });
      const data = await response.json();
      console.log('🔍 Debug Info:', data);

      if (data.isAdmin) {
        toast.success('✓ Admin authentication is working correctly!');
      } else if (data.error) {
        toast.error(`Debug: ${data.message || data.error}`);
      } else {
        toast.warning('Debug: User authenticated but NOT admin');
      }
    } catch (error: any) {
      console.error('Debug error:', error);
      toast.error('Debug check failed');
    }
  }

  // Handle 401/403 from child components
  function handleAuthError() {
    console.log('Auth error detected, logging out');
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAuthToken(null);
    toast.error('Session expired. Please log in again.');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              SirDavid Gadgets Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sirdavidgadgets.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              {/* First Time Setup Link */}
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
                <p className="font-semibold mb-1">🔐 First Time Here?</p>
                <p className="mb-2 text-xs">No admin account exists yet. Create one to get started.</p>
                <a 
                  href="/admin-setup-first-time"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline"
                >
                  → Create First Admin Account
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleDebug}>
                🔍 Debug Auth
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <AdminOrders isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />
          </TabsContent>

          <TabsContent value="shipping">
            <AdminShipping isAuthenticated={isAuthenticated} onAuthError={handleAuthError} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}