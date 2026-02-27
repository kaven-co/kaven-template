'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number;
  spacing?: number;
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  ({ className, columns = 3, spacing = 16, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="masonry"
      className={cn('w-full', className)}
      style={{
        columnCount: columns,
        columnGap: `${spacing}px`,
      }}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <div
          style={{ breakInside: 'avoid', marginBottom: `${spacing}px` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
);
Masonry.displayName = 'Masonry';

export { Masonry };
