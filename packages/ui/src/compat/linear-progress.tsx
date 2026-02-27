'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const linearProgressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        error: '',
        info: '',
      },
      size: {
        sm: 'h-1',
        md: 'h-1.5',
        lg: 'h-2',
      },
      variant: {
        determinate: '',
        indeterminate: '',
        buffer: '',
      },
    },
    defaultVariants: {
      color: 'primary',
      size: 'md',
      variant: 'determinate',
    },
  }
);

const barColorClasses = {
  primary: 'bg-primary-main',
  secondary: 'bg-secondary-main',
  success: 'bg-success-main',
  warning: 'bg-warning-main',
  error: 'bg-error-main',
  info: 'bg-info-main',
} as const;

export interface LinearProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof linearProgressVariants> {
  value?: number;
  valueBuffer?: number;
}

const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    { className, color = 'primary', size, variant = 'determinate', value = 0, valueBuffer = 0, ...props },
    ref
  ) => {
    const barColor = barColorClasses[color ?? 'primary'];

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={variant === 'determinate' ? value : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        data-slot="linear-progress"
        data-variant={variant}
        className={cn(linearProgressVariants({ color, size, variant }), className)}
        {...props}
      >
        {variant === 'buffer' && (
          <div
            className={cn('absolute h-full opacity-30', barColor)}
            style={{ width: `${Math.min(valueBuffer, 100)}%` }}
          />
        )}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            barColor,
            variant === 'indeterminate' && 'animate-[indeterminate_1.5s_ease-in-out_infinite] w-1/3'
          )}
          style={variant !== 'indeterminate' ? { width: `${Math.min(value, 100)}%` } : undefined}
        />
      </div>
    );
  }
);
LinearProgress.displayName = 'LinearProgress';

export { LinearProgress, linearProgressVariants };
