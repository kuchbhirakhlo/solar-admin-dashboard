'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import Image from 'next/image';

export default function RegistrarLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in directly with email + password (no pre-auth Firestore query)
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Verify this user is actually a registrar
      const userSnap = await getDoc(doc(db, 'users', result.user.uid));
      if (!userSnap.exists() || userSnap.data()?.role !== 'registrar') {
        await import('firebase/auth').then(({ signOut: so }) => so(auth));
        throw new Error('This account does not have registrar access');
      }

      const userData = userSnap.data()!;

      // Store session
      sessionStorage.setItem('registrarAuthenticated', 'true');
      sessionStorage.setItem('registrarUid', result.user.uid);
      sessionStorage.setItem('registrarName', userData.name || '');
      sessionStorage.setItem('registrarPhone', userData.phone || '');

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
                loading="eager"
              />
            </div>
          </div>

          {/* Heading */}
          <h2 className="mb-2 text-3xl font-bold text-foreground">Registrar Portal</h2>
          <p className="mb-8 text-muted-foreground">
            Sign in with your email address and password
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
                Email Address
              </label>
              <Input
                type="email"
                placeholder="name@solarexpert.com"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer */}

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
              loading="eager"
            />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Registrar Workspace
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Manage customer registrations and new connections
          </p>
          <ul className="space-y-4 text-left">
            {[
              'Register new customers',
              'Manage subscription plans',
              'Track installation requests',
              'Handle customer inquiries',
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