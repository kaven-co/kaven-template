'use client';

import { cn } from '@kaven/ui-base';

interface AmountDisplayProps {
  amount: number | string;
  currency?: string;
  type?: 'revenue' | 'expense' | 'investment' | 'financial_movement' | string;
  className?: string;
  showSign?: boolean;
}

/**
 * Display a formatted monetary amount with color coding.
 * Revenue = green, expense = red, neutral = default.
 */
export function AmountDisplay({
  amount,
  currency = 'BRL',
  type,
  className,
  showSign = false,
}: AmountDisplayProps) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = numericAmount < 0;

  const colorClass =
    type === 'revenue'
      ? 'text-emerald-600 dark:text-emerald-400'
      : type === 'expense' || type === 'fixed_expense' || type === 'variable_expense'
        ? 'text-red-600 dark:text-red-400'
        : type === 'investment'
          ? 'text-amber-600 dark:text-amber-400'
          : '';

  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numericAmount));

  const prefix = showSign ? (isNegative ? '-' : '+') : isNegative ? '-' : '';

  return (
    <span className={cn('font-mono tabular-nums', colorClass, className)}>
      {prefix}{formatted}
    </span>
  );
}
