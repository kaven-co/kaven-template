'use client';

/**
 * Fluent UI Component Adapters
 *
 * Wraps 6 core Kaven components with Fluent UI 2 design language:
 * Button, Input, Select, Dialog, Table, Card
 *
 * These components use the same API as @kaven/ui-base components but
 * apply Fluent-specific styling via CSS class overrides. The
 * design tokens (colors, typography, spacing) are injected by
 * the DesignSystemProvider when FLUENT adapter is active.
 *
 * Reference: https://fluent2.microsoft.design/
 */

import * as React from 'react';
import { cn } from '@/lib/design-system/adapters/fluent/utils';

// ============================================
// FLUENT BUTTON
// ============================================

export interface FluentButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'transparent';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'before' | 'after';
  loading?: boolean;
  fullWidth?: boolean;
}

export const FluentButton = React.forwardRef<HTMLButtonElement, FluentButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'medium',
      icon,
      iconPosition = 'before',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'h-6 px-2 text-xs gap-1 rounded-[2px]',
      medium: 'h-8 px-3 text-sm gap-1.5 rounded-[4px]',
      large: 'h-10 px-4 text-base gap-2 rounded-[6px]',
    };

    const variantClasses = {
      primary: [
        'bg-[var(--color-primary,#0f6cbd)] text-[var(--color-text-inverse,#ffffff)]',
        'hover:bg-[var(--color-primaryDark,#0e4775)]',
        'active:bg-[var(--color-primaryDarker,#092c47)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#0f6cbd)]/40',
      ].join(' '),
      secondary: [
        'bg-[var(--color-secondary,#f0f0f0)] text-[var(--color-text-primary,#242424)]',
        'hover:bg-[var(--color-secondaryDark,#e0e0e0)]',
        'active:bg-[var(--color-secondaryDarker,#d1d1d1)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-text-primary,#242424)]/20',
      ].join(' '),
      outline: [
        'border border-[var(--color-border-default,#e0e0e0)] bg-transparent',
        'text-[var(--color-text-primary,#242424)]',
        'hover:bg-[var(--color-bg-neutral,#f5f5f5)]',
        'active:bg-[var(--color-secondary,#f0f0f0)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#0f6cbd)]/40',
      ].join(' '),
      subtle: [
        'bg-transparent text-[var(--color-text-primary,#242424)]',
        'hover:bg-[var(--color-bg-neutral,#f5f5f5)]',
        'active:bg-[var(--color-secondary,#f0f0f0)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#0f6cbd)]/40',
      ].join(' '),
      transparent: [
        'bg-transparent text-[var(--color-primary,#0f6cbd)]',
        'hover:text-[var(--color-primaryDark,#0e4775)]',
        'active:text-[var(--color-primaryDarker,#092c47)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#0f6cbd)]/40',
      ].join(' '),
    };

    return (
      <button
        ref={ref}
        data-slot="fluent-button"
        data-variant={variant}
        data-size={size}
        className={cn(
          // Fluent base: Segoe UI font, snappy transitions, no border-radius by default
          'inline-flex items-center justify-center whitespace-nowrap font-semibold',
          'transition-all duration-[100ms] ease-[cubic-bezier(0.33,0,0.67,1)]',
          'outline-none cursor-pointer',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          "font-[var(--font-family,'Segoe_UI_Variable',sans-serif)]",
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin size-4"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="22 22" />
          </svg>
        )}
        {!loading && icon && iconPosition === 'before' && <span className="shrink-0">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'after' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);
FluentButton.displayName = 'FluentButton';

// ============================================
// FLUENT INPUT
// ============================================

export interface FluentInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'small' | 'medium' | 'large';
  appearance?: 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
  label?: string;
  validationState?: 'none' | 'success' | 'warning' | 'error';
  validationMessage?: string;
  contentBefore?: React.ReactNode;
  contentAfter?: React.ReactNode;
}

