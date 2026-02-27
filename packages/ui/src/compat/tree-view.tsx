'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface TreeViewProps extends React.HTMLAttributes<HTMLUListElement> {
  defaultExpanded?: string[];
  multiSelect?: boolean;
}

const TreeViewContext = React.createContext<{
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  selected: Set<string>;
  toggleSelected: (id: string) => void;
}>({
  expanded: new Set(),
  toggleExpanded: () => {},
  selected: new Set(),
  toggleSelected: () => {},
});

const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(
  ({ className, defaultExpanded = [], multiSelect = false, children, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState(new Set(defaultExpanded));
    const [selected, setSelected] = React.useState<Set<string>>(new Set());

    const toggleExpanded = React.useCallback((id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const toggleSelected = React.useCallback(
      (id: string) => {
        setSelected((prev) => {
          if (multiSelect) {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          }
          return new Set([id]);
        });
      },
      [multiSelect]
    );

    return (
      <TreeViewContext.Provider value={{ expanded, toggleExpanded, selected, toggleSelected }}>
        <ul
          ref={ref}
          role="tree"
          data-slot="tree-view"
          className={cn('w-full', className)}
          {...props}
        >
          {children}
        </ul>
      </TreeViewContext.Provider>
    );
  }
);
TreeView.displayName = 'TreeView';

export interface TreeItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'id'> {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(
  ({ className, id, label, icon, disabled, children, ...props }, ref) => {
    const { expanded, toggleExpanded, selected, toggleSelected } = React.useContext(TreeViewContext);
    const isExpanded = expanded.has(id);
    const isSelected = selected.has(id);
    const hasChildren = React.Children.count(children) > 0;

    return (
      <li
        ref={ref}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        data-slot="tree-item"
        data-disabled={disabled || undefined}
        className={cn('select-none', disabled && 'opacity-50 pointer-events-none', className)}
        {...props}
      >
        <div
          className={cn(
            'flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors text-sm',
            isSelected ? 'bg-primary-lighter text-primary-darker' : 'hover:bg-gray-100 text-text-primary'
          )}
          onClick={() => {
            toggleSelected(id);
            if (hasChildren) toggleExpanded(id);
          }}
        >
          {hasChildren ? (
            <ChevronRight
              className={cn('size-4 shrink-0 text-text-disabled transition-transform', isExpanded && 'rotate-90')}
            />
          ) : (
            <span className="w-4 shrink-0" />
          )}
          {icon && <span className="shrink-0 [&_svg]:size-4 text-text-secondary">{icon}</span>}
          <span className="flex-1 truncate">{label}</span>
        </div>
        {hasChildren && isExpanded && (
          <ul role="group" className="pl-4">
            {children}
          </ul>
        )}
      </li>
    );
  }
);
TreeItem.displayName = 'TreeItem';

export { TreeView, TreeItem };
