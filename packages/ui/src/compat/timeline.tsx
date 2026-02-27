'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  position?: 'left' | 'right' | 'alternate';
}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ className, position = 'right', children, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="timeline"
      data-position={position}
      className={cn('relative flex flex-col', className)}
      {...props}
    >
      {children}
    </ul>
  )
);
Timeline.displayName = 'Timeline';

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="timeline-item"
      className={cn('relative flex gap-4 pb-8 last:pb-0', className)}
      {...props}
    >
      {children}
    </li>
  )
);
TimelineItem.displayName = 'TimelineItem';

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'grey';
  variant?: 'filled' | 'outlined';
}

const dotColorClasses = {
  filled: {
    primary: 'bg-primary-main',
    secondary: 'bg-secondary-main',
    success: 'bg-success-main',
    warning: 'bg-warning-main',
    error: 'bg-error-main',
    info: 'bg-info-main',
    grey: 'bg-gray-400',
  },
  outlined: {
    primary: 'border-2 border-primary-main',
    secondary: 'border-2 border-secondary-main',
    success: 'border-2 border-success-main',
    warning: 'border-2 border-warning-main',
    error: 'border-2 border-error-main',
    info: 'border-2 border-info-main',
    grey: 'border-2 border-gray-400',
  },
} as const;

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, color = 'grey', variant = 'filled', children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="timeline-dot"
      className={cn(
        'relative z-10 flex shrink-0 items-center justify-center rounded-full',
        children ? 'size-10 [&_svg]:size-5' : 'size-3 mt-1.5',
        dotColorClasses[variant][color],
        className
      )}
      {...props}
    >
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-full bg-divider" />
    </div>
  )
);
TimelineDot.displayName = 'TimelineDot';

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="timeline-content"
      className={cn('flex-1 pt-0.5 pb-2', className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineContent.displayName = 'TimelineContent';

export { Timeline, TimelineItem, TimelineDot, TimelineContent };
