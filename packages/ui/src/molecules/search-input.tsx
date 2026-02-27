import * as React from 'react';
import { Search } from 'lucide-react';
import { Input, type InputProps } from '../atoms/input';
import { cn } from '../patterns/utils';

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  iconLabel?: string;
}

export function SearchInput({ className, size = 'md', iconLabel = 'Buscar', ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search aria-label={iconLabel} className={cn('absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]', size === '2xl' ? 'size-5' : 'size-4')} />
      <Input type="search" size={size} className={cn('pl-9', className)} {...props} />
    </div>
  );
}
