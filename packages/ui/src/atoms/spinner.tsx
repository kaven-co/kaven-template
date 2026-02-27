import * as React from 'react';
import { Loader2 } from 'lucide-react';
import type { BrandTone } from '../tokens/brand-tokens';
import type { ComponentSize } from '../tokens/sizing-tokens';
import { cn } from '../patterns/utils';

const sizeClassMap: Record<ComponentSize, string> = {
  '2xs': 'size-3',
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-7',
  '2xl': 'size-8',
};

const toneClassMap: Record<BrandTone, string> = {
  default: 'text-neutral-700 dark:text-neutral-300',
  brand: 'text-[#F59E0B]',
  success: 'text-[#10B981]',
  warning: 'text-[#F59E0B]',
  error: 'text-[#EF4444]',
  info: 'text-[#3B82F6]',
};

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  size?: ComponentSize;
  tone?: BrandTone;
}

export function Spinner({ size = 'md', tone = 'brand', className, ...props }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin', sizeClassMap[size], toneClassMap[tone], className)} {...props} />;
}
