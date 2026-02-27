'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface MobileDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback to close the drawer */
  onClose: () => void;
  /** Drawer content (typically sidebar navigation) */
  children: React.ReactNode;
  /** Side the drawer slides from */
  side?: 'left' | 'right';
  /** Additional CSS classes for the drawer panel */
  className?: string;
}

/**
 * MobileDrawer — Slide-out drawer for mobile navigation.
 *
 * Renders a full-height panel that slides in from the left (default) or right,
 * with a backdrop overlay. Closes on outside click or Escape key.
 *
 * Visible only on screens smaller than `lg` breakpoint.
 *
 * @example
 * ```tsx
 * <MobileDrawer open={isOpen} onClose={() => setOpen(false)}>
 *   <SidebarContent />
 * </MobileDrawer>
 * ```
 */
export function MobileDrawer({
  open,
  onClose,
  children,
  side = 'left',
  className,
}: MobileDrawerProps) {
  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm w-full h-full cursor-default focus:outline-none"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed top-0 h-full w-[280px] bg-sidebar shadow-2xl',
          'transition-transform duration-300 ease-in-out',
          side === 'left' ? 'left-0' : 'right-0',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-4 z-10 p-1.5 rounded-full',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
            'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            side === 'left' ? 'right-4' : 'left-4'
          )}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </div>
    </div>
  );
}

MobileDrawer.displayName = 'MobileDrawer';
