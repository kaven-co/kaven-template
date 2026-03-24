'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@kaven/ui-base';
import { Bot, Zap, DollarSign, Clock, Brain } from 'lucide-react';
import Link from 'next/link';
import { AgentUsageCard } from '@/components/ai/AgentUsageCard';
import type { TelemetryStats, CostBudget, AgentAction } from '@/types/ai';

export default function AiDashboardPage() {
  const { tenant } = useTenant();

  // Fetch telemetry stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['ai-telemetry-stats', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/telemetry/stats');
      return res.data as TelemetryStats;
    },
    enabled: !!tenant?.id,
  });

  // Fetch recent actions
  const { data: actionsData } = useQuery({
    queryKey: ['ai-recent-actions', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/actions', { params: { limit: '5' } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch active rules count
  const { data: rulesData } = useQuery({
    queryKey: ['ai-rules-count', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/rules', { params: { limit: '1', isEnabled: 'true' } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch budget status
  const { data: budgetsData } = useQuery({
    queryKey: ['ai-budgets', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ai/budgets', { params: { isActive: 'true' } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const recentActions = actionsData?.data || [];
  const activeRulesCount = rulesData?.meta?.total || 0;
  const activeBudgets = budgetsData?.data || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI Automation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor AI usage, costs, and automation rules.
        </p>
      </div>

      {/* Quick stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs">Total API Calls</span>
            </div>
            <p className="text-2xl font-semibold">
              {isLoading ? '...' : (stats?.totalCalls || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Cost</span>
            </div>
            <p className="text-2xl font-semibold">
              {isLoading ? '...' : `$${(stats?.totalCostUsd || 0).toFixed(2)}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Bot className="h-4 w-4" />
              <span className="text-xs">Active Rules</span>
            </div>
            <p className="text-2xl font-semibold">{activeRulesCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Avg Latency</span>
            </div>
            <p className="text-2xl font-semibold">
              {isLoading ? '...' : `${stats?.avgLatencyMs || 0}ms`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage card */}
      {stats && <AgentUsageCard stats={stats} />}

      {/* Navigation links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/ai/rules">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {activeRulesCount} active rules. Create and manage automation workflows.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeBudgets.length > 0 ? (
              <div className="space-y-2">
                {activeBudgets.slice(0, 3).map((b: CostBudget) => {
                  const usage = Number(b.budgetUsd) > 0
                    ? (Number(b.spentUsd) / Number(b.budgetUsd)) * 100
                    : 0;
                  return (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {b.module || 'Global'} ({b.period})
                      </span>
                      <span className={usage > 80 ? 'text-red-500 font-medium' : ''}>
                        ${Number(b.spentUsd).toFixed(2)} / ${Number(b.budgetUsd).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active budgets configured.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent actions */}
      {recentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Agent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions.map((action: AgentAction) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                >
                  <div>
                    <span className="font-medium">{action.agentId}</span>
                    <span className="text-muted-foreground mx-2">{action.actionType}</span>
                    <span className="text-xs text-muted-foreground">({action.module})</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      action.success
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {action.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
