import * as React from 'react';
import { FeatureLimitCard } from '../atoms/feature-limit-card';
import { cn } from '../patterns/utils';

export interface PlanUsageFeature {
  name: string;
  current: number;
  limit: number;
  unit?: string;
}

export interface PlanUsageSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  planName: string;
  features: PlanUsageFeature[];
}

export function PlanUsageSummary({ planName, features, className, ...props }: PlanUsageSummaryProps) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Plano: <span className="text-primary">{planName}</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Uso atual dos limites do seu plano
        </p>
      </div>

      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum limite de feature configurado para este plano.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureLimitCard
              key={feature.name}
              name={feature.name}
              current={feature.current}
              limit={feature.limit}
              unit={feature.unit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
