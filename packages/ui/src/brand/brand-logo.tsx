import * as React from 'react';
import { cn } from '../patterns/utils';
import { KaiIcon } from './kai-icon';

export type BrandLogoVariant = 'primary' | 'white' | 'black' | 'icon';

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BrandLogoVariant;
  size?: 'sm' | 'md' | 'lg';
  companyName?: string;
}

export function BrandLogo({ variant = 'primary', size = 'md', companyName = 'KAVEN', className, ...props }: BrandLogoProps) {
  const textClass = variant === 'white' ? 'text-white' : variant === 'black' ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]';
  const fontClass = 'font-[var(--font-geist)] font-bold tracking-[-0.01em]';
  const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  if (variant === 'icon') return <KaiIcon size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} className={className} {...props} />;

  return (
    <div className={cn('inline-flex items-center gap-2', className)} {...props}>
      <span className={cn(fontClass, sizeClass, textClass)}>{companyName}</span>
      <KaiIcon size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} state="idle" />
    </div>
  );
}
