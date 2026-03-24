'use client';

import { useState } from 'react';
import { cn } from '@kaven/ui-base';
import { ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import type { ChartOfAccount } from '@/types/finance';

interface AccountTreeProps {
  accounts: ChartOfAccount[];
  onSelect?: (account: ChartOfAccount) => void;
  selectedId?: string;
}

interface AccountNodeProps {
  account: ChartOfAccount;
  level: number;
  onSelect?: (account: ChartOfAccount) => void;
  selectedId?: string;
}

function AccountNode({ account, level, onSelect, selectedId }: AccountNodeProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = account.children && account.children.length > 0;
  const isSelected = account.id === selectedId;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-muted/50',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect?.(account);
        }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
        tabIndex={0}
        aria-label={`${account.code} ${account.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (hasChildren) setExpanded(!expanded);
            onSelect?.(account);
          }
        }}
      >
        {/* Expand icon */}
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}

        {/* Folder icon */}
        {hasChildren ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 flex-shrink-0 text-amber-500" />
          ) : (
            <Folder className="h-4 w-4 flex-shrink-0 text-amber-500" />
          )
        ) : (
          <span className="h-4 w-4 flex-shrink-0" />
        )}

        {/* Code + Name */}
        <span className="font-mono text-xs text-muted-foreground">{account.code}</span>
        <span className="truncate">{account.name}</span>

        {!account.isActive && (
          <span className="text-xs text-muted-foreground ml-auto">(inactive)</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div role="group">
          {account.children!.map((child) => (
            <AccountNode
              key={child.id}
              account={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountTree({ accounts, onSelect, selectedId }: AccountTreeProps) {
  return (
    <div role="tree" aria-label="Chart of accounts">
      {accounts.map((account) => (
        <AccountNode
          key={account.id}
          account={account}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
