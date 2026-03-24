'use client';

import { cn } from '@kaven/ui-base';
import { AmountDisplay } from './AmountDisplay';
import type { DREReport as DREReportType } from '@/types/finance';

interface DREReportProps {
  report: DREReportType;
}

export function DREReport({ report }: DREReportProps) {
  const { accounts, summary } = report;

  // Group accounts by type
  const grouped: Record<string, typeof accounts> = {};
  for (const account of accounts) {
    if (!grouped[account.type]) grouped[account.type] = [];
    grouped[account.type].push(account);
  }

  const sectionOrder = ['revenue', 'variable_expense', 'fixed_expense', 'investment', 'financial_movement'];
  const sectionLabels: Record<string, string> = {
    revenue: 'Revenue',
    variable_expense: 'Variable Expenses',
    fixed_expense: 'Fixed Expenses',
    investment: 'Investments',
    financial_movement: 'Financial Movements',
  };

  return (
    <div className="space-y-1">
      {/* Account lines */}
      {sectionOrder.map((type) => {
        const items = grouped[type];
        if (!items?.length) return null;

        return (
          <div key={type} className="mb-4">
            <div className="flex justify-between items-center py-2 border-b font-semibold text-sm">
              <span>{sectionLabels[type]}</span>
            </div>
            {items.map((account) => (
              <div
                key={account.id}
                className="flex justify-between items-center py-1.5 px-2 text-sm hover:bg-muted/30 rounded"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{account.code}</span>
                  <span>{account.name}</span>
                </span>
                <AmountDisplay amount={account.total} type={type} />
              </div>
            ))}
          </div>
        );
      })}

      {/* Summary */}
      <div className="border-t-2 pt-3 space-y-2">
        <SummaryRow label="Gross Profit" value={summary.grossProfit} pct={summary.grossMargin} />
        <SummaryRow label="EBITDA" value={summary.ebitda} pct={summary.ebitdaMargin} />
        <SummaryRow
          label="Net Result"
          value={summary.netResult}
          pct={summary.netMargin}
          bold
        />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  pct,
  bold = false,
}: {
  label: string;
  value: number;
  pct: number;
  bold?: boolean;
}) {
  return (
    <div className={cn('flex justify-between items-center py-1 px-2 text-sm', bold && 'font-bold')}>
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
        <AmountDisplay
          amount={value}
          type={value >= 0 ? 'revenue' : 'expense'}
        />
      </div>
    </div>
  );
}
