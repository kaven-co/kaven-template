'use client';

import { Badge } from '@kaven/ui-base';

type DocumentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'NEEDS_REVIEW';

const statusConfig: Record<DocumentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  PUBLISHED: { label: 'Published', variant: 'default' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
  NEEDS_REVIEW: { label: 'Needs Review', variant: 'destructive' },
};

interface StatusBadgeProps {
  status: DocumentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
