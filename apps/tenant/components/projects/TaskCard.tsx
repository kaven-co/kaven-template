'use client';

import { Card, Badge } from '@kaven/ui-base';
import { Calendar, MessageSquare, Paperclip, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/types/projects';
import { MemberAvatar } from '@/components/projects/MemberAvatar';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-900',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium line-clamp-2 flex-1">{task.title}</h4>
        <Badge className={`text-[10px] ${priorityColors[task.priority]}`}>
          {task.priority}
        </Badge>
      </div>

      {task.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-secondary text-[10px] rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          {task._count && task._count.comments > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task._count.comments}</span>
            </div>
          )}
          {task._count && task._count.attachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              <span>{task._count.attachments}</span>
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        {task.assignee && (
          <MemberAvatar
            name={task.assignee.name}
            avatar={task.assignee.avatar}
            size="sm"
          />
        )}
      </div>
    </Card>
  );
}
