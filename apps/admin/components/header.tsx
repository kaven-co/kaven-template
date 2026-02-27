'use client';

import { Search, Command } from 'lucide-react';
import { MobileMenuToggle } from '@kaven/ui-base';
import { useUIStore } from '@/stores/ui.store';
import { TenantSwitcher } from '@/components/layout/tenant-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import { cn } from '@/lib/utils';


export function Header() {
  const { sidebarOpen, toggleSidebar } = useUIStore();


  return (
    <header
        className={cn(
            "sticky top-0 z-30 flex h-[72px] items-center justify-between px-4 md:px-6 transition-colors duration-300",
            "bg-[var(--surface-base)] border-b border-[var(--surface-border)]"
        )}
    >
      <div className="flex items-center gap-4">
        {/* Stylized Hamburger */}
        <MobileMenuToggle isOpen={sidebarOpen} onClick={toggleSidebar} />
        
        {/* Tenant Switcher */}
        <TenantSwitcher />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline-flex text-xs font-bold border border-border rounded px-1.5 py-0.5 items-center gap-1 text-muted-foreground">
                <Command className="w-3 h-3" /> K
            </span>
        </button>



        {/* Notifications */}
        <NotificationDropdown />



        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
