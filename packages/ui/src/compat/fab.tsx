'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const fabVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium shadow-lg transition-all cursor-pointer hover:shadow-xl active:shadow-md disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        circular: '',
        extended: 'gap-2',
      },
      color: {
        primary: 'bg-primary-main text-white hover:bg-primary-dark focus-visible:ring-primary-main/30',
        secondary: 'bg-secondary-main text-white hover:bg-secondary-dark focus-visible:ring-secondary-main/30',
        success: 'bg-success-main text-white hover:bg-success-dark focus-visible:ring-success-main/30',
        warning: 'bg-warning-main text-gray-900 hover:bg-warning-dark focus-visible:ring-warning-main/30',
        error: 'bg-error-main text-white hover:bg-error-dark focus-visible:ring-error-main/30',
        info: 'bg-info-main text-white hover:bg-info-dark focus-visible:ring-info-main/30',
        default: 'bg-gray-100 text-text-primary hover:bg-gray-200 focus-visible:ring-gray-300/30',
      },
      size: {
        sm: 'size-10 [&_svg]:size-5',
        md: 'size-14 [&_svg]:size-6',
        lg: 'size-16 [&_svg]:size-7',
      },
    },
    compoundVariants: [
      { variant: 'extended', size: 'sm', className: 'h-10 w-auto px-4 text-xs' },
      { variant: 'extended', size: 'md', className: 'h-14 w-auto px-6 text-sm' },
      { variant: 'extended', size: 'lg', className: 'h-16 w-auto px-8 text-base' },
    ],
    defaultVariants: {
      variant: 'circular',
      color: 'primary',
      size: 'md',
    },
  }
);

export interface FabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof fabVariants> {
  asChild?: boolean;
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, color, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-slot="fab"
        className={cn(fabVariants({ variant, color, size, className }))}
        {...props}
      />
    );
  }
);
Fab.displayName = 'Fab';

const FAB = Fab;

export { Fab, FAB, fabVariants };
