'use client';

import type { ContractStatus as ContractStatusType } from '@/types/operations';

const statusConfig: Record<ContractStatusType, { color: string; label: string }> = {
  DRAFT: { color: 'bg-gray-500/10 text-gray-400', label: 'Draft' },
  ACTIVE: { color: 'bg-green-500/10 text-green-400', label: 'Active' },
  SUSPENDED: { color: 'bg-yellow-500/10 text-yellow-400', label: 'Suspended' },
  EXPIRED: { color: 'bg-red-500/10 text-red-400', label: 'Expired' },
  CANCELLED: { color: 'bg-red-500/10 text-red-500', label: 'Cancelled' },
  RENEWED: { color: 'bg-blue-500/10 text-blue-400', label: 'Renewed' },
};

export function ContractStatusBadge({ status }: { status: ContractStatusType }) {
  const config = statusConfig[status] || { color: 'bg-gray-500/10 text-gray-400', label: status };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}
