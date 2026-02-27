'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const radioVariants = cva(
  'relative inline-flex items-center justify-center shrink-0 rounded-full border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      color: {
        primary: 'border-gray-300 data-[state=checked]:border-primary-main focus-visible:ring-primary-main/30',
        secondary: 'border-gray-300 data-[state=checked]:border-secondary-main focus-visible:ring-secondary-main/30',
        success: 'border-gray-300 data-[state=checked]:border-success-main focus-visible:ring-success-main/30',
        warning: 'border-gray-300 data-[state=checked]:border-warning-main focus-visible:ring-warning-main/30',
        error: 'border-gray-300 data-[state=checked]:border-error-main focus-visible:ring-error-main/30',
        info: 'border-gray-300 data-[state=checked]:border-info-main focus-visible:ring-info-main/30',
      },
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'md',
    },
  }
);

const dotColorClasses = {
  primary: 'bg-primary-main',
  secondary: 'bg-secondary-main',
  success: 'bg-success-main',
  warning: 'bg-warning-main',
  error: 'bg-error-main',
  info: 'bg-info-main',
} as const;

const dotSizeClasses = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
} as const;

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'color' | 'size' | 'type'>,
    VariantProps<typeof radioVariants> {}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, color = 'primary', size = 'md', checked, ...props }, ref) => (
    <span
      data-slot="radio"
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(radioVariants({ color, size }), className)}
    >
      <input
        ref={ref}
        type="radio"
        checked={checked}
        className="absolute inset-0 opacity-0 cursor-pointer"
        {...props}
      />
      {checked && (
        <span
          className={cn(
            'rounded-full',
            dotColorClasses[color ?? 'primary'],
            dotSizeClasses[size ?? 'md']
          )}
        />
      )}
    </span>
  )
);
Radio.displayName = 'Radio';

export { Radio, radioVariants };
