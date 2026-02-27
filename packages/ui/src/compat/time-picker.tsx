'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  use24Hour?: boolean;
  minuteStep?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const inputSizeClasses = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-sm px-3',
  lg: 'h-10 text-base px-4',
} as const;

const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value = '',
      onChange,
      placeholder = 'HH:MM',
      disabled = false,
      error = false,
      helperText,
      label,
      use24Hour = true,
      className,
      size = 'md',
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div ref={ref} data-slot="time-picker" className={cn('relative w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
        )}
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-disabled pointer-events-none" />
          <input
            type="time"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-md border bg-transparent outline-none transition-colors pl-9',
              'focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-error-main focus:ring-error-main/30'
                : 'border-divider focus:border-primary-main focus:ring-primary-main/30',
              disabled && 'opacity-50 cursor-not-allowed',
              inputSizeClasses[size]
            )}
          />
        </div>
        {helperText && (
          <p className={cn('mt-1 text-xs', error ? 'text-error-main' : 'text-text-secondary')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
TimePicker.displayName = 'TimePicker';

export { TimePicker };
