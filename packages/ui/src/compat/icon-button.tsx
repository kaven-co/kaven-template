'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        contained: 'shadow-sm',
        outlined: 'border-2 bg-transparent',
        text: '',
        soft: '',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        error: '',
        info: '',
        default: '',
      },
      size: {
        xs: 'size-7 [&_svg]:size-3.5',
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-9 [&_svg]:size-[18px]',
        lg: 'size-10 [&_svg]:size-5',
        xl: 'size-12 [&_svg]:size-6',
      },
    },
    compoundVariants: [
      { variant: 'contained', color: 'primary', className: 'bg-primary-main text-white hover:bg-primary-dark focus-visible:ring-primary-main/30' },
      { variant: 'contained', color: 'secondary', className: 'bg-secondary-main text-white hover:bg-secondary-dark focus-visible:ring-secondary-main/30' },
      { variant: 'contained', color: 'success', className: 'bg-success-main text-white hover:bg-success-dark focus-visible:ring-success-main/30' },
      { variant: 'contained', color: 'warning', className: 'bg-warning-main text-gray-900 hover:bg-warning-dark focus-visible:ring-warning-main/30' },
      { variant: 'contained', color: 'error', className: 'bg-error-main text-white hover:bg-error-dark focus-visible:ring-error-main/30' },
      { variant: 'contained', color: 'info', className: 'bg-info-main text-white hover:bg-info-dark focus-visible:ring-info-main/30' },
      { variant: 'contained', color: 'default', className: 'bg-gray-200 text-text-primary hover:bg-gray-300 focus-visible:ring-gray-300/30' },
      { variant: 'outlined', color: 'primary', className: 'border-primary-main text-primary-main hover:bg-primary-main/8 focus-visible:ring-primary-main/30' },
      { variant: 'outlined', color: 'secondary', className: 'border-secondary-main text-secondary-main hover:bg-secondary-main/8 focus-visible:ring-secondary-main/30' },
      { variant: 'outlined', color: 'success', className: 'border-success-main text-success-main hover:bg-success-main/8 focus-visible:ring-success-main/30' },
      { variant: 'outlined', color: 'warning', className: 'border-warning-main text-warning-main hover:bg-warning-main/8 focus-visible:ring-warning-main/30' },
      { variant: 'outlined', color: 'error', className: 'border-error-main text-error-main hover:bg-error-main/8 focus-visible:ring-error-main/30' },
      { variant: 'outlined', color: 'info', className: 'border-info-main text-info-main hover:bg-info-main/8 focus-visible:ring-info-main/30' },
      { variant: 'outlined', color: 'default', className: 'border-gray-300 text-text-secondary hover:bg-gray-100 focus-visible:ring-gray-300/30' },
      { variant: 'text', color: 'primary', className: 'text-primary-main hover:bg-primary-main/8 focus-visible:ring-primary-main/30' },
      { variant: 'text', color: 'secondary', className: 'text-secondary-main hover:bg-secondary-main/8 focus-visible:ring-secondary-main/30' },
      { variant: 'text', color: 'success', className: 'text-success-main hover:bg-success-main/8 focus-visible:ring-success-main/30' },
      { variant: 'text', color: 'warning', className: 'text-warning-main hover:bg-warning-main/8 focus-visible:ring-warning-main/30' },
      { variant: 'text', color: 'error', className: 'text-error-main hover:bg-error-main/8 focus-visible:ring-error-main/30' },
      { variant: 'text', color: 'info', className: 'text-info-main hover:bg-info-main/8 focus-visible:ring-info-main/30' },
      { variant: 'text', color: 'default', className: 'text-text-secondary hover:bg-gray-100 focus-visible:ring-gray-300/30' },
      { variant: 'soft', color: 'primary', className: 'bg-primary-lighter text-primary-darker hover:bg-primary-light focus-visible:ring-primary-main/30' },
      { variant: 'soft', color: 'secondary', className: 'bg-secondary-lighter text-secondary-darker hover:bg-secondary-light focus-visible:ring-secondary-main/30' },
      { variant: 'soft', color: 'success', className: 'bg-success-lighter text-success-darker hover:bg-success-light focus-visible:ring-success-main/30' },
      { variant: 'soft', color: 'warning', className: 'bg-warning-lighter text-warning-darker hover:bg-warning-light focus-visible:ring-warning-main/30' },
      { variant: 'soft', color: 'error', className: 'bg-error-lighter text-error-darker hover:bg-error-light focus-visible:ring-error-main/30' },
      { variant: 'soft', color: 'info', className: 'bg-info-lighter text-info-darker hover:bg-info-light focus-visible:ring-info-main/30' },
      { variant: 'soft', color: 'default', className: 'bg-gray-100 text-text-primary hover:bg-gray-200 focus-visible:ring-gray-300/30' },
    ],
    defaultVariants: {
      variant: 'text',
      color: 'default',
      size: 'md',
    },
  }
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, color, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-slot="icon-button"
        className={cn(iconButtonVariants({ variant, color, size, className }))}
        {...props}
      />
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
