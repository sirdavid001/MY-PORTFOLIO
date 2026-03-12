import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shield, UserPlus, Loader2, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { api } from '../../lib/api';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function AdminSignup() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [wasUpdated, setWasUpdated] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  async function testConnection() {
    setTestingConnection(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda4aae5/health`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await response.json();
      if (data.status === 'ok') {
        toast.success('✓ Backend connection successful!');
      } else {
        toast.error('Backend responded but status is not OK');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      toast.error('Backend connection failed: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await api.adminSignup(name, email, password);
      
      if (result.success) {
        setSuccess(true);
        setWasUpdated(result.updated === true);
        setSuccessMessage(result.message || 'Admin account ready.');
        toast.success(result.updated ? 'Admin credentials updated!' : 'Admin account created!');
        
        // Show user ID for reference
        toast.success(`User ID: ${result.userId}`, { duration: 10000 });
      } else {
        toast.error(result.error || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
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
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {wasUpdated ? 'Credentials Updated!' : 'Account Created!'}
                  </h2>
                  <p className="text-gray-600">
                    {wasUpdated
                      ? 'Your admin password has been reset successfully.'
                      : 'Your admin account has been successfully created.'}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-2">
                        {wasUpdated ? 'Password Reset Complete' : 'Setup Complete'}
                      </p>
                      <div className="space-y-1 text-sm text-green-800">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="font-mono">{email}</span>
                        </p>
                        <p className="text-xs text-green-600 mt-2">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => window.location.href = '/secure-admin-portal-xyz'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Go to Admin Portal
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => { setSuccess(false); setWasUpdated(false); }}
                  >
                    {wasUpdated ? 'Reset Another Account' : 'Create Another Admin'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">First-Time Setup</CardTitle>
              <CardDescription className="text-base">
                Create your administrator account or reset password
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10 h-11"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

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
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
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
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Minimum 8 characters required</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Admin Account
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Setup Information
                  </p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Use this page to create a new admin account <strong>or reset your password</strong> if you can't log in. Enter your email and a new password — existing accounts will have their credentials updated automatically.
                  </p>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/secure-admin-portal-xyz" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      Sign In
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}