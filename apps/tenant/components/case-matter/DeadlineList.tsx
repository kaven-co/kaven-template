'use client';

import { Card } from '@kaven/ui-base';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { CaseDeadline } from '@/types/case-matter';

interface DeadlineListProps {
  deadlines: CaseDeadline[];
}

export function DeadlineList({ deadlines }: DeadlineListProps) {
  if (deadlines.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deadlines.map((deadline) => {
        const dueDate = new Date(deadline.dueDate);
        const now = new Date();
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysUntil <= 3 && !deadline.isFulfilled;

        return (
          <Card
            key={deadline.id}
            className={`p-3 flex items-center justify-between ${
              isUrgent ? 'border-red-300 dark:border-red-700' : ''
            } ${deadline.isFulfilled ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-3">
              {deadline.isFulfilled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : isUrgent ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{deadline.title}</p>
                {deadline.case && (
                  <p className="text-xs text-muted-foreground">{deadline.case.title}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-muted-foreground'}`}>
                {dueDate.toLocaleDateString()}
              </p>
              {!deadline.isFulfilled && (
                <p className={`text-xs ${isUrgent ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
