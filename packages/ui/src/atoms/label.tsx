import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const labelVariants = cva('font-medium text-[#2A2A2A]', {
  variants: {
    size: {
      '2xs': 'text-[10px]',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
      '2xl': 'text-xl',
    },
    tone: {
      default: 'text-[#2A2A2A]',
      brand: 'text-[#F59E0B]',
      success: 'text-[#10B981]',
      warning: 'text-[#F59E0B]',
      error: 'text-[#EF4444]',
      info: 'text-[#3B82F6]',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'default',
  },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, size, tone, ...props }, ref) => {
  return <label ref={ref} className={cn(labelVariants({ size: size ?? 'md', tone: tone ?? 'default' }), className)} {...props} />;
});

Label.displayName = 'Label';
