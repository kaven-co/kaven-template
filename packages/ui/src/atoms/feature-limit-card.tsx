import * as React from 'react';
import { cn } from '../patterns/utils';

export interface FeatureLimitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  current: number;
  limit: number;
  unit?: string;
}

function getUsageColor(percentage: number): { bar: string; text: string } {
  if (percentage >= 90) return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
  if (percentage >= 70) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
}

export function FeatureLimitCard({ name, current, limit, unit, className, ...props }: FeatureLimitCardProps) {
  const percentage = limit > 0 ? Math.min(Math.round((current / limit) * 100), 100) : 0;
  const colors = getUsageColor(percentage);

  return (
    <div
      className={cn(
        'rounded-lg border border-border/50 bg-card p-4 space-y-3',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className={cn('text-xs font-semibold', colors.text)}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-300', colors.bar)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {current.toLocaleString()} / {limit.toLocaleString()}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>
          {(limit - current).toLocaleString()} restante{limit - current !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
