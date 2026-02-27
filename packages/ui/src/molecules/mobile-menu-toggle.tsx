'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface MobileMenuToggleProps {
  /** Whether the mobile menu is currently open */
  isOpen?: boolean;
  /** Callback when the toggle is clicked */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for the button */
  'aria-label'?: string;
}

/**
 * MobileMenuToggle — Hamburger button for mobile navigation.
 *
 * Visible only on screens smaller than `lg` breakpoint (< 1024px).
 * Renders a three-line hamburger icon that morphs into an X when `isOpen` is true.
 *
 * @example
 * ```tsx
 * <MobileMenuToggle isOpen={sidebarOpen} onClick={toggleSidebar} />
 * ```
 */
export function MobileMenuToggle({
  isOpen = false,
  onClick,
  className,
  'aria-label': ariaLabel,
}: MobileMenuToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'lg:hidden inline-flex items-center justify-center p-2 rounded-lg',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      aria-label={ariaLabel ?? (isOpen ? 'Close menu' : 'Open menu')}
      aria-expanded={isOpen}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Top line */}
        <path
          d={isOpen ? 'M6 6L18 18' : 'M5 7H19'}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-200"
        />
        {/* Middle line — hidden when open */}
        <path
          d="M5 12H19"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={cn(
            'transition-opacity duration-200',
            isOpen ? 'opacity-0' : 'opacity-100'
          )}
        />
        {/* Bottom line */}
        <path
          d={isOpen ? 'M6 18L18 6' : 'M5 17H19'}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-200"
        />
      </svg>
    </button>
  );
}

MobileMenuToggle.displayName = 'MobileMenuToggle';
