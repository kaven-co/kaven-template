'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../patterns/utils';

const snackbarVariants = cva(
  'fixed z-[1400] flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm transition-all',
  {
    variants: {
      severity: {
        success: 'bg-success-main text-white',
        warning: 'bg-warning-main text-gray-900',
        error: 'bg-error-main text-white',
        info: 'bg-info-main text-white',
        default: 'bg-gray-800 text-white',
      },
      anchorOrigin: {
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
      },
    },
    defaultVariants: {
      severity: 'default',
      anchorOrigin: 'bottom-left',
    },
  }
);

const severityIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  default: null,
} as const;

export interface SnackbarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof snackbarVariants> {
  open?: boolean;
  message?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  autoHideDuration?: number;
  showIcon?: boolean;
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      className,
      severity = 'default',
      anchorOrigin,
      open = false,
      message,
      action,
      onClose,
      autoHideDuration,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    React.useEffect(() => {
      if (open && autoHideDuration && onClose) {
        const timer = setTimeout(onClose, autoHideDuration);
        return () => clearTimeout(timer);
      }
    }, [open, autoHideDuration, onClose]);

    if (!open) return null;

    const IconComponent = severity ? severityIcons[severity] : null;

    return (
      <div
        ref={ref}
        role="alert"
        data-slot="snackbar"
        className={cn(snackbarVariants({ severity, anchorOrigin }), className)}
        {...props}
      >
        {showIcon && IconComponent && <IconComponent className="size-5 shrink-0" />}
        <div className="flex-1 min-w-0">{message ?? children}</div>
        {action}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }
);
Snackbar.displayName = 'Snackbar';

export { Snackbar, snackbarVariants };
