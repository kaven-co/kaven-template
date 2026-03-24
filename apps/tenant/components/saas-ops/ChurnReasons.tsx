'use client';

import { Card } from '@kaven/ui-base';
import { AlertCircle } from 'lucide-react';
import type { ChurnReasonSummary } from '@/types/saas-ops';

const reasonLabels: Record<string, string> = {
  PRICE: 'Price',
  FEATURES: 'Missing Features',
  COMPETITOR: 'Competitor',
  SUPPORT: 'Support Issues',
  NOT_USING: 'Not Using',
  BUG: 'Bug/Technical',
  BUSINESS_CLOSED: 'Business Closed',
  OTHER: 'Other',
};

interface ChurnReasonsProps {
  reasons: ChurnReasonSummary[];
}

export function ChurnReasons({ reasons }: ChurnReasonsProps) {
  if (reasons.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No churn data available</p>
      </Card>
    );
  }

  const totalCount = reasons.reduce((acc, r) => acc + r.count, 0);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Churn Reasons</h3>
      <div className="space-y-2">
        {reasons.map((reason) => {
          const percentage = totalCount > 0 ? ((reason.count / totalCount) * 100).toFixed(0) : '0';
          return (
            <div key={reason.reason} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-muted-foreground w-28 truncate">
                  {reasonLabels[reason.reason] || reason.reason}
                </span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium ml-2 w-12 text-right">
                {reason.count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
