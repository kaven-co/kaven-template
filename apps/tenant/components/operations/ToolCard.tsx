'use client';

import { Card } from '@kaven/ui-base';
import { Wrench, DollarSign, Users } from 'lucide-react';
import type { ToolRegistryItem } from '@/types/operations';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-400',
  TRIAL: 'bg-blue-500/10 text-blue-400',
  SUSPENDED: 'bg-yellow-500/10 text-yellow-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  EVALUATING: 'bg-purple-500/10 text-purple-400',
};

export function ToolCard({ tool }: { tool: ToolRegistryItem }) {
  const utilization = tool.activeUsers && tool.totalSeats
    ? Math.round((tool.activeUsers / tool.totalSeats) * 100)
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-500" />
          <div>
            <h3 className="font-medium text-sm">{tool.name}</h3>
            {tool.vendorName && (
              <p className="text-[10px] text-muted-foreground">{tool.vendorName}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[tool.status] || ''}`}>
          {tool.status}
        </span>
      </div>

      {tool.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{tool.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {tool.currency} {Number(tool.costPerMonth).toFixed(2)}/mo
        </span>
        {utilization !== null && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {tool.activeUsers}/{tool.totalSeats} ({utilization}%)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{tool.category}</span>
        {tool.department && (
          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{tool.department}</span>
        )}
      </div>
    </Card>
  );
}
