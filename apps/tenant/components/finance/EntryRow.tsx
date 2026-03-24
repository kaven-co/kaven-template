'use client';

import { cn } from '@kaven/ui-base';
import { ArrowRightLeft, Calendar, User } from 'lucide-react';
import { AmountDisplay } from './AmountDisplay';
import { StatusBadge } from './StatusBadge';
import type { FinancialEntry } from '@/types/finance';

interface EntryRowProps {
  entry: FinancialEntry;
  onClick?: (entry: FinancialEntry) => void;
}

const TYPE_LABELS: Record<string, string> = {
  revenue: 'Revenue',
  expense: 'Expense',
  investment: 'Investment',
  financial_movement: 'Transfer',
};

export function EntryRow({ entry, onClick }: EntryRowProps) {
  const isTransfer = !!entry.transferPairId;

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border p-4 transition-colors',
        'hover:bg-muted/50 cursor-pointer',
      )}
      onClick={() => onClick?.(entry)}
      role="button"
      tabIndex={0}
      aria-label={`${entry.description || TYPE_LABELS[entry.type]} — ${entry.totalAmount} ${entry.currency}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(entry);
        }
      }}
    >
      {/* Type icon */}
      <div className="flex-shrink-0">
        {isTransfer ? (
          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        ) : (
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              entry.type === 'revenue' ? 'bg-emerald-500' : 'bg-red-500',
            )}
          />
        )}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.description || TYPE_LABELS[entry.type]}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Calendar className="h-3 w-3" />
          <span>{new Date(entry.dateDFC).toLocaleDateString('pt-BR')}</span>
          {entry.client && (
            <>
              <User className="h-3 w-3 ml-1" />
              <span className="truncate">{entry.client.fullName}</span>
            </>
          )}
          {entry.installmentNumber && (
            <span className="text-muted-foreground">
              Installment {entry.installmentNumber}
            </span>
          )}
        </div>
      </div>

      {/* Category (first line) */}
      {entry.lines?.[0]?.chartOfAccount && (
        <div className="hidden md:block text-xs text-muted-foreground max-w-[120px] truncate">
          {entry.lines[0].chartOfAccount.name}
        </div>
      )}

      {/* Status */}
      <div className="flex-shrink-0">
        <StatusBadge status={entry.status} />
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right min-w-[120px]">
        <AmountDisplay
          amount={entry.totalAmount}
          type={entry.type}
          currency={entry.currency}
        />
      </div>
    </div>
  );
}
