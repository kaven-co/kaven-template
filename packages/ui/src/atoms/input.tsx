import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../patterns/utils';

const inputVariants = cva(
  'w-full rounded-md border bg-white text-[#0A0A0A] placeholder:text-[#9A9A9A] transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/30 focus-visible:border-[#F59E0B]',
  {
    variants: {
      variant: {
        default: 'border-[#E5E5E5]',
        filled: 'border-transparent bg-[#F9F9F9]',
        ghost: 'border-transparent bg-transparent',
      },
      size: {
        '2xs': 'h-6 px-2 text-xs',
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
        xl: 'h-12 px-4 text-base',
        '2xl': 'h-14 px-5 text-lg',
      },
      tone: {
        default: '',
        brand: 'focus-visible:ring-[#F59E0B]/30 focus-visible:border-[#F59E0B]',
        success: 'border-[#10B981] focus-visible:ring-[#10B981]/30',
        warning: 'border-[#F59E0B] focus-visible:ring-[#F59E0B]/30',
        error: 'border-[#EF4444] focus-visible:ring-[#EF4444]/30',
        info: 'border-[#3B82F6] focus-visible:ring-[#3B82F6]/30',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      tone: 'brand',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, variant, tone, ...props }, ref) => {
    return <input ref={ref} className={cn(inputVariants({ size: size ?? 'md', variant: variant ?? 'default', tone: tone ?? 'brand' }), className)} {...props} />;
  }
);

Input.displayName = 'Input';
