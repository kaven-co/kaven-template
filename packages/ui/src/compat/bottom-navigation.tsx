'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface BottomNavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  showLabels?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, value, onChange, showLabels = true, color = 'primary', children, ...props }, ref) => (
    <nav
      ref={ref}
      data-slot="bottom-navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around',
        'border-t border-divider bg-background-paper h-16',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<BottomNavigationActionProps>(child)) {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            showLabel: child.props.showLabel ?? showLabels,
            color,
            onClick: () => {
              child.props.onClick?.({} as React.MouseEvent<HTMLButtonElement>);
              if (child.props.value) onChange?.(child.props.value);
            },
          });
        }
        return child;
      })}
    </nav>
  )
);
BottomNavigation.displayName = 'BottomNavigation';

export interface BottomNavigationActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  icon?: React.ReactNode;
  label?: string;
  value?: string;
  selected?: boolean;
  showLabel?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const selectedColorClasses = {
  primary: 'text-primary-main',
  secondary: 'text-secondary-main',
  success: 'text-success-main',
  warning: 'text-warning-main',
  error: 'text-error-main',
  info: 'text-info-main',
} as const;

const BottomNavigationAction = React.forwardRef<HTMLButtonElement, BottomNavigationActionProps>(
  ({ className, icon, label, selected, showLabel = true, color = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-slot="bottom-navigation-action"
      data-selected={selected || undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 px-3 transition-colors cursor-pointer',
        selected ? selectedColorClasses[color] : 'text-text-secondary hover:text-text-primary',
        className
      )}
      {...props}
    >
      {icon && <span className="[&_svg]:size-5">{icon}</span>}
      {showLabel && label && (
        <span className={cn('text-[10px] leading-tight', selected && 'font-medium')}>
          {label}
        </span>
      )}
    </button>
  )
);
BottomNavigationAction.displayName = 'BottomNavigationAction';

export { BottomNavigation, BottomNavigationAction };
