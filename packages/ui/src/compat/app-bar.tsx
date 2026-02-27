'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const appBarVariants = cva(
  'flex items-center w-full',
  {
    variants: {
      variant: {
        filled: 'bg-background-paper shadow-sm',
        outlined: 'bg-background-paper border-b border-divider',
        transparent: 'bg-transparent',
        blur: 'bg-background-paper/80 backdrop-blur-md shadow-sm',
      },
      color: {
        default: '',
        primary: 'bg-primary-main text-white',
        secondary: 'bg-secondary-main text-white',
        transparent: 'bg-transparent',
      },
      position: {
        static: 'relative',
        sticky: 'sticky top-0 z-40',
        fixed: 'fixed top-0 left-0 right-0 z-40',
        relative: 'relative',
      },
      size: {
        sm: 'min-h-[48px] px-4',
        md: 'min-h-[64px] px-6',
        lg: 'min-h-[72px] px-8',
      },
    },
    defaultVariants: {
      variant: 'filled',
      color: 'default',
      position: 'sticky',
      size: 'md',
    },
  }
);

export interface AppBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof appBarVariants> {}

const AppBar = React.forwardRef<HTMLElement, AppBarProps>(
  ({ className, variant, color, position, size, children, ...props }, ref) => (
    <header
      ref={ref}
      data-slot="app-bar"
      className={cn(appBarVariants({ variant, color, position, size }), className)}
      {...props}
    >
      {children}
    </header>
  )
);
AppBar.displayName = 'AppBar';

export { AppBar, appBarVariants };
