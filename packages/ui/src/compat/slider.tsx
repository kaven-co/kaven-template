'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const sliderVariants = cva('', {
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

const thumbSizeClasses = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
} as const;

const colorClasses = {
  primary: { range: 'bg-primary-main', thumb: 'border-primary-main focus-visible:ring-primary-main/30' },
  secondary: { range: 'bg-secondary-main', thumb: 'border-secondary-main focus-visible:ring-secondary-main/30' },
  success: { range: 'bg-success-main', thumb: 'border-success-main focus-visible:ring-success-main/30' },
  warning: { range: 'bg-warning-main', thumb: 'border-warning-main focus-visible:ring-warning-main/30' },
  error: { range: 'bg-error-main', thumb: 'border-error-main focus-visible:ring-error-main/30' },
  info: { range: 'bg-info-main', thumb: 'border-info-main focus-visible:ring-info-main/30' },
} as const;

export interface SliderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'color'>,
    VariantProps<typeof sliderVariants> {}

const Slider = React.forwardRef<React.ComponentRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, color = 'primary', size = 'md', ...props }, ref) => {
    const colors = colorClasses[color ?? 'primary'];
    const trackSize = trackSizeClasses[size ?? 'md'];
    const thumbSize = thumbSizeClasses[size ?? 'md'];

    return (
      <SliderPrimitive.Root
        ref={ref}
        data-slot="slider"
        data-color={color}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn('relative w-full grow overflow-hidden rounded-full bg-gray-200', trackSize)}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn('absolute h-full', colors.range)}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className={cn(
            'block rounded-full border-2 bg-white shadow-md transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            thumbSize,
            colors.thumb
          )}
        />
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
