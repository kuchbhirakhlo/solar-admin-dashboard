"use client";

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFirebaseAuth } from '@/lib/firebase-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
