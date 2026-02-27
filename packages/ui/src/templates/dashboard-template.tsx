import * as React from 'react';
import { AppHeader } from '../organisms/app-header';
import { SidebarNav, type SidebarNavItem } from '../organisms/sidebar-nav';

export interface DashboardTemplateProps {
  navItems: SidebarNavItem[];
  children: React.ReactNode;
}

export function DashboardTemplate({ navItems, children }: DashboardTemplateProps) {
  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <AppHeader />
      <div className="flex">
        <SidebarNav items={navItems} />
        <main id="main-content" className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
