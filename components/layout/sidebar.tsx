'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Zap,
  Briefcase,
  X,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useFirebaseAuth } from '@/lib/firebase-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Customers', href: '/dashboard/customers', icon: <Users size={20} /> },
  { name: 'Employee', href: '/dashboard/agents', icon: <UserCheck size={20} /> },
  {
    name: 'Subscriptions',
    href: '/dashboard/subscriptions',
    icon: <Zap size={20} />,
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: <Briefcase size={20} />,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isRegistrar, setIsRegistrar] = useState(false);
  const { user } = useFirebaseAuth();

  useEffect(() => {
    // Registrars login via the registrar portal which sets this session flag.
    // They should not see the Employee (agents) section.
    setIsRegistrar(sessionStorage.getItem('registrarAuthenticated') === 'true');
  }, []);

  const visibleNavItems = navItems.filter(
    (item) => !(isRegistrar && item.href === '/dashboard/agents')
  );

  const isActive = (href: string) => {
    // For the root dashboard, only match exact path to avoid highlighting
    // Dashboard when on sub-pages like /dashboard/customers
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:relative lg:z-0',
          !isOpen && '-translate-x-full lg:translate-x-0',
          collapsed && 'lg:w-20'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-center border-b border-sidebar-border px-4 py-6">
          <div className="flex justify-center items-center gap-2">
             <div className="flex h-20 w-20 items-center justify-center bg-gray-700 rounded-full">
               <Image src="/logo.png" alt="Logo" width={100} height={30} />
             </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-sidebar-accent lg:hidden"
          >
            <X size={20} className="text-sidebar-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2',
              collapsed ? 'justify-center' : ''
            )}
          >
          </div>
          <button
            onClick={() => signOut(auth)}
            className={cn(
              'mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-red-500/10 hover:text-red-500',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
