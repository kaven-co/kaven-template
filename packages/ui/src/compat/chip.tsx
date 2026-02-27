'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../patterns/utils';

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-all [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        filled: '',
        outlined: 'border bg-transparent',
        soft: '',
      },
      color: {
        primary: '',
        secondary: '',
        success: '',
        warning: '',
        error: '',
        info: '',
        default: '',
      },
      size: {
        sm: 'h-6 px-2 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-9 px-4 text-sm',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'filled', color: 'primary', className: 'bg-primary-main text-white' },
      { variant: 'filled', color: 'secondary', className: 'bg-secondary-main text-white' },
      { variant: 'filled', color: 'success', className: 'bg-success-main text-white' },
      { variant: 'filled', color: 'warning', className: 'bg-warning-main text-gray-900' },
      { variant: 'filled', color: 'error', className: 'bg-error-main text-white' },
      { variant: 'filled', color: 'info', className: 'bg-info-main text-white' },
      { variant: 'filled', color: 'default', className: 'bg-gray-200 text-text-primary' },
      { variant: 'outlined', color: 'primary', className: 'border-primary-main text-primary-main' },
      { variant: 'outlined', color: 'secondary', className: 'border-secondary-main text-secondary-main' },
      { variant: 'outlined', color: 'success', className: 'border-success-main text-success-main' },
      { variant: 'outlined', color: 'warning', className: 'border-warning-main text-warning-main' },
      { variant: 'outlined', color: 'error', className: 'border-error-main text-error-main' },
      { variant: 'outlined', color: 'info', className: 'border-info-main text-info-main' },
      { variant: 'outlined', color: 'default', className: 'border-gray-300 text-text-primary' },
      { variant: 'soft', color: 'primary', className: 'bg-primary-lighter text-primary-darker' },
      { variant: 'soft', color: 'secondary', className: 'bg-secondary-lighter text-secondary-darker' },
      { variant: 'soft', color: 'success', className: 'bg-success-lighter text-success-darker' },
      { variant: 'soft', color: 'warning', className: 'bg-warning-lighter text-warning-darker' },
      { variant: 'soft', color: 'error', className: 'bg-error-lighter text-error-darker' },
      { variant: 'soft', color: 'info', className: 'bg-info-lighter text-info-darker' },
      { variant: 'soft', color: 'default', className: 'bg-gray-100 text-text-primary' },
    ],
    defaultVariants: {
      variant: 'filled',
      color: 'default',
      size: 'md',
      clickable: false,
    },
  }
);

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof chipVariants> {
  label?: string;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  onDelete?: () => void;
  deleteIcon?: React.ReactNode;
  disabled?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      variant,
      color,
      size,
      clickable,
      label,
      icon,
      avatar,
      onDelete,
      deleteIcon,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable ?? !!onClick;

    return (
      <div
        ref={ref}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        data-slot="chip"
        data-disabled={disabled || undefined}
        className={cn(
          chipVariants({ variant, color, size, clickable: isClickable }),
          disabled && 'opacity-50 pointer-events-none',
          isClickable && 'hover:shadow-sm active:scale-95',
          className
        )}
        onClick={!disabled ? onClick : undefined}
        {...props}
      >
        {avatar && <span className="flex shrink-0 -ml-1">{avatar}</span>}
        {icon && <span className="flex shrink-0">{icon}</span>}
        <span>{label ?? children}</span>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={disabled}
            className="flex shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors -mr-0.5"
          >
            {deleteIcon ?? <X className="size-3.5" />}
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = 'Chip';

export { Chip, chipVariants };
