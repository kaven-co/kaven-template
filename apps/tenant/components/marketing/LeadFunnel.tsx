'use client';

import { Card } from '@kaven/ui-base';

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

interface LeadFunnelProps {
  stages?: FunnelStage[];
}

const defaultStages: FunnelStage[] = [
  { label: 'Leads', count: 1250, color: '#3b82f6' },
  { label: 'MQL', count: 340, color: '#f59e0b' },
  { label: 'SQL', count: 120, color: '#8b5cf6' },
  { label: 'Opportunities', count: 45, color: '#10b981' },
  { label: 'Clients', count: 18, color: '#06b6d4' },
];

export function LeadFunnel({ stages = defaultStages }: LeadFunnelProps) {
  const maxCount = stages[0]?.count || 1;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Lead Funnel</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(20, (stage.count / maxCount) * 100);
          const conversionRate = index > 0
            ? ((stage.count / stages[index - 1].count) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{stage.count.toLocaleString()}</span>
                  {conversionRate && (
                    <span className="text-xs text-muted-foreground">({conversionRate}%)</span>
                  )}
                </div>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color,
                    opacity: 0.8,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
