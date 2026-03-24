'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search } from 'lucide-react';
import { ToolCard } from '@/components/operations/ToolCard';
import type { ToolRegistryItem } from '@/types/operations';

export default function ToolsPage() {
  const { tenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const { data, isLoading } = useQuery({
    queryKey: ['tools', tenant?.id, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deferredSearch) params.set('search', deferredSearch);
      params.set('limit', '50');
      const res = await api.get(`/api/v1/operations/tools?${params}`);
      return res.data as { data: ToolRegistryItem[]; meta: { total: number } };
    },
    enabled: !!tenant,
  });

  const tools = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tool Registry</h1>
          <p className="text-muted-foreground text-sm">
            {data?.meta?.total || 0} tools tracked
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Tool
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tools registered yet. Add your first tool.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
