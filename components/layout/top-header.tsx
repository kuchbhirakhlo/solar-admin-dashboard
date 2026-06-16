'use client';

import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopHeaderProps {
  onMenuClick?: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
          >
            <Menu size={20} className="text-foreground" />
          </button>

          <div className="relative hidden w-full max-w-xs md:flex">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search customers, services..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-muted">
            <Bell size={20} className="text-foreground" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Profile Dropdown */}
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
            <div className="h-8 w-8 rounded-full bg-primary/20" />
            <div className="hidden flex-col items-start lg:flex">
              <span className="text-sm font-medium text-foreground">Admin</span>
              <span className="text-xs text-muted-foreground">Manager</span>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
