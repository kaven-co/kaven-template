'use client';

import { cn } from '@kaven/ui-base';
import type { BudgetComparison } from '@/types/finance';

interface BudgetGridProps {
  data: BudgetComparison[];
  year: number;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function BudgetGrid({ data, year }: BudgetGridProps) {
  // Group by account
  const accountMap = new Map<string, { account: BudgetComparison['chartOfAccount']; months: Map<number, BudgetComparison> }>();

  for (const item of data) {
    const key = item.chartOfAccount.id;
    if (!accountMap.has(key)) {
      accountMap.set(key, { account: item.chartOfAccount, months: new Map() });
    }
    accountMap.get(key)!.months.set(item.month, item);
  }

  const accounts = Array.from(accountMap.values());

  const formatAmount = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" aria-label={`Budget vs Actual — ${year}`}>
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-medium sticky left-0 bg-background min-w-[160px]">
              Account
            </th>
            {MONTH_LABELS.map((label, i) => (
              <th key={i} className="text-right p-2 font-medium min-w-[80px]">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accounts.map(({ account, months }) => (
            <tr key={account.id} className="border-b hover:bg-muted/30">
              <td className="p-2 sticky left-0 bg-background">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-muted-foreground">{account.code}</span>
                  <span className="truncate">{account.name}</span>
                </div>
              </td>
              {MONTH_LABELS.map((_, monthIndex) => {
                const item = months.get(monthIndex + 1);
                if (!item) return <td key={monthIndex} className="p-2 text-right text-muted-foreground">-</td>;

                return (
                  <td key={monthIndex} className="p-2 text-right">
                    <div className="space-y-0.5">
                      <div className="text-muted-foreground">{formatAmount(item.budgeted)}</div>
                      <div className={cn(
                        'font-medium',
                        item.variance >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}>
                        {formatAmount(item.actual)}
                      </div>
                      {item.variancePct !== 0 && (
                        <div className={cn(
                          'text-[10px]',
                          item.variancePct >= 0 ? 'text-emerald-500' : 'text-red-500',
                        )}>
                          {item.variancePct > 0 ? '+' : ''}{item.variancePct.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
