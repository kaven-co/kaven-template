'use client';

import { Badge } from '@kaven/ui-base';
import { TrendingUp, Database, DollarSign, Hash, CheckCircle2 } from 'lucide-react';
import type { KeyResult } from '@/types/governance';

const typeIcons: Record<string, React.ReactNode> = {
  NUMERIC: <Hash className="h-3.5 w-3.5" />,
  PERCENT: <TrendingUp className="h-3.5 w-3.5" />,
  BINARY: <CheckCircle2 className="h-3.5 w-3.5" />,
  CURRENCY: <DollarSign className="h-3.5 w-3.5" />,
};

const dataSourceBadges: Record<string, string> = {
  MANUAL: 'Manual',
  FINANCE: 'Finance',
  SALES: 'Sales',
  PROJECTS: 'Projects',
  PEOPLE: 'People',
};

interface KeyResultProgressProps {
  keyResult: KeyResult;
  onClick?: () => void;
}

export function KeyResultProgress({ keyResult, onClick }: KeyResultProgressProps) {
  const progress = Math.round(keyResult.progress);
  const icon = typeIcons[keyResult.type] || typeIcons.NUMERIC;

  const formatValue = (value: number) => {
    if (keyResult.type === 'CURRENCY') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: keyResult.unit || 'BRL',
        minimumFractionDigits: 0,
      }).format(value);
    }
    if (keyResult.type === 'PERCENT') {
      return `${value}%`;
    }
    return `${value}${keyResult.unit ? ` ${keyResult.unit}` : ''}`;
  };

  return (
    <div
      className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium truncate">{keyResult.title}</span>
        </div>
        {keyResult.dataSource !== 'MANUAL' && (
          <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
            <Database className="h-2.5 w-2.5 mr-1" />
            {dataSourceBadges[keyResult.dataSource]}
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 70 ? 'bg-green-500' : progress >= 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Values */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatValue(keyResult.currentValue)} / {formatValue(keyResult.targetValue)}</span>
        <span className="font-medium">{progress}%</span>
      </div>

      {keyResult.owner && (
        <div className="mt-1.5 text-xs text-muted-foreground">
          {keyResult.owner.name}
        </div>
      )}
    </div>
  );
}
