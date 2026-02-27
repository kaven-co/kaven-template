'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const navigationBarVariants = cva(
  'fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-divider bg-background-paper safe-area-pb',
  {
    variants: {
      color: {
        primary: '',
        secondary: '',
        default: '',
      },
      size: {
        sm: 'h-14',
        md: 'h-16',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      color: 'default',
      size: 'md',
    },
  }
);

export interface NavigationBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'onChange'>,
    VariantProps<typeof navigationBarVariants> {
  value?: string;
  onChange?: (value: string) => void;
  showLabels?: boolean;
}

const NavigationBar = React.forwardRef<HTMLElement, NavigationBarProps>(
  ({ className, color, size, value, onChange, showLabels = true, children, ...props }, ref) => (
    <nav
      ref={ref}
      role="navigation"
      data-slot="navigation-bar"
      className={cn(navigationBarVariants({ color, size }), className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement<NavigationBarItemProps>(child)) {
          return React.cloneElement(child, {
            selected: child.props.value === value,
            showLabel: child.props.showLabel ?? showLabels,
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
NavigationBar.displayName = 'NavigationBar';

export interface NavigationBarItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  icon?: React.ReactNode;
  label?: string;
  value?: string;
  selected?: boolean;
  showLabel?: boolean;
}

const NavigationBarItem = React.forwardRef<HTMLButtonElement, NavigationBarItemProps>(
  ({ className, icon, label, selected, showLabel = true, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-slot="navigation-bar-item"
      data-selected={selected || undefined}
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-0.5 px-3 transition-colors cursor-pointer',
        selected
          ? 'text-primary-main'
          : 'text-text-secondary hover:text-text-primary',
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
NavigationBarItem.displayName = 'NavigationBarItem';

export { NavigationBar, NavigationBarItem, navigationBarVariants };
