'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button } from '@kaven/ui-base';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from 'lucide-react';
import type { Folder as FolderType } from '@/types/documents';

interface FolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
}

interface FolderNodeProps {
  folder: FolderType;
  level: number;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

function FolderNode({ folder, level, selectedFolderId, onSelectFolder }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const { tenant } = useTenant();

  const { data: children } = useQuery({
    queryKey: ['folders', folder.id, 'children', tenant?.id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/folders/${folder.id}/children`);
      return res.data?.data || [];
    },
    enabled: expanded && !!tenant?.id,
  });

  const isSelected = selectedFolderId === folder.id;
  const hasChildren = (folder._count?.children || 0) > 0;

  return (
    <div>
      <div
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md hover:bg-accent/50 transition-colors ${
          isSelected ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
              }
            }}
            className="p-0.5 hover:bg-accent rounded cursor-pointer"
            aria-label={expanded ? 'Collapse folder' : 'Expand folder'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4.5" />
        )}
        <button
          onClick={() => onSelectFolder(folder.id)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
        >
          {expanded ? (
            <FolderOpen className="h-4 w-4 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate flex-1">{folder.name}</span>
          {(folder._count?.documents || 0) > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {folder._count?.documents}
            </span>
          )}
        </button>
      </div>

      {expanded && children?.map((child: FolderType) => (
        <FolderNode
          key={child.id}
          folder={child}
          level={level + 1}
          selectedFolderId={selectedFolderId}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </div>
  );
}

export function FolderTree({ selectedFolderId, onSelectFolder, onCreateFolder }: FolderTreeProps) {
  const { tenant } = useTenant();

  const { data: rootFolders, isLoading } = useQuery({
    queryKey: ['folders', 'root', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/folders', { params: { root: true } });
      return res.data?.data || [];
    },
    enabled: !!tenant?.id,
  });

  return (
    <div className="w-[250px] border-r shrink-0 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h4 className="text-sm font-semibold">Folders</h4>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCreateFolder}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-2 overflow-y-auto flex-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent/50 transition-colors ${
            selectedFolderId === null ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>All Documents</span>
        </button>

        {isLoading ? (
          <div className="space-y-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 bg-muted/50 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          rootFolders?.map((folder: FolderType) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              level={0}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))
        )}
      </div>
    </div>
  );
}
