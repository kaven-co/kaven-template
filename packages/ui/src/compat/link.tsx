'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const linkVariants = cva(
  'inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-sm',
  {
    variants: {
      color: {
        primary: 'text-primary-main hover:text-primary-dark focus-visible:ring-primary-main/30',
        secondary: 'text-secondary-main hover:text-secondary-dark focus-visible:ring-secondary-main/30',
        success: 'text-success-main hover:text-success-dark focus-visible:ring-success-main/30',
        warning: 'text-warning-main hover:text-warning-dark focus-visible:ring-warning-main/30',
        error: 'text-error-main hover:text-error-dark focus-visible:ring-error-main/30',
        info: 'text-info-main hover:text-info-dark focus-visible:ring-info-main/30',
        inherit: 'text-inherit hover:opacity-80',
      },
      underline: {
        always: 'underline underline-offset-4',
        hover: 'hover:underline underline-offset-4',
        none: 'no-underline',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      color: 'primary',
      underline: 'always',
      size: 'md',
    },
  }
);

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, color, underline, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        data-slot="link"
        className={cn(linkVariants({ color, underline, size, className }))}
        {...props}
      />
    );
  }
);
Link.displayName = 'Link';

export { Link, linkVariants };
