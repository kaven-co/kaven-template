'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { RuleCard } from '@/components/ai/RuleCard';
import type { AutomationRule, RuleStatus } from '@/types/ai';

type StatusFilter = 'ALL' | RuleStatus;

export default function AiRulesPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Fetch rules
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['ai-rules', tenant?.id, deferredSearch, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch) params.search = deferredSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/api/v1/ai/rules', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Toggle rule mutation
  const toggleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const res = await api.post(`/api/v1/ai/rules/${ruleId}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-rules'] });
      toast.success('Rule toggled successfully');
    },
    onError: () => {
      toast.error('Failed to toggle rule');
    },
  });

  const rules: AutomationRule[] = rulesData?.data || [];
  const statusFilters: StatusFilter[] = ['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'ARCHIVED'];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ai">
            <Button variant="ghost" size="sm" aria-label="Back to AI dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Automation Rules
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create and manage event-driven automation workflows.
            </p>
          </div>
        </div>
        <Button disabled aria-label="Create new rule">
          <Plus className="mr-2 h-4 w-4" /> New Rule
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search automation rules"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-accent'
              }`}
              aria-label={`Filter by ${status.toLowerCase()}`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Rules list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Zap className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No automation rules found</p>
          <p className="text-sm mt-1">
            {searchQuery
              ? 'Try adjusting your search or filters.'
              : 'Create your first automation rule to get started.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={(id) => toggleMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
