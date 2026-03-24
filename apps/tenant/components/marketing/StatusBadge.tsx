'use client';

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  SENDING: { label: 'Sending', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  SENT: { label: 'Sent', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  PAUSED: { label: 'Paused', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ARCHIVED: { label: 'Archived', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20' },
  ACTIVE: { label: 'Active', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    color: 'text-muted-foreground bg-muted border-border',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
}
