'use client';

import { Card } from '@kaven/ui-base';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import type { OneOnOne } from '@/types/people';

interface OneOnOneCardProps {
  oneOnOne: OneOnOne;
  onClick?: () => void;
}

export function OneOnOneCard({ oneOnOne, onClick }: OneOnOneCardProps) {
  const isCompleted = !!oneOnOne.completedAt;
  const isCancelled = oneOnOne.isCancelled;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : isCancelled ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Calendar className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm font-medium">
              {formatDate(oneOnOne.scheduledAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>{oneOnOne.employee?.fullName}</span>
            <span className="text-muted-foreground/50">with</span>
            <span>{oneOnOne.manager?.fullName}</span>
          </div>

          {oneOnOne.duration && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{oneOnOne.duration} min</span>
            </div>
          )}

          {oneOnOne.agenda && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {oneOnOne.agenda}
            </p>
          )}

          {oneOnOne.actionItems && Array.isArray(oneOnOne.actionItems) && (
            <div className="mt-2 text-xs text-muted-foreground">
              {oneOnOne.actionItems.length} action items
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
