'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const navbarVariants = cva(
  'flex items-center w-full',
  {
    variants: {
      variant: {
        filled: 'bg-background-paper shadow-sm',
        transparent: 'bg-transparent',
        blur: 'bg-background-paper/80 backdrop-blur-md',
      },
      position: {
        static: 'relative',
        sticky: 'sticky top-0 z-40',
        fixed: 'fixed top-0 left-0 right-0 z-40',
      },
      size: {
        sm: 'h-14 px-4',
        md: 'h-16 px-6',
        lg: 'h-20 px-8',
      },
    },
    defaultVariants: {
      variant: 'filled',
      position: 'sticky',
      size: 'md',
    },
  }
);

export interface NavbarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {}

const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  ({ className, variant, position, size, children, ...props }, ref) => (
    <nav
      ref={ref}
      data-slot="navbar"
      className={cn(navbarVariants({ variant, position, size }), className)}
      {...props}
    >
      {children}
    </nav>
  )
);
Navbar.displayName = 'Navbar';

export { Navbar, navbarVariants };
