'use client';

/**
 * Shadcn/UI Component Adapters
 *
 * Wraps 6 core Kaven components with Shadcn/UI design language:
 * Button, Input, Select, Dialog, Table, Card
 *
 * These components use the same API as @kaven/ui-base components but
 * apply Shadcn-specific styling (minimal borders, zinc palette,
 * Inter font, subtle shadows). The design tokens (colors, typography,
 * spacing) are injected by the DesignSystemProvider when SHADCN
 * adapter is active.
 *
 * Reference: https://ui.shadcn.com/
 */

import * as React from 'react';
import { cn } from '@/lib/design-system/adapters/shadcn/utils';

// ============================================
// SHADCN BUTTON
// ============================================

export interface ShadcnButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
}

export const ShadcnButton = React.forwardRef<HTMLButtonElement, ShadcnButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 rounded-md px-3 text-xs gap-1.5',
      default: 'h-9 px-4 py-2 rounded-md text-sm',
      lg: 'h-10 rounded-md px-6 text-sm',
      icon: 'size-9 rounded-md',
    };

    const variantClasses = {
      default: [
        'bg-[var(--color-primary,#18181b)] text-[var(--color-text-inverse,#fafafa)]',
        'shadow-sm',
        'hover:bg-[var(--color-primary,#18181b)]/90',
      ].join(' '),
      destructive: [
        'bg-[var(--color-error,#ef4444)] text-[var(--color-text-inverse,#fafafa)]',
        'shadow-sm',
        'hover:bg-[var(--color-error,#ef4444)]/90',
        'focus-visible:ring-[var(--color-error,#ef4444)]/20',
      ].join(' '),
      outline: [
        'border border-[var(--color-border-default,#e4e4e7)]',
        'bg-transparent',
        'text-[var(--color-text-primary,#09090b)]',
        'shadow-sm',
        'hover:bg-[var(--color-bg-neutral,#f4f4f5)]',
        'hover:text-[var(--color-text-primary,#09090b)]',
      ].join(' '),
      secondary: [
        'bg-[var(--color-secondary,#f1f5f9)]',
        'text-[var(--color-text-primary,#09090b)]',
        'shadow-sm',
        'hover:bg-[var(--color-secondary,#f1f5f9)]/80',
      ].join(' '),
      ghost: [
        'bg-transparent',
        'text-[var(--color-text-primary,#09090b)]',
        'hover:bg-[var(--color-bg-neutral,#f4f4f5)]',
        'hover:text-[var(--color-text-primary,#09090b)]',
      ].join(' '),
      link: [
        'bg-transparent',
        'text-[var(--color-primary,#18181b)]',
        'underline-offset-4 hover:underline',
      ].join(' '),
    };

    return (
      <button
        ref={ref}
        data-slot="shadcn-button"
        data-variant={variant}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap',
          'font-medium',
          'transition-colors duration-200',
          'outline-none cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#18181b)]/20 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          "font-[var(--font-family,'Inter',sans-serif)]",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31 31" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
ShadcnButton.displayName = 'ShadcnButton';

// ============================================
// SHADCN INPUT
// ============================================

export interface ShadcnInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'default' | 'lg';
  label?: string;
  error?: boolean;
  errorMessage?: string;
  description?: string;
}

export const ShadcnInput = React.forwardRef<HTMLInputElement, ShadcnInputProps>(
  (
    {
      className,
      size = 'default',
      label,
      error = false,
      errorMessage,
      description,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      default: 'h-9 px-3 text-sm',
      lg: 'h-10 px-4 text-sm',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text-primary,#09090b)]">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-[var(--color-text-secondary,#71717a)]">{description}</p>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-md',
            'border border-[var(--color-border-default,#e4e4e7)]',
            'bg-transparent',
            'text-[var(--color-text-primary,#09090b)]',
            'placeholder:text-[var(--color-text-disabled,#a1a1aa)]',
            'shadow-sm',
            'transition-colors duration-200',
            'outline-none',
            'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#18181b)]/20',
            'focus-visible:border-[var(--color-primary,#18181b)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            sizeClasses[size],
            error && 'border-[var(--color-error,#ef4444)] focus-visible:ring-[var(--color-error,#ef4444)]/20',
            className
          )}
          {...props}
        />
        {errorMessage && (
          <p className="text-xs text-[var(--color-error,#ef4444)]">{errorMessage}</p>
        )}
      </div>
    );
  }
);
ShadcnInput.displayName = 'ShadcnInput';

// ============================================
// SHADCN SELECT
// ============================================

