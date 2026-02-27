'use client';

import * as React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const inputSizeClasses = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-sm px-3',
  lg: 'h-10 text-base px-4',
} as const;

const selectedColorClasses = {
  primary: 'bg-primary-main text-white',
  secondary: 'bg-secondary-main text-white',
  success: 'bg-success-main text-white',
  warning: 'bg-warning-main text-gray-900',
  error: 'bg-error-main text-white',
  info: 'bg-info-main text-white',
} as const;

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d}/${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = 'MM/DD/YYYY',
      disabled = false,
      error = false,
      helperText,
      label,
      minDate,
      maxDate,
      className,
      size = 'md',
      color = 'primary',
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const today = new Date();
    const [viewYear, setViewYear] = React.useState(value?.getFullYear() ?? today.getFullYear());
    const [viewMonth, setViewMonth] = React.useState(value?.getMonth() ?? today.getMonth());
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const prevMonth = () => {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
      else setViewMonth(viewMonth - 1);
    };

    const nextMonth = () => {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
      else setViewMonth(viewMonth + 1);
    };

    const isDisabledDay = (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      return false;
    };

    const selectDay = (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      onChange?.(d);
      setOpen(false);
    };

    return (
      <div ref={ref} data-slot="date-picker" className={cn('relative w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-primary">{label}</label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className={cn(
              'w-full flex items-center gap-2 rounded-md border bg-transparent outline-none transition-colors text-left',
              'focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-error-main focus:ring-error-main/30'
                : 'border-divider focus:border-primary-main focus:ring-primary-main/30',
              disabled && 'opacity-50 cursor-not-allowed',
              inputSizeClasses[size]
            )}
          >
            <Calendar className="size-4 text-text-disabled shrink-0" />
            <span className={cn('flex-1', !value && 'text-text-disabled')}>
              {value ? formatDate(value) : placeholder}
            </span>
          </button>

          {open && (
            <div className="absolute z-50 mt-1 w-[280px] rounded-lg border border-divider bg-background-paper p-3 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold text-text-primary">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-medium text-text-disabled py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayDate = new Date(viewYear, viewMonth, day);
                  const isSelected = value && isSameDay(dayDate, value);
                  const isToday = isSameDay(dayDate, today);
                  const dayDisabled = isDisabledDay(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => selectDay(day)}
                      className={cn(
                        'h-8 w-full rounded-md text-xs font-medium transition-colors',
                        isSelected
                          ? selectedColorClasses[color]
                          : isToday
                            ? 'border border-primary-main text-primary-main'
                            : 'text-text-primary hover:bg-gray-100',
                        dayDisabled && 'opacity-30 pointer-events-none'
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between border-t border-divider pt-2">
                <button
                  type="button"
                  onClick={() => { onChange?.(null); setOpen(false); }}
                  className="text-xs text-text-secondary hover:text-text-primary"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => { onChange?.(today); setOpen(false); }}
                  className="text-xs text-primary-main hover:text-primary-dark font-medium"
                >
                  Today
                </button>
              </div>
            </div>
          )}
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
DatePicker.displayName = 'DatePicker';

export { DatePicker };
