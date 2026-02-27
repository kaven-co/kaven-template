'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../patterns/utils';

export interface DividerProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Text or element to show in the middle of the divider */
  children?: React.ReactNode;
  /** Variant style */
  variant?: 'fullWidth' | 'inset' | 'middle';
}

const Divider = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  DividerProps
>(({ className, orientation = 'horizontal', variant = 'fullWidth', decorative = true, children, ...props }, ref) => {
  if (children) {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-slot="divider"
        className={cn(
          'flex items-center gap-3',
          orientation === 'vertical' ? 'flex-col h-full' : 'w-full',
          className
        )}
        role="separator"
        aria-orientation={orientation}
      >
        <span className={cn(
          'shrink bg-divider',
          orientation === 'vertical' ? 'w-px flex-1' : 'h-px flex-1'
        )} />
        <span className="text-xs text-text-disabled px-2 shrink-0">{children}</span>
        <span className={cn(
          'shrink bg-divider',
          orientation === 'vertical' ? 'w-px flex-1' : 'h-px flex-1'
        )} />
      </div>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="divider"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-divider',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        variant === 'inset' && orientation === 'horizontal' && 'ml-[72px]',
        variant === 'middle' && orientation === 'horizontal' && 'mx-4',
        className
      )}
      {...props}
    />
  );
});
Divider.displayName = 'Divider';

export { Divider };
