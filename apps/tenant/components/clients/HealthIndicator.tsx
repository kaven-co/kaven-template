'use client';

import type { HealthCategory } from '@/types/clients';

const categoryConfig: Record<HealthCategory, { color: string; label: string }> = {
  HEALTHY: { color: 'bg-green-500', label: 'Healthy' },
  AT_RISK: { color: 'bg-orange-500', label: 'At Risk' },
  CRITICAL: { color: 'bg-red-500', label: 'Critical' },
};

interface HealthIndicatorProps {
  score: number;
  category: HealthCategory;
  showLabel?: boolean;
}

export function HealthIndicator({ score, category, showLabel = false }: HealthIndicatorProps) {
  const config = categoryConfig[category] || categoryConfig.HEALTHY;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div className={`h-3 w-3 rounded-full ${config.color}`} />
        <span className="ml-1.5 text-xs font-medium tabular-nums">{score}</span>
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
