'use client';

import { Card, CardContent, CardHeader } from '@kaven/ui-base';
import { Calendar, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { FileIcon } from './FileIcon';
import { StatusBadge } from './StatusBadge';
import type { Document } from '@/types/documents';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link href={`/documents/${document.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <FileIcon mimeType={document.mimeType} isRichText={document.isRichText} className="h-5 w-5" />
            </div>
            <StatusBadge status={document.status} />
          </div>
          <h3 className="font-semibold mt-3 line-clamp-1">{document.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {document.description || 'No description'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(document.updatedAt), 'PP')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{document.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{document.downloadCount}</span>
              </div>
            </div>
          </div>
          {document.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {document.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{document.tags.length - 3}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
