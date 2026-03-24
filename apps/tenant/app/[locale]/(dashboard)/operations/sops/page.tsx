'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { SOPCard } from '@/components/operations/SOPCard';
import type { SOP } from '@/types/operations';

type ViewMode = 'grid' | 'list';

const statusFilters: Array<{ value: string; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function SOPsPage() {
  const { tenant } = useTenant();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['sops', tenant?.id, deferredSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deferredSearch) params.set('search', deferredSearch);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('limit', '50');
      const res = await api.get(`/api/v1/operations/sops?${params}`);
      return res.data as { data: SOP[]; meta: { total: number } };
    },
    enabled: !!tenant?.id,
  });

  const sops = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SOPs</h1>
          <p className="text-muted-foreground text-sm">
            {data?.meta?.total || 0} standard operating procedures
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New SOP
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SOPs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1">
          {statusFilters.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatusFilter(sf.value)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === sf.value
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : sops.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No SOPs found. Create your first SOP to get started.</p>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-2'
        }>
          {sops.map((sop) => (
            <SOPCard key={sop.id} sop={sop} />
          ))}
        </div>
      )}
    </div>
  );
}
