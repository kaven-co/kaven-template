'use client';

import {
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Star,
  ArrowUpRight,
  Clock,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import type { TimelineEvent } from '@/types/clients';

const iconMap: Record<string, React.ElementType> = {
  EMAIL: Mail,
  CALL: Phone,
  MEETING: Calendar,
  NOTE: FileText,
  MESSAGE: MessageSquare,
  NPS: Star,
  LIFECYCLE_CHANGE: ArrowUpRight,
  ACTIVITY: Activity,
};

interface TimelineItemProps {
  event: TimelineEvent;
}

export function TimelineItem({ event }: TimelineItemProps) {
  const Icon = iconMap[event.sourceType] || Clock;

  return (
    <div className="flex gap-3 py-3">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 w-px bg-border mt-2" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{event.title}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(event.occurredAt), 'PP p')}
          </span>
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
        )}
      </div>
    </div>
  );
}
