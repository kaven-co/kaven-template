'use client';

import { Card, Badge } from '@kaven/ui-base';
import { Target, ChevronRight, Users, TrendingUp } from 'lucide-react';
import type { Objective, OKRStatus } from '@/types/governance';

const statusConfig: Record<OKRStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ON_TRACK: { label: 'On Track', variant: 'default' },
  AT_RISK: { label: 'At Risk', variant: 'outline' },
  OFF_TRACK: { label: 'Off Track', variant: 'destructive' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'secondary' },
};

const levelColors: Record<string, string> = {
  COMPANY: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  DEPARTMENT: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  TEAM: 'bg-green-500/10 text-green-600 dark:text-green-400',
  INDIVIDUAL: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

interface GoalCardProps {
  objective: Objective;
  onClick?: () => void;
}

export function GoalCard({ objective, onClick }: GoalCardProps) {
  const statusCfg = statusConfig[objective.status] || statusConfig.DRAFT;
  const progress = Math.round(objective.progress);

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[objective.level] || ''}`}>
            {objective.level}
          </span>
        </div>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </div>

      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{objective.title}</h3>
      {objective.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{objective.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {objective._count && (
            <>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {objective._count.keyResults} KRs
              </span>
              {objective._count.children > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {objective._count.children} sub
                </span>
              )}
            </>
          )}
        </div>
        {objective.owner && (
          <span className="text-xs">{objective.owner.name}</span>
        )}
        <ChevronRight className="h-4 w-4" />
      </div>
    </Card>
  );
}
