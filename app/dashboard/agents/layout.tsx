'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Registrars login via the registrar portal which sets this session flag.
    // They are not allowed to access the Employee (agents) section.
    if (sessionStorage.getItem('registrarAuthenticated') === 'true') {
      router.replace('/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
