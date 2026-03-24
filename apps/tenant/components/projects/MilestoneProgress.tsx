'use client';

import { Badge } from '@kaven/ui-base';
import { Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import type { Milestone } from '@/types/projects';

interface MilestoneProgressProps {
  milestone: Milestone;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

export function MilestoneProgress({ milestone }: MilestoneProgressProps) {
  const progress =
    milestone.totalTasks > 0
      ? Math.round((milestone.completedTasks / milestone.totalTasks) * 100)
      : 0;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">{milestone.title}</h4>
        </div>
        <Badge className={statusColors[milestone.status]}>
          {milestone.status.replace('_', ' ')}
        </Badge>
      </div>

      {milestone.description && (
        <p className="text-xs text-muted-foreground mb-3">{milestone.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>
            {milestone.completedTasks}/{milestone.totalTasks} tasks
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary rounded-full h-1.5 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {milestone.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(milestone.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        {milestone.triggerInvoice && (
          <span className="text-green-600">
            Auto-invoice{' '}
            {milestone.invoicePercentage
              ? `${milestone.invoicePercentage}%`
              : milestone.invoiceAmount
                ? `${milestone.invoiceAmount}`
                : ''}
          </span>
        )}
      </div>
    </div>
  );
}
