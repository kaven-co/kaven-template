'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../patterns/utils';

export interface TransferListItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TransferListProps extends React.HTMLAttributes<HTMLDivElement> {
  left: TransferListItem[];
  right: TransferListItem[];
  onTransfer?: (left: TransferListItem[], right: TransferListItem[]) => void;
  leftTitle?: string;
  rightTitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const TransferList = React.forwardRef<HTMLDivElement, TransferListProps>(
  (
    {
      className,
      left: leftItems,
      right: rightItems,
      onTransfer,
      leftTitle = 'Available',
      rightTitle = 'Selected',
      color = 'primary',
      ...props
    },
    ref
  ) => {
    const [leftChecked, setLeftChecked] = React.useState<Set<string>>(new Set());
    const [rightChecked, setRightChecked] = React.useState<Set<string>>(new Set());

    const toggleCheck = (set: Set<string>, setFn: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
      setFn((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const moveRight = () => {
      const toMove = leftItems.filter((i) => leftChecked.has(i.id));
      onTransfer?.(
        leftItems.filter((i) => !leftChecked.has(i.id)),
        [...rightItems, ...toMove]
      );
      setLeftChecked(new Set());
    };

    const moveLeft = () => {
      const toMove = rightItems.filter((i) => rightChecked.has(i.id));
      onTransfer?.(
        [...leftItems, ...toMove],
        rightItems.filter((i) => !rightChecked.has(i.id))
      );
      setRightChecked(new Set());
    };

    const moveAllRight = () => {
      onTransfer?.([], [...rightItems, ...leftItems]);
      setLeftChecked(new Set());
    };

    const moveAllLeft = () => {
      onTransfer?.([...leftItems, ...rightItems], []);
      setRightChecked(new Set());
    };

    const renderList = (
      items: TransferListItem[],
      checked: Set<string>,
      setChecked: React.Dispatch<React.SetStateAction<Set<string>>>,
      title: string
    ) => (
      <div className="flex-1 min-w-[200px] rounded-lg border border-divider">
        <div className="px-3 py-2 border-b border-divider bg-gray-50 rounded-t-lg">
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
          <p className="text-xs text-text-secondary">{checked.size}/{items.length} selected</p>
        </div>
        <ul className="max-h-[300px] overflow-auto p-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-sm',
                checked.has(item.id) ? 'bg-primary-lighter' : 'hover:bg-gray-50',
                item.disabled && 'opacity-50 pointer-events-none'
              )}
              onClick={() => !item.disabled && toggleCheck(checked, setChecked, item.id)}
            >
              <input
                type="checkbox"
                checked={checked.has(item.id)}
                disabled={item.disabled}
                readOnly
                className="rounded border-gray-300"
              />
              <span className="truncate">{item.label}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-4 text-center text-xs text-text-disabled">No items</li>
          )}
        </ul>
      </div>
    );

    return (
      <div
        ref={ref}
        data-slot="transfer-list"
        className={cn('flex items-center gap-3', className)}
        {...props}
      >
        {renderList(leftItems, leftChecked, setLeftChecked, leftTitle)}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={leftItems.length === 0}
            onClick={moveAllRight}
            className="p-1.5 rounded border border-divider hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronsRight className="size-4" />
          </button>
          <button
            type="button"
            disabled={leftChecked.size === 0}
            onClick={moveRight}
            className="p-1.5 rounded border border-divider hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            disabled={rightChecked.size === 0}
            onClick={moveLeft}
            className="p-1.5 rounded border border-divider hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={rightItems.length === 0}
            onClick={moveAllLeft}
            className="p-1.5 rounded border border-divider hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronsLeft className="size-4" />
          </button>
        </div>
        {renderList(rightItems, rightChecked, setRightChecked, rightTitle)}
      </div>
    );
  }
);
TransferList.displayName = 'TransferList';

export { TransferList };
