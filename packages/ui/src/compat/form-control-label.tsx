'use client';

import * as React from 'react';
import { cn } from '../patterns/utils';

export interface FormControlLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  control: React.ReactElement;
  label: React.ReactNode;
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
  disabled?: boolean;
  required?: boolean;
}

const placementClasses = {
  end: 'flex-row',
  start: 'flex-row-reverse',
  top: 'flex-col-reverse items-center',
  bottom: 'flex-col items-center',
} as const;

const FormControlLabel = React.forwardRef<HTMLLabelElement, FormControlLabelProps>(
  (
    {
      className,
      control,
      label,
      labelPlacement = 'end',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => (
    <label
      ref={ref}
      data-slot="form-control-label"
      data-disabled={disabled || undefined}
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        placementClasses[labelPlacement],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {React.cloneElement(control as React.ReactElement<{ disabled?: boolean }>, { disabled })}
      <span className="text-sm text-text-primary">
        {label}
        {required && <span className="text-error-main ml-0.5">*</span>}
      </span>
    </label>
  )
);
FormControlLabel.displayName = 'FormControlLabel';

export { FormControlLabel };