export interface ShadcnSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ShadcnSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: ShadcnSelectOption[];
  placeholder?: string;
  label?: string;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function ShadcnSelect({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  size = 'default',
  disabled = false,
  error = false,
  errorMessage,
  className,
  ...props
}: ShadcnSelectProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  const currentValue = value ?? internalValue;
  const selectedOption = options.find((o) => o.value === currentValue);

  const handleSelect = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
  };

  return (
    <div className={cn('relative', className)} ref={selectRef} {...props}>
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-primary,#09090b)]">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`shadcn-select-listbox-${label || 'default'}`}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        className={cn(
          'flex items-center justify-between w-full rounded-md',
          'border border-[var(--color-border-default,#e4e4e7)]',
          'bg-transparent',
          'text-[var(--color-text-primary,#09090b)]',
          'shadow-sm',
          'transition-colors duration-200 cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#18181b)]/20',
          sizeClasses[size],
          error && 'border-[var(--color-error,#ef4444)]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={cn(!selectedOption && 'text-[var(--color-text-disabled,#a1a1aa)]')}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={cn('size-4 opacity-50 transition-transform', isOpen && 'rotate-180')}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-1 py-1',
            'bg-[var(--color-bg-default,#ffffff)]',
            'border border-[var(--color-border-default,#e4e4e7)]',
            'rounded-md',
            'shadow-md',
            'max-h-60 overflow-auto',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
        >
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === currentValue}
              onClick={() => !option.disabled && handleSelect(option.value)}
              className={cn(
                'relative flex items-center px-2 py-1.5 cursor-pointer',
                'text-sm text-[var(--color-text-primary,#09090b)]',
                'transition-colors',
                'rounded-sm mx-1',
                'hover:bg-[var(--color-bg-neutral,#f4f4f5)]',
                option.value === currentValue && 'bg-[var(--color-bg-neutral,#f4f4f5)]',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="flex-1">{option.label}</span>
              {option.value === currentValue && (
                <svg className="size-4 text-[var(--color-text-primary,#09090b)]" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs mt-1.5 text-[var(--color-error,#ef4444)]">{errorMessage}</p>
      )}
    </div>
  );
}
ShadcnSelect.displayName = 'ShadcnSelect';

// ============================================
// SHADCN DIALOG
// ============================================

export interface ShadcnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

export function ShadcnDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'default',
}: ShadcnDialogProps) {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-4rem)]',
  };

  return (
    <>
      {/* Shadcn overlay: heavier opacity than Fluent */}
      <div
        className={cn(
          'fixed inset-0 z-50',
          'bg-black/80',
          'animate-in fade-in-0 duration-200'
        )}
        onClick={() => onOpenChange(false)}
      />
      {/* Shadcn dialog content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100%-2rem)]',
          sizeClasses[size],
          'grid gap-4 p-6',
          'bg-[var(--color-bg-default,#ffffff)]',
          'border border-[var(--color-border-default,#e4e4e7)]',
          'rounded-lg', // Shadcn uses 0.5rem
          'shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            {title && (
              <h2 className="text-lg leading-none font-semibold tracking-tight text-[var(--color-text-primary,#09090b)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-[var(--color-text-secondary,#71717a)]">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="text-sm text-[var(--color-text-primary,#09090b)]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            'absolute top-4 right-4',
            'size-4 rounded-sm',
            'opacity-70 hover:opacity-100',
            'transition-opacity',
            'text-[var(--color-text-secondary,#71717a)]',
            'focus:ring-2 focus:ring-[var(--color-primary,#18181b)]/20 focus:ring-offset-2 focus:outline-none'
          )}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}
ShadcnDialog.displayName = 'ShadcnDialog';

// ============================================
// SHADCN TABLE
// ============================================

export function ShadcnTable({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="shadcn-table-container" className="relative w-full overflow-auto">
      <table
        data-slot="shadcn-table"
        className={cn(
          'w-full caption-bottom text-sm',
          "font-[var(--font-family,'Inter',sans-serif)]",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function ShadcnTableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="shadcn-table-header"
      className={cn('[&_tr]:border-b', className)}
      {...props}
    />
  );
}

export function ShadcnTableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="shadcn-table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function ShadcnTableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="shadcn-table-row"
      className={cn(
        'border-b border-[var(--color-border-default,#e4e4e7)]',
        'transition-colors',
        'hover:bg-[var(--color-bg-neutral,#f4f4f5)]/50',
        'data-[state=selected]:bg-[var(--color-bg-neutral,#f4f4f5)]',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="shadcn-table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium',
        'text-[var(--color-text-secondary,#71717a)]',
        'whitespace-nowrap',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="shadcn-table-cell"
      className={cn(
        'p-2 align-middle whitespace-nowrap',
        'text-[var(--color-text-primary,#09090b)]',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnTableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="shadcn-table-caption"
      className={cn(
        'mt-4 text-sm text-[var(--color-text-secondary,#71717a)]',
        className
      )}
      {...props}
    />
  );
}

// ============================================
// SHADCN CARD
// ============================================

export type ShadcnCardProps = React.HTMLAttributes<HTMLDivElement>;

export function ShadcnCard({ className, ...props }: ShadcnCardProps) {
  return (
    <div
      data-slot="shadcn-card"
      className={cn(
        'rounded-lg', // Shadcn default 0.5rem
        'border border-[var(--color-border-default,#e4e4e7)]',
        'bg-[var(--color-bg-default,#ffffff)]',
        'text-[var(--color-text-primary,#09090b)]',
        'shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="shadcn-card-header"
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  );
}

export function ShadcnCardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="shadcn-card-title"
      className={cn(
        'font-semibold leading-none tracking-tight',
        'text-[var(--color-text-primary,#09090b)]',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="shadcn-card-description"
      className={cn(
        'text-sm text-[var(--color-text-secondary,#71717a)]',
        className
      )}
      {...props}
    />
  );
}

export function ShadcnCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="shadcn-card-content"
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  );
}

export function ShadcnCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="shadcn-card-footer"
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}

ShadcnCard.displayName = 'ShadcnCard';
