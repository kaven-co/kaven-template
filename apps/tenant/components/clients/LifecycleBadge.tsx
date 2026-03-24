'use client';

import { Badge } from '@kaven/ui-base';
import type { LifecycleStage } from '@/types/clients';

const stageConfig: Record<LifecycleStage, { label: string; className: string }> = {
  LEAD: { label: 'Lead', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  MQL: { label: 'MQL', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  SQL: { label: 'SQL', className: 'bg-purple-100 text-purple-700 border-purple-300' },
  OPPORTUNITY: { label: 'Opportunity', className: 'bg-amber-100 text-amber-700 border-amber-300' },
  ACTIVE_CLIENT: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-300' },
  AT_RISK: { label: 'At Risk', className: 'bg-orange-100 text-orange-700 border-orange-300' },
  CHURNED: { label: 'Churned', className: 'bg-red-100 text-red-700 border-red-300' },
  ADVOCATE: { label: 'Advocate', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
};

interface LifecycleBadgeProps {
  stage: LifecycleStage;
}

export function LifecycleBadge({ stage }: LifecycleBadgeProps) {
  const config = stageConfig[stage] || { label: stage, className: '' };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
