import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ComponentSize, Density } from '../tokens/sizing-tokens';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function densityPadding(density: Density = 'comfortable') {
  if (density === 'compact') return 'px-2';
  if (density === 'spacious') return 'px-4';
  return 'px-3';
}

export function sizeText(size: ComponentSize = 'md') {
  if (size === '2xs' || size === 'xs') return 'text-xs';
  if (size === 'sm' || size === 'md') return 'text-sm';
  if (size === 'lg') return 'text-base';
  return 'text-lg';
}
