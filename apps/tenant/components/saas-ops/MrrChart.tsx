'use client';

import { Card } from '@kaven/ui-base';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { MRRSnapshot } from '@/types/saas-ops';

interface MrrChartProps {
  current: MRRSnapshot | null;
  history: MRRSnapshot[];
}

export function MrrChart({ current, history }: MrrChartProps) {
  if (!current) {
    return (
      <Card className="p-6 text-center">
        <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No MRR data available</p>
      </Card>
    );
  }

  const previous = history.length > 1 ? history[1] : null;
  const delta = previous ? Number(current.mrrTotal) - Number(previous.mrrTotal) : 0;
  const deltaPercent = previous && Number(previous.mrrTotal) > 0
    ? ((delta / Number(previous.mrrTotal)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
          {delta !== 0 && (
            <span className={`flex items-center gap-1 text-xs font-medium ${
              delta > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {deltaPercent}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold">
          {current.currency} {Number(current.mrrTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ARR: {current.currency} {Number(current.arrProjected).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: 'New', value: current.mrrNewBusiness, color: 'text-green-600' },
          { label: 'Expansion', value: current.mrrExpansion, color: 'text-blue-600' },
          { label: 'Contraction', value: current.mrrContraction, color: 'text-orange-600' },
          { label: 'Churn', value: current.mrrChurn, color: 'text-red-600' },
          { label: 'Reactivation', value: current.mrrReactivation, color: 'text-purple-600' },
        ].map((item) => (
          <Card key={item.label} className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color}`}>
              {Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
