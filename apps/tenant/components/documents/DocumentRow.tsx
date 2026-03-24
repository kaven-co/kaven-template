'use client';

import { Calendar, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { FileIcon } from './FileIcon';
import { StatusBadge } from './StatusBadge';
import type { Document } from '@/types/documents';

interface DocumentRowProps {
  document: Document;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentRow({ document }: DocumentRowProps) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0"
    >
      <div className="bg-primary/10 p-1.5 rounded text-primary">
        <FileIcon mimeType={document.mimeType} isRichText={document.isRichText} className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.title}</p>
        {document.tags.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {document.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <StatusBadge status={document.status} />

      <span className="text-xs text-muted-foreground w-24 text-right hidden md:block">
        {document.owner?.name || 'Unknown'}
      </span>

      <span className="text-xs text-muted-foreground w-20 text-right hidden lg:block">
        {formatFileSize(document.fileSize)}
      </span>

      <div className="flex items-center gap-3 text-xs text-muted-foreground w-20 justify-end hidden md:flex">
        <span className="flex items-center gap-0.5">
          <Eye className="h-3 w-3" />
          {document.viewCount}
        </span>
        <span className="flex items-center gap-0.5">
          <Download className="h-3 w-3" />
          {document.downloadCount}
        </span>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground w-24 justify-end">
        <Calendar className="h-3 w-3" />
        <span>{format(new Date(document.updatedAt), 'PP')}</span>
      </div>
    </Link>
  );
}
