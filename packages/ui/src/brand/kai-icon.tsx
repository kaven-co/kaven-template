import * as React from 'react';
import { cn } from '../patterns/utils';

export type KaiState = 'idle' | 'walk' | 'thinking' | 'success';

const stateClassMap: Record<KaiState, string> = {
  idle: 'text-[#F59E0B]',
  walk: 'text-transparent bg-clip-text bg-[linear-gradient(90deg,#F59E0B_0%,#3B82F6_100%)]',
  thinking: 'text-transparent bg-clip-text bg-[linear-gradient(90deg,#F59E0B_0%,#FBBF24_100%)] animate-pulse',
  success: 'text-[#10B981]',
};

export interface KaiIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  state?: KaiState;
  size?: 'sm' | 'md' | 'lg';
}

export function KaiIcon({ state = 'idle', size = 'md', className, ...props }: KaiIconProps) {
  const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <span aria-label="Kai icon" role="img" className={cn(sizeClass, stateClassMap[state], className)} {...props}>
      🦎
    </span>
  );
}
