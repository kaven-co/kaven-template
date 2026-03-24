'use client';

import { Card } from '@kaven/ui-base';
import { FileText, Clock, CheckCircle, Users } from 'lucide-react';
import type { SOP } from '@/types/operations';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400',
  REVIEW: 'bg-yellow-500/10 text-yellow-400',
  APPROVED: 'bg-blue-500/10 text-blue-400',
  ACTIVE: 'bg-green-500/10 text-green-400',
  DEPRECATED: 'bg-orange-500/10 text-orange-400',
  ARCHIVED: 'bg-gray-500/10 text-gray-500',
};

export function SOPCard({ sop }: { sop: SOP }) {
  return (
    <Link href={`/operations/sops/${sop.id}`}>
      <Card className="p-4 hover:border-amber-500/30 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-500" />
            <h3 className="font-medium text-sm truncate">{sop.title}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sop.status] || ''}`}>
            {sop.status}
          </span>
        </div>

        {sop.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{sop.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {sop._count?.steps || 0} steps
          </span>
          {sop.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {sop.estimatedMinutes}min
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {sop._count?.executions || 0} runs
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{sop.category}</span>
          {sop.department && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{sop.department}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
