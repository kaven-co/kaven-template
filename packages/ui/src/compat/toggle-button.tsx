'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const toggleButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        outlined: 'border border-divider bg-transparent hover:bg-gray-100',
        filled: 'bg-transparent hover:bg-gray-100',
        soft: 'bg-transparent hover:bg-gray-100',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        error: '',
        info: '',
      },
      size: {
        sm: 'h-8 px-2.5 min-w-8',
        md: 'h-9 px-3 min-w-9',
        lg: 'h-10 px-3.5 min-w-10',
      },
    },
    compoundVariants: [
      { variant: 'outlined', color: 'primary', className: 'data-[state=on]:bg-primary-main data-[state=on]:text-white data-[state=on]:border-primary-main focus-visible:ring-primary-main/30' },
      { variant: 'outlined', color: 'secondary', className: 'data-[state=on]:bg-secondary-main data-[state=on]:text-white data-[state=on]:border-secondary-main focus-visible:ring-secondary-main/30' },
      { variant: 'outlined', color: 'success', className: 'data-[state=on]:bg-success-main data-[state=on]:text-white data-[state=on]:border-success-main focus-visible:ring-success-main/30' },
      { variant: 'outlined', color: 'warning', className: 'data-[state=on]:bg-warning-main data-[state=on]:text-gray-900 data-[state=on]:border-warning-main focus-visible:ring-warning-main/30' },
      { variant: 'outlined', color: 'error', className: 'data-[state=on]:bg-error-main data-[state=on]:text-white data-[state=on]:border-error-main focus-visible:ring-error-main/30' },
      { variant: 'outlined', color: 'info', className: 'data-[state=on]:bg-info-main data-[state=on]:text-white data-[state=on]:border-info-main focus-visible:ring-info-main/30' },
      { variant: 'filled', color: 'primary', className: 'data-[state=on]:bg-primary-main data-[state=on]:text-white focus-visible:ring-primary-main/30' },
      { variant: 'filled', color: 'secondary', className: 'data-[state=on]:bg-secondary-main data-[state=on]:text-white focus-visible:ring-secondary-main/30' },
      { variant: 'filled', color: 'success', className: 'data-[state=on]:bg-success-main data-[state=on]:text-white focus-visible:ring-success-main/30' },
      { variant: 'filled', color: 'warning', className: 'data-[state=on]:bg-warning-main data-[state=on]:text-gray-900 focus-visible:ring-warning-main/30' },
      { variant: 'filled', color: 'error', className: 'data-[state=on]:bg-error-main data-[state=on]:text-white focus-visible:ring-error-main/30' },
      { variant: 'filled', color: 'info', className: 'data-[state=on]:bg-info-main data-[state=on]:text-white focus-visible:ring-info-main/30' },
      { variant: 'soft', color: 'primary', className: 'data-[state=on]:bg-primary-lighter data-[state=on]:text-primary-darker focus-visible:ring-primary-main/30' },
      { variant: 'soft', color: 'secondary', className: 'data-[state=on]:bg-secondary-lighter data-[state=on]:text-secondary-darker focus-visible:ring-secondary-main/30' },
      { variant: 'soft', color: 'success', className: 'data-[state=on]:bg-success-lighter data-[state=on]:text-success-darker focus-visible:ring-success-main/30' },
      { variant: 'soft', color: 'warning', className: 'data-[state=on]:bg-warning-lighter data-[state=on]:text-warning-darker focus-visible:ring-warning-main/30' },
      { variant: 'soft', color: 'error', className: 'data-[state=on]:bg-error-lighter data-[state=on]:text-error-darker focus-visible:ring-error-main/30' },
      { variant: 'soft', color: 'info', className: 'data-[state=on]:bg-info-lighter data-[state=on]:text-info-darker focus-visible:ring-info-main/30' },
    ],
    defaultVariants: {
      variant: 'outlined',
      color: 'primary',
      size: 'md',
    },
  }
);

export interface ToggleButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>, 'color'>,
    VariantProps<typeof toggleButtonVariants> {}

const ToggleButton = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleButtonProps
>(({ className, variant, color, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    data-slot="toggle-button"
    className={cn(toggleButtonVariants({ variant, color, size, className }))}
    {...props}
  />
));
ToggleButton.displayName = 'ToggleButton';

export interface ToggleButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  variant?: 'outlined' | 'filled' | 'soft';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const ToggleButtonGroup = React.forwardRef<HTMLDivElement, ToggleButtonGroupProps>(
  ({ className, variant = 'outlined', color = 'primary', size = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      data-slot="toggle-button-group"
      className={cn(
        'inline-flex items-center rounded-md',
        variant === 'outlined' && 'border border-divider',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<ToggleButtonProps>(child)) {
          return React.cloneElement(child, {
            variant: child.props.variant ?? variant,
            color: child.props.color ?? color,
            size: child.props.size ?? size,
            className: cn(
              'rounded-none first:rounded-l-md last:rounded-r-md',
              variant === 'outlined' && 'border-0 border-r border-divider last:border-r-0',
              child.props.className
            ),
          });
        }
        return child;
      })}
    </div>
  )
);
ToggleButtonGroup.displayName = 'ToggleButtonGroup';

export { ToggleButton, ToggleButtonGroup, toggleButtonVariants };
