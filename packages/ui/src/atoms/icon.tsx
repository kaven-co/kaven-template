import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { BrandTone } from '../tokens/brand-tokens';
import type { ComponentSize } from '../tokens/sizing-tokens';
import { cn } from '../patterns/utils';

const sizeClassMap: Record<ComponentSize, string> = {
  '2xs': 'size-3',
  xs: 'size-3.5',
  sm: 'size-4',
  md: 'size-[18px]',
  lg: 'size-5',
  xl: 'size-6',
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

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'size'> {
  icon: LucideIcon;
  size?: ComponentSize;
  tone?: BrandTone;
  label?: string;
}

export function Icon({ icon: IconComponent, size = 'md', tone = 'default', label, className, ...props }: IconProps) {
  return (
    <IconComponent
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(sizeClassMap[size], toneClassMap[tone], className)}
      {...props}
    />
  );
}
