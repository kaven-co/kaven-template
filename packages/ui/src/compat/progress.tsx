'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const progressVariants = cva('', {
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
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'md',
  },
});

const trackSizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
} as const;

const indicatorColorClasses = {
  primary: 'bg-primary-main',
  secondary: 'bg-secondary-main',
  success: 'bg-success-main',
  warning: 'bg-warning-main',
  error: 'bg-error-main',
  info: 'bg-info-main',
} as const;

export interface ProgressProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, 'color'>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<React.ComponentRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, color = 'primary', size = 'md', ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      data-color={color}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-gray-200',
        trackSizeClasses[size ?? 'md'],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all duration-300',
          indicatorColorClasses[color ?? 'primary']
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = 'Progress';

export { Progress };
