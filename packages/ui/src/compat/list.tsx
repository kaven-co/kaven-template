'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  dense?: boolean;
  disablePadding?: boolean;
  subheader?: React.ReactNode;
}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, dense = false, disablePadding = false, subheader, children, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="list"
      data-dense={dense || undefined}
      className={cn(
        'w-full',
        !disablePadding && 'py-2',
        className
      )}
      {...props}
    >
      {subheader && (
        <li className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-disabled">
          {subheader}
        </li>
      )}
      {children}
    </ul>
  )
);
List.displayName = 'List';

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  disabled?: boolean;
  selected?: boolean;
  disableGutters?: boolean;
  divider?: boolean;
  button?: boolean;
  secondaryAction?: React.ReactNode;
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      className,
      disabled,
      selected,
      disableGutters,
      divider,
      button,
      secondaryAction,
      icon,
      avatar,
      primary,
      secondary,
      children,
      ...props
    },
    ref
  ) => (
    <li
      ref={ref}
      data-slot="list-item"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        'flex items-center gap-3 min-h-[48px]',
        !disableGutters && 'px-4',
        'py-1.5',
        button && 'cursor-pointer transition-colors hover:bg-gray-100',
        selected && 'bg-primary-lighter',
        disabled && 'opacity-50 pointer-events-none',
        divider && 'border-b border-divider',
        className
      )}
      {...props}
    >
      {avatar && <div className="shrink-0">{avatar}</div>}
      {icon && <div className="shrink-0 text-text-secondary">{icon}</div>}
      {(primary || secondary) ? (
        <div className="flex-1 min-w-0">
          {primary && <div className="text-sm text-text-primary truncate">{primary}</div>}
          {secondary && <div className="text-xs text-text-secondary truncate">{secondary}</div>}
        </div>
      ) : (
        <div className="flex-1 min-w-0">{children}</div>
      )}
      {secondaryAction && <div className="shrink-0 ml-auto">{secondaryAction}</div>}
    </li>
  )
);
ListItem.displayName = 'ListItem';

export { List, ListItem };
