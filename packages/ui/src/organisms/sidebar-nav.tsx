import * as React from 'react';
import { Button } from '../atoms/button';

export interface SidebarNavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <aside className="w-64 border-r border-[#E5E5E5] bg-white p-3">
      <nav className="space-y-2">
        {items.map((item) => (
          <Button
            asChild
            key={item.href}
            variant={item.active ? 'contained' : 'ghost'}
            color={item.active ? 'primary' : 'inherit'}
            size="md"
            fullWidth
            className="justify-start"
          >
            <a href={item.href}>{item.label}</a>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
