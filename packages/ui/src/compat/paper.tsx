import * as React from 'react';
import { cn } from '../patterns/utils';

const elevationClassMap: Record<number, string> = {
  0: '',
  1: 'shadow-1',
  2: 'shadow-2',
  3: 'shadow-3',
  4: 'shadow-4',
  5: 'shadow-5',
  6: 'shadow-6',
  7: 'shadow-7',
  8: 'shadow-8',
};

export interface PaperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Elevation
   * @default 1
   */
  elevation?: number;
  /**
   * Variant
   * @default 'elevation'
   */
  variant?: 'elevation' | 'outlined';
  /**
   * Square corners
   */
  square?: boolean;
  children: React.ReactNode;
}

export const Paper = React.forwardRef<HTMLDivElement, PaperProps>(
  (
    { className, elevation = 1, variant = 'elevation', square = false, children, ...props },
    ref
  ) => {
    const normalizedElevation = Math.min(8, Math.max(0, Math.round(elevation)));
    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-paper',
          !square && 'rounded-lg',
          variant === 'elevation' && normalizedElevation > 0 && elevationClassMap[normalizedElevation],
          variant === 'outlined' && 'border border-divider',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Paper.displayName = 'Paper';
