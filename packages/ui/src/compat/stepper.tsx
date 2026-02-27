'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  alternativeLabel?: boolean;
}

const stepColorClasses = {
  primary: { active: 'bg-primary-main text-white border-primary-main', connector: 'bg-primary-main' },
  secondary: { active: 'bg-secondary-main text-white border-secondary-main', connector: 'bg-secondary-main' },
  success: { active: 'bg-success-main text-white border-success-main', connector: 'bg-success-main' },
  warning: { active: 'bg-warning-main text-gray-900 border-warning-main', connector: 'bg-warning-main' },
  error: { active: 'bg-error-main text-white border-error-main', connector: 'bg-error-main' },
  info: { active: 'bg-info-main text-white border-info-main', connector: 'bg-info-main' },
} as const;

const StepperContext = React.createContext<{
  activeStep: number;
  orientation: 'horizontal' | 'vertical';
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  totalSteps: number;
}>({
  activeStep: 0,
  orientation: 'horizontal',
  color: 'primary',
  totalSteps: 0,
});

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      activeStep = 0,
      orientation = 'horizontal',
      color = 'primary',
      alternativeLabel = false,
      children,
      ...props
    },
    ref
  ) => {
    const totalSteps = React.Children.count(children);

    return (
      <StepperContext.Provider value={{ activeStep, orientation, color, totalSteps }}>
        <div
          ref={ref}
          data-slot="stepper"
          data-orientation={orientation}
          className={cn(
            'flex',
            orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
            className
          )}
          {...props}
        >
          {React.Children.map(children, (child, index) => (
            <React.Fragment key={index}>
              {React.isValidElement(child) &&
                React.cloneElement(child as React.ReactElement<{ index?: number }>, { index })}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    orientation === 'horizontal' ? 'flex-1 h-0.5 mx-2' : 'w-0.5 h-6 ml-4 my-1',
                    index < activeStep
                      ? stepColorClasses[color].connector
                      : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </StepperContext.Provider>
    );
  }
);
Stepper.displayName = 'Stepper';

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  completed?: boolean;
  disabled?: boolean;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, index = 0, completed: completedProp, disabled, children, ...props }, ref) => {
    const { activeStep, color } = React.useContext(StepperContext);
    const completed = completedProp ?? index < activeStep;
    const active = index === activeStep;
    const colors = stepColorClasses[color];

    return (
      <div
        ref={ref}
        data-slot="step"
        data-active={active || undefined}
        data-completed={completed || undefined}
        data-disabled={disabled || undefined}
        className={cn('flex items-center gap-2 shrink-0', disabled && 'opacity-50', className)}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center size-8 rounded-full border-2 text-sm font-semibold transition-colors',
            completed
              ? colors.active
              : active
                ? colors.active
                : 'border-gray-300 text-text-secondary bg-transparent'
          )}
        >
          {completed ? <Check className="size-4" /> : index + 1}
        </div>
        {children}
      </div>
    );
  }
);
Step.displayName = 'Step';

export interface StepLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

const StepLabel = React.forwardRef<HTMLSpanElement, StepLabelProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="step-label"
      className={cn('text-sm font-medium text-text-primary', className)}
      {...props}
    >
      {children}
    </span>
  )
);
StepLabel.displayName = 'StepLabel';

export { Stepper, Step, StepLabel };
