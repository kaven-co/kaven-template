import * as React from 'react';
import { cn } from '../patterns/utils';

export type TypographyVariant =
  | 'display-xl'
  | 'display-l'
  | 'display-m'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body-lg'
  | 'body'
  | 'body-sm'
  | 'caption';

const variantClassMap: Record<TypographyVariant, string> = {
  'display-xl': 'font-[var(--font-geist)] text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]',
  'display-l': 'font-[var(--font-geist)] text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]',
  'display-m': 'font-[var(--font-geist)] text-3xl md:text-5xl font-bold tracking-tight leading-[1.2]',
  h1: 'font-[var(--font-geist)] text-3xl md:text-5xl font-bold leading-[1.2]',
  h2: 'font-[var(--font-geist)] text-2xl md:text-4xl font-bold leading-[1.3]',
  h3: 'font-[var(--font-dm-sans)] text-xl md:text-2xl font-semibold leading-[1.4]',
  h4: 'font-[var(--font-dm-sans)] text-lg md:text-xl font-semibold leading-[1.4]',
  h5: 'font-[var(--font-dm-sans)] text-base md:text-lg font-semibold leading-[1.5]',
  h6: 'font-[var(--font-dm-sans)] text-sm md:text-base font-semibold leading-[1.5]',
  'body-lg': 'font-[var(--font-dm-sans)] text-lg leading-[1.6]',
  body: 'font-[var(--font-dm-sans)] text-base leading-[1.6]',
  'body-sm': 'font-[var(--font-dm-sans)] text-sm leading-[1.5]',
  caption: 'font-[var(--font-dm-sans)] text-xs leading-[1.4]',
};

export interface TypographyProps extends React.ComponentProps<'p'> {
  as?: React.ElementType;
  variant?: TypographyVariant;
}

export function Typography({ as: Component = 'p', variant = 'body', className, ...props }: TypographyProps) {
  return <Component className={cn(variantClassMap[variant], className)} {...props} />;
}
