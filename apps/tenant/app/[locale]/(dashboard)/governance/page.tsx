'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Input,
  Badge,
} from '@kaven/ui-base';
import {
  Plus,
  Search,
  Target,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';
import { GoalCard } from '@/components/governance/GoalCard';
import { KeyResultProgress } from '@/components/governance/KeyResultProgress';
import type { OKRCycle, Objective } from '@/types/governance';

export default function GovernancePage() {
  const { tenant } = useTenant();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('');

  // Fetch OKR cycles
  const { data: cyclesData } = useQuery({
    queryKey: ['governance', 'cycles', tenant?.id],
    queryFn: () => api.get('/api/v1/governance/cycles?status=ACTIVE').then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const cycles: OKRCycle[] = cyclesData?.data || [];
  const activeCycleId = selectedCycleId || cycles[0]?.id;

  // Fetch objectives for selected cycle
  const { data: objectivesData, isLoading } = useQuery({
    queryKey: ['governance', 'objectives', tenant?.id, activeCycleId, searchQuery, levelFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeCycleId) params.set('cycleId', activeCycleId);
      if (searchQuery) params.set('search', searchQuery);
      if (levelFilter) params.set('level', levelFilter);
      params.set('limit', '50');
      return api.get(`/api/v1/governance/objectives?${params}`).then((r) => r.data);
    },
    enabled: !!tenant?.id,
  });

  const objectives: Objective[] = objectivesData?.data || [];

  // Group objectives by level
  const companyObjectives = objectives.filter((o) => o.level === 'COMPANY');
  const departmentObjectives = objectives.filter((o) => o.level === 'DEPARTMENT');
  const teamObjectives = objectives.filter((o) => o.level === 'TEAM');
  const individualObjectives = objectives.filter((o) => o.level === 'INDIVIDUAL');

  const levels = ['COMPANY', 'DEPARTMENT', 'TEAM', 'INDIVIDUAL'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OKRs</h1>
          <p className="text-muted-foreground">Objectives and Key Results</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Objective
        </Button>
      </div>

      {/* Cycle Selector */}
      {cycles.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {cycles.map((cycle) => (
            <Button
              key={cycle.id}
              variant={activeCycleId === cycle.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCycleId(cycle.id)}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {cycle.name}
              {cycle._count && (
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {cycle._count.objectives}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          <Button
            variant={levelFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLevelFilter('')}
          >
            <Filter className="h-3.5 w-3.5 mr-1" /> All
          </Button>
          {levels.map((level) => (
            <Button
              key={level}
              variant={levelFilter === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLevelFilter(level)}
            >
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Objectives Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : objectives.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">No objectives yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first objective to start tracking your team&apos;s progress.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Objective
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Company Level */}
          {companyObjectives.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" /> Company Objectives
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companyObjectives.map((obj) => (
                  <GoalCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}

          {/* Department Level */}
          {departmentObjectives.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Department Objectives
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departmentObjectives.map((obj) => (
                  <GoalCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}

          {/* Team Level */}
          {teamObjectives.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Team Objectives
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teamObjectives.map((obj) => (
                  <GoalCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}

          {/* Individual Level */}
          {individualObjectives.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Individual Objectives
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {individualObjectives.map((obj) => (
                  <GoalCard key={obj.id} objective={obj} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