export const FluentInput = React.forwardRef<HTMLInputElement, FluentInputProps>(
  (
    {
      className,
      size = 'medium',
      appearance = 'outline',
      label,
      validationState = 'none',
      validationMessage,
      contentBefore,
      contentAfter,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      small: 'h-6 text-xs',
      medium: 'h-8 text-sm',
      large: 'h-10 text-base',
    };

    const appearanceClasses = {
      outline: [
        'border border-[var(--color-border-default,#e0e0e0)]',
        'bg-[var(--color-bg-default,#ffffff)]',
        'hover:border-[var(--color-border-strong,#616161)]',
        'focus-within:border-b-2 focus-within:border-b-[var(--color-primary,#0f6cbd)]',
      ].join(' '),
      underline: [
        'border-0 border-b border-b-[var(--color-border-default,#e0e0e0)]',
        'bg-transparent rounded-none',
        'hover:border-b-[var(--color-border-strong,#616161)]',
        'focus-within:border-b-2 focus-within:border-b-[var(--color-primary,#0f6cbd)]',
      ].join(' '),
      'filled-darker': [
        'border-0 border-b border-b-[var(--color-border-default,#e0e0e0)]',
        'bg-[var(--color-bg-neutral,#f5f5f5)]',
        'hover:border-b-[var(--color-border-strong,#616161)]',
        'focus-within:border-b-2 focus-within:border-b-[var(--color-primary,#0f6cbd)]',
      ].join(' '),
      'filled-lighter': [
        'border-0 border-b border-b-[var(--color-border-subtle,#f0f0f0)]',
        'bg-[var(--color-bg-default,#ffffff)]',
        'hover:border-b-[var(--color-border-default,#e0e0e0)]',
        'focus-within:border-b-2 focus-within:border-b-[var(--color-primary,#0f6cbd)]',
      ].join(' '),
    };

    const validationBorders = {
      none: '',
      success: 'border-b-[var(--color-success,#0e7a0d)]',
      warning: 'border-b-[var(--color-warning,#bc4b09)]',
      error: 'border-b-[var(--color-error,#b10e1c)]',
    };

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-[var(--color-text-primary,#242424)]">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2 rounded-[4px]',
            'transition-all duration-[100ms]',
            sizeClasses[size],
            appearanceClasses[appearance],
            validationState !== 'none' && validationBorders[validationState],
            className
          )}
        >
          {contentBefore && <span className="shrink-0 text-[var(--color-text-secondary,#616161)]">{contentBefore}</span>}
          <input
            ref={ref}
            className={cn(
              'flex-1 bg-transparent outline-none',
              'text-[var(--color-text-primary,#242424)]',
              'placeholder:text-[var(--color-text-disabled,#bdbdbd)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
          {contentAfter && <span className="shrink-0 text-[var(--color-text-secondary,#616161)]">{contentAfter}</span>}
        </div>
        {validationMessage && (
          <span
            className={cn(
              'text-xs',
              validationState === 'error' && 'text-[var(--color-error,#b10e1c)]',
              validationState === 'warning' && 'text-[var(--color-warning,#bc4b09)]',
              validationState === 'success' && 'text-[var(--color-success,#0e7a0d)]',
              validationState === 'none' && 'text-[var(--color-text-secondary,#616161)]'
            )}
          >
            {validationMessage}
          </span>
        )}
      </div>
    );
  }
);
FluentInput.displayName = 'FluentInput';

// ============================================
// FLUENT SELECT (Dropdown)
// ============================================

export interface FluentSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FluentSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: FluentSelectOption[];
  placeholder?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  appearance?: 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function FluentSelect({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  size = 'medium',
  appearance: _appearance = 'outline',
  disabled = false,
  error = false,
  errorMessage,
  className,
  ...props
}: FluentSelectProps) {
  void _appearance; // Reserved for future appearance variants
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
    small: 'h-6 text-xs px-2',
    medium: 'h-8 text-sm px-3',
    large: 'h-10 text-base px-4',
  };

  return (
    <div className={cn('relative', className)} ref={selectRef} {...props}>
      {label && (
        <label className="block text-sm font-semibold mb-1 text-[var(--color-text-primary,#242424)]">
          {label}
        </label>
      )}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`fluent-select-listbox-${label || 'default'}`}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        className={cn(
          'flex items-center justify-between w-full rounded-[4px]',
          'border border-[var(--color-border-default,#e0e0e0)]',
          'bg-[var(--color-bg-default,#ffffff)]',
          'text-[var(--color-text-primary,#242424)]',
          'transition-all duration-[100ms] cursor-pointer',
          'hover:border-[var(--color-border-strong,#616161)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#0f6cbd)]/40',
          sizeClasses[size],
          error && 'border-[var(--color-error,#b10e1c)]',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-[var(--color-primary,#0f6cbd)]'
        )}
      >
        <span className={cn(!selectedOption && 'text-[var(--color-text-disabled,#bdbdbd)]')}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={cn('size-3 transition-transform text-[var(--color-text-secondary,#616161)]', isOpen && 'rotate-180')}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-full mt-1 py-1',
            'bg-[var(--color-bg-default,#ffffff)]',
            'border border-[var(--color-border-default,#e0e0e0)]',
            'rounded-[4px]',
            'shadow-[0px_4px_8px_rgba(0,0,0,0.14),0px_0px_2px_rgba(0,0,0,0.12)]', // Fluent shadow8
            'max-h-60 overflow-auto'
          )}
        >
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === currentValue}
              onClick={() => !option.disabled && handleSelect(option.value)}
              className={cn(
                'flex items-center px-3 py-1.5 cursor-pointer',
                'text-sm text-[var(--color-text-primary,#242424)]',
                'transition-colors duration-[50ms]',
                'hover:bg-[var(--color-bg-neutral,#f5f5f5)]',
                option.value === currentValue && 'bg-[var(--color-bg-neutral,#f5f5f5)] font-semibold',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.value === currentValue && (
                <svg className="size-4 mr-2 text-[var(--color-primary,#0f6cbd)]" viewBox="0 0 16 16" fill="none">
                  <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p className="text-xs mt-1 text-[var(--color-error,#b10e1c)]">{errorMessage}</p>
      )}
    </div>
  );
}
FluentSelect.displayName = 'FluentSelect';

