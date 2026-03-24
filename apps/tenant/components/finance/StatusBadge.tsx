'use client';

import { Badge } from '@kaven/ui-base';
import type { FinancialEntryStatus } from '@/types/finance';

interface StatusBadgeProps {
  status: FinancialEntryStatus | string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'outline' },
  PENDING: { label: 'Pending', variant: 'destructive' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  RECONCILED: { label: 'Reconciled', variant: 'secondary' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const };

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
