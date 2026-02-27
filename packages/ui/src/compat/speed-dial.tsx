'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface SpeedDialActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltipLabel?: string;
}

const SpeedDialAction = React.forwardRef<HTMLButtonElement, SpeedDialActionProps>(
  ({ className, icon, tooltipLabel, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-slot="speed-dial-action"
      title={tooltipLabel}
      className={cn(
        'flex items-center justify-center size-10 rounded-full bg-background-paper shadow-md transition-all hover:shadow-lg hover:scale-110',
        'text-text-primary [&_svg]:size-5',
        className
      )}
      {...props}
    >
      {icon}
    </button>
  )
);
SpeedDialAction.displayName = 'SpeedDialAction';

export interface SpeedDialProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  icon?: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  ariaLabel: string;
}

const fabColorClasses = {
  primary: 'bg-primary-main text-white hover:bg-primary-dark',
  secondary: 'bg-secondary-main text-white hover:bg-secondary-dark',
  success: 'bg-success-main text-white hover:bg-success-dark',
  warning: 'bg-warning-main text-gray-900 hover:bg-warning-dark',
  error: 'bg-error-main text-white hover:bg-error-dark',
  info: 'bg-info-main text-white hover:bg-info-dark',
} as const;

const directionClasses = {
  up: 'flex-col-reverse gap-3 bottom-0',
  down: 'flex-col gap-3 top-0',
  left: 'flex-row-reverse gap-3 right-0',
  right: 'flex-row gap-3 left-0',
} as const;

const SpeedDial = React.forwardRef<HTMLDivElement, SpeedDialProps>(
  (
    {
      className,
      open: controlledOpen,
      onOpen,
      onClose,
      icon,
      direction = 'up',
      color = 'primary',
      ariaLabel,
      children,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const toggle = () => {
      if (isOpen) {
        onClose?.();
        if (!isControlled) setInternalOpen(false);
      } else {
        onOpen?.();
        if (!isControlled) setInternalOpen(true);
      }
    };

    return (
      <div
        ref={ref}
        data-slot="speed-dial"
        className={cn('relative inline-flex', directionClasses[direction], className)}
        {...props}
      >
        <button
          type="button"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          onClick={toggle}
          className={cn(
            'flex items-center justify-center size-14 rounded-full shadow-lg transition-all [&_svg]:size-6',
            fabColorClasses[color],
            isOpen && 'rotate-45'
          )}
        >
          {icon ?? <Plus />}
        </button>

        {isOpen && (
          <div className={cn(
            'flex items-center',
            direction === 'up' || direction === 'down' ? 'flex-col gap-2' : 'flex-row gap-2'
          )}>
            {children}
          </div>
        )}
      </div>
    );
  }
);
SpeedDial.displayName = 'SpeedDial';

export { SpeedDial, SpeedDialAction };
