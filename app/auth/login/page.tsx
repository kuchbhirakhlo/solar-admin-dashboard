'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '@/lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      // Store session data in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('loginTimestamp', Date.now().toString());
      // Clear any registrar session flags so admin gets full access
      sessionStorage.removeItem('registrarAuthenticated');
      sessionStorage.removeItem('registrarUid');
      sessionStorage.removeItem('registrarName');
      sessionStorage.removeItem('registrarPhone');
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
            <div className="flex h-20 w-20 items-center bg-gray-700 justify-center rounded-lg ">
              <Image 
            src="/logo.png" 
            alt="SolarXpert Logo"
            width={50}
            height={50}
            className="object-contain rounded-3xl w-full h-full"
          />
            </div>
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
                placeholder="Enter your email"
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

            <div className="flex items-center">
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
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer - removed */}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background lg:flex flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gray-700 mx-auto">
         <Image 
            src="/logo.png" 
            alt="SolarXpert Logo"
            width={80}
            height={100}
            className="object-contain rounded-full w-full h-full"
          />

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
