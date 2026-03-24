'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search, Briefcase, AlertTriangle } from 'lucide-react';
import { CaseCard } from '@/components/case-matter/CaseCard';
import { DeadlineList } from '@/components/case-matter/DeadlineList';
import { TimerWidget } from '@/components/case-matter/TimerWidget';
import type { Case, CaseStatus, CaseDeadline, CaseTimeEntry } from '@/types/case-matter';
import Link from 'next/link';

type StatusFilter = 'ALL' | CaseStatus;

export default function CaseMatterPage() {
  const { tenant } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Fetch cases
  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases', tenant?.id, deferredSearch, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch) params.search = deferredSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/api/v1/case-matter/cases', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch upcoming deadlines
  const { data: deadlinesData } = useQuery({
    queryKey: ['case-deadlines-upcoming', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/case-matter/deadlines/upcoming', { params: { days: '7' } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch active timer
  const { data: activeTimer } = useQuery({
    queryKey: ['case-active-timer', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/case-matter/time/active');
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const cases: Case[] = casesData?.data || [];
  const deadlines: CaseDeadline[] = deadlinesData?.data || [];

  const statusFilters: StatusFilter[] = ['ALL', 'INTAKE', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'ARCHIVED'];

  const handleStartTimer = () => {
    // TODO: Open start timer modal
  };

  const handleStopTimer = async (id: string) => {
    await api.post(`/api/v1/case-matter/time/${id}/stop`, {});
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Case Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage legal cases, deadlines and time tracking
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Timer Widget */}
      <TimerWidget
        activeTimer={activeTimer as CaseTimeEntry | null}
        onStart={handleStartTimer}
        onStop={handleStopTimer}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {statusFilters.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Cases grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </Card>
              ))}
            </div>
          ) : cases.length === 0 ? (
            <Card className="p-8 text-center">
              <Briefcase className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No cases found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cases.map((c) => (
                <Link key={c.id} href={`case-matter/${c.id}`}>
                  <CaseCard caseItem={c} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming deadlines */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Upcoming Deadlines (7 days)
          </h2>
          <DeadlineList deadlines={deadlines} />
        </div>
      </div>
    </div>
  );
}
