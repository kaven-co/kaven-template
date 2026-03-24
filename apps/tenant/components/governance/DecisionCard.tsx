'use client';

import { Card, Badge } from '@kaven/ui-base';
import { Gavel, ThumbsUp, ThumbsDown, Minus, Calendar } from 'lucide-react';
import type { Decision } from '@/types/governance';

const outcomeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  APPROVED: { label: 'Approved', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  DEFERRED: { label: 'Deferred', variant: 'outline' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'secondary' },
};

const typeLabels: Record<string, string> = {
  OPERATIONAL: 'Operational',
  STRATEGIC: 'Strategic',
  FINANCIAL: 'Financial',
  POLICY: 'Policy',
  TECHNICAL: 'Technical',
};

interface DecisionCardProps {
  decision: Decision;
  onClick?: () => void;
}

export function DecisionCard({ decision, onClick }: DecisionCardProps) {
  const outcomeCfg = decision.outcome ? outcomeConfig[decision.outcome] : null;

  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gavel className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-[10px]">
            {typeLabels[decision.type] || decision.type}
          </Badge>
        </div>
        {outcomeCfg && (
          <Badge variant={outcomeCfg.variant}>{outcomeCfg.label}</Badge>
        )}
      </div>

      <h3 className="font-semibold text-sm mb-1">{decision.title}</h3>
      {decision.context && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{decision.context}</p>
      )}

      {/* Voting results */}
      {(decision.votesFor !== undefined || decision.votesAgainst !== undefined) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          {decision.votesFor !== undefined && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3 text-green-500" />
              {decision.votesFor}
            </span>
          )}
          {decision.votesAgainst !== undefined && (
            <span className="flex items-center gap-1">
              <ThumbsDown className="h-3 w-3 text-red-500" />
              {decision.votesAgainst}
            </span>
          )}
          {decision.abstentions !== undefined && decision.abstentions > 0 && (
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3" />
              {decision.abstentions}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(decision.decidedAt).toLocaleDateString()}
        </span>
        {decision.createdBy && <span>{decision.createdBy.name}</span>}
      </div>
    </Card>
  );
}
