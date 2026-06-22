'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sun, Search, ClipboardList, History, LogOut, Menu, X, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const engineerNavItems = [
  { name: 'Dashboard', href: '/engineer/dashboard', icon: <Sun size={20} /> },
  { name: 'Find Customer', href: '/engineer/customer-lookup', icon: <Search size={20} /> },
  { name: 'New Installation', href: '/engineer/installations/new', icon: <ClipboardList size={20} /> },
  { name: 'My Installations', href: '/engineer/installations', icon: <History size={20} /> },
];

export default function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [engineerName, setEngineerName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('engineerAuthenticated');
    const name = sessionStorage.getItem('engineerName');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setEngineerName(name || 'Engineer');
    } else {
      router.push('/auth/engineer-login');
    }
    setChecking(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    sessionStorage.removeItem('engineerAuthenticated');
    sessionStorage.removeItem('engineerUid');
    sessionStorage.removeItem('engineerName');
    sessionStorage.removeItem('engineerPhone');
    router.push('/auth/engineer-login');
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/engineer/dashboard') {
      return pathname === '/engineer/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-all duration-300 lg:relative lg:z-0',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Wrench size={24} className="text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">SolarXpert</span>
              <span className="text-xs text-muted-foreground">Engineer Portal</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 hover:bg-accent lg:hidden"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {engineerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {item.icon}
              <span className="flex-1">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium">
              {engineerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">{engineerName}</p>
              <p className="text-xs text-muted-foreground">Engineer</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 hover:bg-accent"
          >
            <Menu size={24} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Engineer Portal</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-medium">
            {engineerName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}