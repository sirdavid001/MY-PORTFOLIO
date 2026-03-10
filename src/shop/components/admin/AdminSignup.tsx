import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shield, UserPlus, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/make-server-bda4aae5/health`);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">
              {wasUpdated ? 'Credentials Updated!' : 'Admin Account Created!'}
            </CardTitle>
            <CardDescription>
              {wasUpdated
                ? 'Your admin password has been reset successfully.'
                : 'Your admin account has been successfully created.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold mb-2">✓ {wasUpdated ? 'Password reset complete' : 'Account created'}</p>
              <p className="mb-1">Email: <span className="font-mono">{email}</span></p>
              <p className="text-xs text-green-600 mt-2">{successMessage}</p>
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => window.location.href = '/secure-admin-portal-xyz'}
              >
                Go to Admin Login
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setSuccess(false); setWasUpdated(false); }}
              >
                {wasUpdated ? 'Reset Another Account' : 'Create Another Admin'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Create Admin Account</CardTitle>
          <CardDescription>
            Set up your first admin account for SirDavid Gadgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
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

            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              <p className="font-semibold mb-1">ℹ️ First Time Setup / Password Reset</p>
              <p>Use this page to create a new admin account <strong>or reset your password</strong> if you can't log in. Enter your email and a new password — existing accounts will have their password updated.</p>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/secure-admin-portal-xyz" className="text-blue-600 hover:underline">
                Login here
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}