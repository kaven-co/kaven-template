'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../patterns/utils';

const autocompleteVariants = cva(
  'relative w-full',
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const inputSizeClasses = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-9 text-sm px-3',
  lg: 'h-10 text-base px-4',
} as const;

export interface AutocompleteOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AutocompleteProps
  extends VariantProps<typeof autocompleteVariants> {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
  label?: string;
  error?: boolean;
  helperText?: string;
}

const Autocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Search...',
      disabled = false,
      clearable = true,
      className,
      inputClassName,
      label,
      error,
      helperText,
      size = 'md',
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    React.useEffect(() => {
      setInputValue(selectedOption?.label ?? '');
    }, [selectedOption]);

    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter((o) =>
      o.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
      <div
        ref={ref}
        data-slot="autocomplete"
        className={cn(autocompleteVariants({ size }), className)}
      >
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={cn(
              'w-full rounded-md border bg-transparent outline-none transition-colors',
              'focus:ring-2 focus:ring-offset-1',
              error
                ? 'border-error-main focus:ring-error-main/30'
                : 'border-divider focus:border-primary-main focus:ring-primary-main/30',
              disabled && 'opacity-50 cursor-not-allowed',
              inputSizeClasses[size ?? 'md'],
              inputClassName
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {clearable && value && (
              <button
                type="button"
                onClick={() => {
                  onChange?.('');
                  setInputValue('');
                }}
                className="p-0.5 rounded hover:bg-gray-100 text-text-disabled"
              >
                <X className="size-3.5" />
              </button>
            )}
            <ChevronDown className={cn('size-4 text-text-disabled transition-transform', open && 'rotate-180')} />
          </div>

          {open && filtered.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-divider bg-background-paper py-1 shadow-lg"
            >
              {filtered.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                    option.value === value
                      ? 'bg-primary-lighter text-primary-darker'
                      : 'hover:bg-gray-100 text-text-primary',
                    option.disabled && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange?.(option.value);
                      setInputValue(option.label);
                      setOpen(false);
                    }
                  }}
                >
                  {option.value === value && <Check className="size-4" />}
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {helperText && (
          <p className={cn('mt-1 text-xs', error ? 'text-error-main' : 'text-text-secondary')}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Autocomplete.displayName = 'Autocomplete';

export { Autocomplete };
