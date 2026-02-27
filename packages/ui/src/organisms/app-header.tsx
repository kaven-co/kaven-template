import * as React from 'react';
import { SearchInput } from '../molecules/search-input';
import { IconButtonWithTooltip } from '../molecules/icon-button-with-tooltip';
import { BrandLogo } from '../brand/brand-logo';
import { Bell, Menu } from 'lucide-react';

export interface AppHeaderProps {
  onMenuClick?: () => void;
  onNotificationsClick?: () => void;
}

export function AppHeader({ onMenuClick, onNotificationsClick }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E5E5] bg-white px-4">
      <div className="flex items-center gap-3">
        <IconButtonWithTooltip icon={<Menu className="size-5" />} tooltip="Abrir menu" onClick={onMenuClick} />
        <BrandLogo size="sm" />
      </div>
      <div className="hidden w-full max-w-sm md:block"><SearchInput placeholder="Buscar..." /></div>
      <IconButtonWithTooltip icon={<Bell className="size-5" />} tooltip="Notificações" onClick={onNotificationsClick} />
    </header>
  );
}
