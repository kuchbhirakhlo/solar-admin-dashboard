'use client';

import { Button } from '@/components/ui/button';
import { Shield, Wrench, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="SolarXpert Logo"
                  width={60}
                  height={60}
                  className="object-contain w-auto h-auto rounded-full"
                  loading="eager"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">SolarXpert</h1>
            <p className="text-muted-foreground mt-2">Solar Energy Management System</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground mb-6">Select your role to continue</p>
            
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full h-14 text-lg flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Shield size={24} />
              Admin Login
            </Button>

            <Button
              onClick={() => router.push('/auth/registrar-login')}
              variant="outline"
              className="w-full h-14 text-lg flex items-center justify-center gap-3 border-2 hover:bg-accent"
            >
              <UserCheck size={24} />
              Registrar Login
            </Button>

            <Button
              onClick={() => router.push('/auth/engineer-login')}
              variant="outline"
              className="w-full h-14 text-lg flex items-center justify-center gap-3 border-2 hover:bg-accent"
            >
              <Wrench size={24} />
              Engineer Login
            </Button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Partner? Use the mobile app to login
          </p>
        </div>
      </div>
    </div>
  );
}