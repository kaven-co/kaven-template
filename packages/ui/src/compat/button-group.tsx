'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const buttonGroupVariants = cva(
  'inline-flex',
  {
    variants: {
      variant: {
        contained: '',
        outlined: '',
        text: '',
      },
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      orientation: 'horizontal',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof buttonGroupVariants> {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  disabled?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      variant = 'outlined',
      orientation = 'horizontal',
      size,
      fullWidth,
      color,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === 'horizontal';

    return (
      <div
        ref={ref}
        role="group"
        data-slot="button-group"
        className={cn(
          buttonGroupVariants({ variant, orientation, size, fullWidth }),
          '[&>*]:rounded-none',
          isHorizontal
            ? '[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md'
            : '[&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md',
          variant === 'outlined' && isHorizontal && '[&>*+*]:border-l-0',
          variant === 'outlined' && !isHorizontal && '[&>*+*]:border-t-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';

export { ButtonGroup, buttonGroupVariants };