// ============================================
// FLUENT DIALOG
// ============================================

export interface FluentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function FluentDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  actions,
  size = 'medium',
}: FluentDialogProps) {
  if (!open) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
  };

  return (
    <>
      {/* Fluent overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      {/* Fluent dialog surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100%-2rem)]',
          sizeClasses[size],
          'bg-[var(--color-bg-default,#ffffff)]',
          'rounded-[8px]', // Fluent borderRadiusXLarge
          'shadow-[0px_14px_28px_rgba(0,0,0,0.24),0px_0px_8px_rgba(0,0,0,0.12)]', // shadow28
          'p-6',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h2 className="text-xl font-semibold text-[var(--color-text-primary,#242424)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary,#616161)]">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="text-sm text-[var(--color-text-primary,#242424)]">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex justify-end gap-2 mt-6">{actions}</div>
        )}

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className={cn(
            'absolute top-4 right-4',
            'size-8 rounded-[4px] inline-flex items-center justify-center',
            'text-[var(--color-text-secondary,#616161)]',
            'hover:bg-[var(--color-bg-neutral,#f5f5f5)]',
            'transition-colors duration-[100ms]'
          )}
        >
          <svg className="size-4" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
}
FluentDialog.displayName = 'FluentDialog';

// ============================================
// FLUENT TABLE
// ============================================

export function FluentTable({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="fluent-table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="fluent-table"
        className={cn(
          'w-full caption-bottom text-sm',
          "font-[var(--font-family,'Segoe_UI_Variable',sans-serif)]",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function FluentTableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="fluent-table-header"
      className={cn(
        'border-b border-[var(--color-border-default,#e0e0e0)]',
        'bg-transparent',
        className
      )}
      {...props}
    />
  );
}

export function FluentTableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="fluent-table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

export function FluentTableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="fluent-table-row"
      className={cn(
        'border-b border-[var(--color-border-subtle,#f0f0f0)]',
        'transition-colors duration-[50ms]',
        'hover:bg-[var(--color-bg-neutral,#f5f5f5)]',
        'data-[state=selected]:bg-[var(--color-secondary,#f0f0f0)]',
        className
      )}
      {...props}
    />
  );
}

export function FluentTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="fluent-table-head"
      className={cn(
        'h-10 px-3 text-left align-middle font-semibold',
        'text-[var(--color-text-primary,#242424)] text-xs uppercase tracking-wide',
        'whitespace-nowrap',
        className
      )}
      {...props}
    />
  );
}

export function FluentTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="fluent-table-cell"
      className={cn(
        'px-3 py-2 align-middle whitespace-nowrap',
        'text-[var(--color-text-primary,#242424)]',
        className
      )}
      {...props}
    />
  );
}

// ============================================
// FLUENT CARD
// ============================================

export interface FluentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  selected?: boolean;
  interactive?: boolean;
}

export function FluentCard({
  className,
  size = 'medium',
  orientation = 'vertical',
  selected = false,
  interactive = false,
  children,
  ...props
}: FluentCardProps) {
  const sizeClasses = {
    small: 'p-3 gap-2',
    medium: 'p-4 gap-3',
    large: 'p-6 gap-4',
  };

  return (
    <div
      data-slot="fluent-card"
      className={cn(
        'rounded-[8px]', // Fluent borderRadiusXLarge
        'border border-[var(--color-border-subtle,#f0f0f0)]',
        'bg-[var(--color-bg-default,#ffffff)]',
        'shadow-[0px_2px_4px_rgba(0,0,0,0.14),0px_0px_2px_rgba(0,0,0,0.12)]', // shadow4
        'transition-all duration-[100ms]',
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        sizeClasses[size],
        interactive && [
          'cursor-pointer',
          'hover:shadow-[0px_4px_8px_rgba(0,0,0,0.14),0px_0px_2px_rgba(0,0,0,0.12)]', // shadow8
          'hover:border-[var(--color-border-default,#e0e0e0)]',
        ],
        selected && 'ring-2 ring-[var(--color-primary,#0f6cbd)] border-transparent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FluentCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="fluent-card-header"
      className={cn('flex items-start gap-3', className)}
      {...props}
    />
  );
}

export function FluentCardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="fluent-card-body"
      className={cn('text-sm text-[var(--color-text-primary,#242424)]', className)}
      {...props}
    />
  );
}

export function FluentCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="fluent-card-footer"
      className={cn('flex items-center gap-2 mt-auto', className)}
      {...props}
    />
  );
}

FluentCard.displayName = 'FluentCard';
