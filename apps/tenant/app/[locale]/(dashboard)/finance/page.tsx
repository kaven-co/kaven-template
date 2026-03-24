'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kaven/ui-base';
import {
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { EntryRow } from '@/components/finance/EntryRow';
import { AmountDisplay } from '@/components/finance/AmountDisplay';
import type { FinancialEntry, FinancialSummary, FinancialEntryStatus, EntryType } from '@/types/finance';

type StatusFilter = 'ALL' | FinancialEntryStatus;
type TypeFilter = 'ALL' | EntryType;

export default function FinancePage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch summary
  const { data: summary } = useQuery<FinancialSummary>({
    queryKey: ['finance-summary', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/reports/summary');
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch entries
  const { data: entriesData, isLoading } = useQuery({
    queryKey: ['finance-entries', tenant?.id, deferredSearch, statusFilter, typeFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' };
      if (deferredSearch) params.search = deferredSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await api.get('/api/v1/finance/entries', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const entries: FinancialEntry[] = entriesData?.data || [];

  // Bulk confirm mutation
  const bulkConfirmMutation = useMutation({
    mutationFn: async (entryIds: string[]) => {
      await api.post('/api/v1/finance/entries/bulk-confirm', { entryIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-entries'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setSelectedIds([]);
      toast.success('Entries confirmed');
    },
    onError: () => toast.error('Failed to confirm entries'),
  });

  const handleEntryClick = (entry: FinancialEntry) => {
    window.location.href = `/finance/${entry.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance</h1>
          <p className="text-muted-foreground">Manage your financial entries and reports</p>
        </div>
        <Button aria-label="Create new financial entry">
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <AmountDisplay amount={summary.cashBalance} className="text-2xl font-bold" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Month)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <AmountDisplay amount={summary.revenueMonth} type="revenue" className="text-2xl font-bold" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses (Month)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <AmountDisplay amount={summary.expensesMonth} type="expense" className="text-2xl font-bold" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Runway</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.runway} days</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search financial entries"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="RECONCILED">Reconciled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-[140px]" aria-label="Filter by type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="financial_movement">Transfer</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => bulkConfirmMutation.mutate(selectedIds)}
            disabled={bulkConfirmMutation.isPending}
            aria-label={`Confirm ${selectedIds.length} selected entries`}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Entry list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No entries found</p>
              <p className="text-muted-foreground">Create your first financial entry to get started.</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onClick={handleEntryClick}
            />
          ))
        )}
      </div>

      {/* Pagination info */}
      {entriesData?.meta && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {entries.length} of {entriesData.meta.total} entries
        </div>
      )}
    </div>
  );
}
