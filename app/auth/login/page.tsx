'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@solar.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sun size={24} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SolarFlow</h1>
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="mb-8 text-muted-foreground">
            Sign in to your admin dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@solar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-input bg-card"
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => {}}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a href="#" className="font-medium text-primary hover:underline">
              Contact administrator
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background lg:flex flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/20 mx-auto">
            <Sun size={48} className="text-primary" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Solar Energy Management
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Manage your solar business operations with our comprehensive admin dashboard
          </p>
          <ul className="space-y-4 text-left">
            {[
              'Manage customers and subscriptions',
              'Track installation progress',
              'Monitor service requests',
              'Generate detailed reports',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
