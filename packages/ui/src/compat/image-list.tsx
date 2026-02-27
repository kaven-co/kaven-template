'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface ImageListProps extends React.HTMLAttributes<HTMLUListElement> {
  cols?: number;
  gap?: number;
  variant?: 'standard' | 'quilted' | 'woven';
}

const ImageList = React.forwardRef<HTMLUListElement, ImageListProps>(
  ({ className, cols = 3, gap = 8, variant = 'standard', children, ...props }, ref) => (
    <ul
      ref={ref}
      data-slot="image-list"
      data-variant={variant}
      className={cn('grid list-none p-0 m-0', className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${gap}px`,
      }}
      {...props}
    >
      {children}
    </ul>
  )
);
ImageList.displayName = 'ImageList';

export interface ImageListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  cols?: number;
  rows?: number;
}

const ImageListItem = React.forwardRef<HTMLLIElement, ImageListItemProps>(
  ({ className, cols = 1, rows = 1, children, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="image-list-item"
      className={cn('overflow-hidden rounded-lg', className)}
      style={{
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
      }}
      {...props}
    >
      {children}
    </li>
  )
);
ImageListItem.displayName = 'ImageListItem';

export { ImageList, ImageListItem };
