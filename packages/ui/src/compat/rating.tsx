'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  precision?: 0.5 | 1;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  readOnly?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  name?: string;
}

const sizeClasses = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-7',
} as const;

const colorClasses = {
  primary: 'text-primary-main',
  secondary: 'text-secondary-main',
  success: 'text-success-main',
  warning: 'text-warning-main',
  error: 'text-error-main',
  info: 'text-info-main',
} as const;

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value = 0,
      onChange,
      max = 5,
      precision = 1,
      size = 'md',
      color = 'warning',
      readOnly = false,
      disabled = false,
      name,
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);
    const displayValue = hoverValue ?? value;

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={name ?? 'Rating'}
        data-slot="rating"
        className={cn(
          'inline-flex items-center gap-0.5',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        onMouseLeave={() => setHoverValue(null)}
        {...props}
      >
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const filled = displayValue >= starValue;
          const halfFilled = precision === 0.5 && displayValue >= starValue - 0.5 && displayValue < starValue;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled || readOnly}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => !readOnly && !disabled && setHoverValue(starValue)}
              className={cn(
                'relative transition-transform',
                !readOnly && !disabled && 'cursor-pointer hover:scale-110',
                readOnly && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  filled || halfFilled ? colorClasses[color] : 'text-gray-300',
                  filled && 'fill-current'
                )}
              />
              {halfFilled && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    colorClasses[color],
                    'fill-current absolute inset-0',
                    '[clip-path:inset(0_50%_0_0)]'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }
);
Rating.displayName = 'Rating';

export { Rating };
