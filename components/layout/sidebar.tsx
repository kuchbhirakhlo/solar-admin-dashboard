'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Wrench,
  Zap,
  Briefcase,
  BarChart3,
  Settings,
  Bell,
  CreditCard,
  ChevronDown,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Customers', href: '/dashboard/customers', icon: <Users size={20} /> },
  { name: 'Agents', href: '/dashboard/agents', icon: <UserCheck size={20} /> },
  {
    name: 'Engineers',
    href: '/dashboard/engineers',
    icon: <Wrench size={20} />,
  },
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
  {
    name: 'Installations',
    href: '/dashboard/installations',
    icon: <BarChart3 size={20} />,
  },
  {
    name: 'Payments',
    href: '/dashboard/payments',
    icon: <CreditCard size={20} />,
  },
  { name: 'Reports', href: '/dashboard/reports', icon: <BarChart3 size={20} /> },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: <Bell size={20} />,
    badge: '3',
  },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
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
        <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Sun size={24} className="text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-foreground">
                  SolarFlow
                </span>
                <span className="text-xs text-sidebar-foreground/60">Admin</span>
              </div>
            )}
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
          {navItems.map((item) => (
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
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
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
            <div className="h-8 w-8 rounded-full bg-sidebar-accent/30" />
            {!collapsed && (
              <div className="flex-1 text-sm">
                <p className="font-medium text-sidebar-foreground">Admin User</p>
                <p className="text-xs text-sidebar-foreground/60">admin@solar.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
