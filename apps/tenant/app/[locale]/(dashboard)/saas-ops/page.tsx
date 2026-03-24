'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { BarChart3, TrendingDown, Zap, Activity } from 'lucide-react';
import { MrrChart } from '@/components/saas-ops/MrrChart';
import { ChurnReasons } from '@/components/saas-ops/ChurnReasons';
import type { MRRSnapshot, ChurnRate, ChurnReasonSummary, ExpansionSummary, TopFeature } from '@/types/saas-ops';

export default function SaasOpsPage() {
  const { tenant } = useTenant();

  // Fetch current MRR
  const { data: currentMrr } = useQuery({
    queryKey: ['saas-ops-mrr-current', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/mrr/current');
      return res.data as MRRSnapshot | null;
    },
    enabled: !!tenant?.id,
  });

  // Fetch MRR history
  const { data: mrrHistory } = useQuery({
    queryKey: ['saas-ops-mrr-history', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/mrr/history');
      return (res.data?.data || []) as MRRSnapshot[];
    },
    enabled: !!tenant?.id,
  });

  // Fetch churn rate
  const { data: churnRate } = useQuery({
    queryKey: ['saas-ops-churn-rate', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/churn/rate');
      return res.data as ChurnRate;
    },
    enabled: !!tenant?.id,
  });

  // Fetch churn reasons
  const { data: churnReasons } = useQuery({
    queryKey: ['saas-ops-churn-reasons', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/churn/reasons');
      return (res.data?.data || []) as ChurnReasonSummary[];
    },
    enabled: !!tenant?.id,
  });

  // Fetch expansion summary
  const { data: expansionSummary } = useQuery({
    queryKey: ['saas-ops-expansion-summary', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/revenue/summary');
      return res.data as ExpansionSummary;
    },
    enabled: !!tenant?.id,
  });

  // Fetch top features
  const { data: topFeatures } = useQuery({
    queryKey: ['saas-ops-top-features', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/saas-ops/features/top');
      return (res.data?.data || []) as TopFeature[];
    },
    enabled: !!tenant?.id,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          SaaS Operations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revenue intelligence, churn analysis and feature adoption
        </p>
      </div>

      {/* MRR Section */}
      <MrrChart current={currentMrr || null} history={mrrHistory || []} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Churn Rate */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold">Churn Rate (30d)</h3>
          </div>
          <p className="text-2xl font-bold">
            {churnRate ? `${churnRate.churnRate}%` : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {churnRate ? `${churnRate.churnCount} churned / ${churnRate.activeSubscribers} active` : 'No data'}
          </p>
        </Card>

        {/* Expansion Revenue */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-green-500" />
            <h3 className="text-sm font-semibold">Expansion Revenue (30d)</h3>
          </div>
          <p className="text-2xl font-bold">
            {expansionSummary
              ? `$${expansionSummary.totalMrrDelta.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : '--'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {expansionSummary ? `${expansionSummary.totalExpansions} events` : 'No data'}
          </p>
        </Card>

        {/* Active Subscribers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold">Active Subscribers</h3>
          </div>
          <p className="text-2xl font-bold">
            {currentMrr ? currentMrr.activeSubscribers : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ARPU: {currentMrr ? `$${Number(currentMrr.arpu).toFixed(2)}` : '--'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Reasons */}
        <ChurnReasons reasons={churnReasons || []} />

        {/* Top Features */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Top Features (30d)</h3>
          {(topFeatures || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No feature data available</p>
          ) : (
            <div className="space-y-2">
              {(topFeatures || []).slice(0, 10).map((feature, idx) => (
                <div key={feature.featureKey} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                    <span className="font-medium">{feature.featureKey}</span>
                    <span className="text-xs text-muted-foreground">{feature.featureModule}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {feature.totalEvents.toLocaleString()} events
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
