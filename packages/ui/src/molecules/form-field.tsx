import * as React from 'react';
import { Label } from '../atoms/label';
import { Input, type InputProps } from '../atoms/input';
import type { BrandTone } from '../tokens/brand-tokens';
import type { ComponentSize } from '../tokens/sizing-tokens';

export interface FormFieldProps extends Omit<InputProps, 'size' | 'density'> {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  size?: ComponentSize;
  tone?: BrandTone;
}

export function FormField({ label, hint, error, id, size = 'md', tone = 'brand', ...inputProps }: FormFieldProps) {
  const finalTone = error ? 'error' : tone;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} size={size} tone={finalTone}>
        {label}
      </Label>
      <Input id={id} size={size} tone={finalTone} aria-invalid={Boolean(error)} {...inputProps} />
      {error ? <p className="text-xs text-[#EF4444]">{error}</p> : hint ? <p className="text-xs text-[#6A6A6A]">{hint}</p> : null}
    </div>
  );
}
