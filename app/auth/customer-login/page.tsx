'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/page-header';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Check if user exists in Firestore users collection
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User not found. Please contact an administrator.');
      }

      const userData = userDoc.data();
      
      // Check if user is a customer or partner
      if (userData.role !== 'customer' && userData.role !== 'partner') {
        await signOut(auth);
        throw new Error('Access denied. This login is for customers and partners only.');
      }

      // Store customer/partner info in session storage
      sessionStorage.setItem('customerUid', user.uid);
      if (userData.customerId) {
        sessionStorage.setItem('customerId', userData.customerId);
      }
      sessionStorage.setItem('userRole', userData.role);

      // Redirect to appropriate dashboard
      if (userData.role === 'partner') {
        router.push('/partner/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Customer Login
            </h1>
            <p className="text-muted-foreground">
              Access your solar project dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team
            </p>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="/auth/customer-register" className="text-primary hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>

        {/* Back to Admin Login */}
        <div className="mt-4 text-center">
          <a
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
