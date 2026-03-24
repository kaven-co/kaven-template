'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Badge } from '@kaven/ui-base';
import { History, GitBranch } from 'lucide-react';
import { format } from 'date-fns';
import type { DocumentVersion } from '@/types/documents';

interface VersionHistoryProps {
  documentId: string;
}

export function VersionHistory({ documentId }: VersionHistoryProps) {
  const { data: versions, isLoading } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/documents/${documentId}/versions`);
      return res.data?.data || [];
    },
  });

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        Version History
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted/50 animate-pulse rounded" />
          ))}
        </div>
      ) : versions?.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No versions recorded.</p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {versions?.map((version: DocumentVersion, index: number) => (
            <div
              key={version.id}
              className="flex items-start gap-2 p-2 rounded hover:bg-accent/50 transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">v{version.versionNumber}</span>
                  {version.label && (
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      {version.label}
                    </Badge>
                  )}
                  {index === 0 && (
                    <Badge variant="default" className="text-xs py-0 h-5">
                      Current
                    </Badge>
                  )}
                </div>
                {version.changeLog && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {version.changeLog}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{version.creator?.name || 'Unknown'}</span>
                  <span>&middot;</span>
                  <span>{format(new Date(version.createdAt), 'PP')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
