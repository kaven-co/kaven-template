'use client';

import { Card } from '@kaven/ui-base';
import { Briefcase, Clock, Users, AlertTriangle } from 'lucide-react';
import type { Case, CaseStatus } from '@/types/case-matter';

const statusColors: Record<CaseStatus, string> = {
  INTAKE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  ARCHIVED: 'bg-gray-50 text-gray-500 dark:bg-gray-950 dark:text-gray-400',
};

interface CaseCardProps {
  caseItem: Case;
  onClick?: () => void;
}

export function CaseCard({ caseItem, onClick }: CaseCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm truncate max-w-[200px]">{caseItem.title}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[caseItem.status]}`}>
          {caseItem.status}
        </span>
      </div>

      {caseItem.caseNumber && (
        <p className="text-xs text-muted-foreground mb-2">#{caseItem.caseNumber}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {caseItem._count && (
          <>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {caseItem._count.parties}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {caseItem._count.timeEntries}
            </span>
            {caseItem._count.deadlines > 0 && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {caseItem._count.deadlines}
              </span>
            )}
          </>
        )}
      </div>

      {caseItem.leadAttorney && (
        <p className="text-xs text-muted-foreground mt-2">
          {caseItem.leadAttorney.name}
        </p>
      )}
    </Card>
  );
}
