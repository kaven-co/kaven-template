'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  invisible?: boolean;
  onClose?: () => void;
}

const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  ({ className, open, invisible = false, onClose, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        data-slot="backdrop"
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[1200] flex items-center justify-center transition-opacity',
          invisible ? 'bg-transparent' : 'bg-black/50 backdrop-blur-sm',
          className
        )}
        onClick={onClose}
        {...props}
      >
        {children && (
          <div onClick={(e) => e.stopPropagation()}>{children}</div>
        )}
      </div>
    );
  }
);
Backdrop.displayName = 'Backdrop';

export { Backdrop };
