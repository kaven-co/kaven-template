/**
 * Fluent adapter utility — re-exports the shared cn() helper.
 * Mirrors the pattern from @kaven/ui-base/src/patterns/utils.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
