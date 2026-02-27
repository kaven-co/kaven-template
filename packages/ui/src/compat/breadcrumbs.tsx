'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, separator, children, ...props }, ref) => {
    const items = React.Children.toArray(children);
    const sep = separator ?? <ChevronRight className="size-3.5 text-text-disabled" />;

    return (
      <nav ref={ref} aria-label="breadcrumb" data-slot="breadcrumbs" {...props}>
        <ol className={cn('flex flex-wrap items-center gap-1.5 text-sm text-text-secondary', className)}>
          {items.map((child, index) => (
            <React.Fragment key={index}>
              <li className="inline-flex items-center">{child}</li>
              {index < items.length - 1 && (
                <li role="presentation" aria-hidden className="inline-flex items-center">
                  {sep}
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  }
);
Breadcrumbs.displayName = 'Breadcrumbs';

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  href?: string;
  active?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  ({ className, href, active, children, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center gap-1.5 text-sm transition-colors',
      active
        ? 'text-text-primary font-medium'
        : 'text-text-secondary hover:text-text-primary',
      className
    );

    if (href && !active) {
      return (
        <span ref={ref} data-slot="breadcrumb-item" {...props}>
          <a href={href} className={baseClasses}>
            {children}
          </a>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        data-slot="breadcrumb-item"
        aria-current={active ? 'page' : undefined}
        className={baseClasses}
        {...props}
      >
        {children}
      </span>
    );
  }
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

export { Breadcrumbs, BreadcrumbItem };
