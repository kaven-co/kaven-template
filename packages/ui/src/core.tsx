import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Slot } from '@radix-ui/react-slot';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { clsx, type ClassValue } from 'clsx';
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonVariant = 'contained' | 'outline' | 'outlined' | 'ghost' | 'default' | 'destructive';
export type ButtonColor = 'primary' | 'secondary' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

function buttonClasses(opts: {
  variant: ButtonVariant;
  color: ButtonColor;
  size: ButtonSize;
  fullWidth: boolean;
  disabled?: boolean;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:pointer-events-none';

  const widths = opts.fullWidth ? 'w-full' : '';

  const sizes =
    opts.size === 'sm'
      ? 'h-9 px-3 text-sm'
      : opts.size === 'icon'
        ? 'h-9 w-9 p-0'
      : opts.size === 'lg'
        ? 'h-12 px-5 text-base'
        : 'h-10 px-4 text-sm';

  const tones =
    opts.color === 'primary'
      ? {
          contained: 'bg-primary text-primary-foreground hover:bg-primary/90',
          outline: 'border border-primary/30 text-primary hover:bg-primary/10',
          outlined: 'border border-primary/30 text-primary hover:bg-primary/10',
          ghost: 'text-primary hover:bg-primary/10',
          default: 'bg-primary text-primary-foreground hover:bg-primary/90',
          destructive: 'bg-red-600 text-white hover:bg-red-600/90',
        }
      : opts.color === 'secondary'
        ? {
            contained: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
            outline: 'border border-secondary/30 text-secondary hover:bg-secondary/10',
            outlined: 'border border-secondary/30 text-secondary hover:bg-secondary/10',
            ghost: 'text-secondary hover:bg-secondary/10',
            default: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
            destructive: 'bg-red-600 text-white hover:bg-red-600/90',
          }
        : {
            contained: 'bg-foreground text-background hover:bg-foreground/90',
            outline: 'border border-border text-foreground hover:bg-muted',
            outlined: 'border border-border text-foreground hover:bg-muted',
            ghost: 'text-foreground hover:bg-muted',
            default: 'bg-foreground text-background hover:bg-foreground/90',
            destructive: 'bg-red-600 text-white hover:bg-red-600/90',
          };

  const variant = tones[opts.variant];
  return cn(base, widths, sizes, variant);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'contained', color = 'neutral', size = 'md', fullWidth = false, loading, disabled, asChild, children, ...props },
  ref,
) {
  const Comp: any = asChild ? Slot : 'button';
  return (
    <Comp
      ref={ref}
      className={cn(buttonClasses({ variant, color, size, fullWidth, disabled }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Comp>
  );
});

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, fullWidth, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        fullWidth ? 'w-full' : '',
        className,
      )}
      {...props}
    />
  );
});

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
  endAdornment?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, error, errorMessage, fullWidth, endAdornment, className, ...props },
  ref,
) {
  const inputId = id ?? props.name ?? undefined;
  return (
    <div className={cn('space-y-1', fullWidth ? 'w-full' : '')}>
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            endAdornment ? 'pr-10' : '',
            error ? 'border-red-500/60 focus-visible:ring-red-500/20' : '',
            className,
          )}
          fullWidth
          {...props}
        />
        {endAdornment ? <div className="absolute inset-y-0 right-3 flex items-center">{endAdornment}</div> : null}
      </div>
      {error && errorMessage ? <p className="text-xs text-red-500">{errorMessage}</p> : null}
    </div>
  );
});

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export type AlertVariant = 'filled' | 'outline';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: AlertSeverity;
  variant?: AlertVariant;
  icon?: React.ReactNode;
}

export function Alert({ className, severity = 'info', variant = 'outline', icon, children, ...props }: AlertProps) {
  const tones =
    severity === 'error'
      ? 'border-red-500/30 text-red-500 bg-red-500/10'
      : severity === 'warning'
        ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
        : severity === 'success'
          ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
          : 'border-border text-foreground bg-muted/40';

  const filled =
    severity === 'error'
      ? 'bg-red-600 text-white'
      : severity === 'warning'
        ? 'bg-amber-600 text-white'
        : severity === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-foreground text-background';

  return (
    <div
      className={cn('flex gap-3 rounded-md border px-4 py-3 text-sm', variant === 'filled' ? filled : tones, className)}
      role="alert"
      {...props}
    >
      {icon ? <div className="mt-0.5">{icon}</div> : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const styles =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground'
      : variant === 'outline'
        ? 'border border-border bg-transparent text-foreground'
        : 'bg-primary text-primary-foreground';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', styles, className)} {...props} />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export const Avatar = AvatarPrimitive.Root;
export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = AvatarPrimitive.Fallback;

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
export const DialogOverlay = DialogPrimitive.Overlay;
export const DialogContent = DialogPrimitive.Content;
export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = SelectPrimitive.Trigger;
export const SelectContent = SelectPrimitive.Content;
export const SelectLabel = SelectPrimitive.Label;
export const SelectItem = SelectPrimitive.Item;
export const SelectSeparator = SelectPrimitive.Separator;

export const Switch = SwitchPrimitive.Root;

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

export const TooltipProvider = TooltipPrimitive.Provider;

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
);

// Tooltip primitives (compat with existing app imports)
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;

// Dropdown menu primitives
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = DropdownMenuPrimitive.Content;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;

// Checkbox primitive
export const Checkbox = CheckboxPrimitive.Root;

// Table primitives (simple wrappers)
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full caption-bottom text-sm', className)} {...props} />;
}
export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...props} />;
}
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground', className)} {...props} />;
}
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-4 align-middle', className)} {...props} />;
}

// react-hook-form helpers (compat)
export function Form({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) {
  // Caller is expected to wrap with <FormProvider {...methods}> in app code.
  return <div {...props}>{children}</div>;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>,
) {
  return <Controller {...props} />;
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <Label className={className} {...props} />;
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('w-full', className)} {...props} />;
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn('text-xs text-red-500', className)} {...props}>
      {children}
    </p>
  );
}

