'use client';

import { Card, CardContent, CardHeader } from '@kaven/ui-base';
import { Zap, Play, Pause, Clock, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import type { AutomationRule } from '@/types/ai';

interface RuleCardProps {
  rule: AutomationRule;
  onToggle?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-600',
  PAUSED: 'bg-yellow-500/10 text-yellow-600',
  DRAFT: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-gray-500/10 text-gray-600',
  ERROR: 'bg-red-500/10 text-red-600',
};

export function RuleCard({ rule, onToggle }: RuleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold line-clamp-1">{rule.name}</h3>
              {rule.trigger && (
                <p className="text-xs text-muted-foreground">
                  Trigger: {rule.trigger.eventType}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[rule.status] || ''}`}
            >
              {rule.status}
            </span>
            {onToggle && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(rule.id);
                }}
                className="p-1 rounded hover:bg-accent transition-colors"
                aria-label={rule.isEnabled ? 'Pause rule' : 'Activate rule'}
              >
                {rule.isEnabled ? (
                  <Pause className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Play className="h-4 w-4 text-green-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rule.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {rule.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {rule.steps && rule.steps.length > 0 && (
            <div className="flex items-center gap-1" aria-label={`${rule.steps.length} steps`}>
              <GitBranch className="h-3 w-3" />
              <span>{rule.steps.length} steps</span>
            </div>
          )}
          {rule._count && (
            <div className="flex items-center gap-1" aria-label={`${rule._count.runs} runs`}>
              <Play className="h-3 w-3" />
              <span>{rule._count.runs} runs</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto" aria-label="Last updated">
            <Clock className="h-3 w-3" />
            <span>{format(new Date(rule.updatedAt), 'PP')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
