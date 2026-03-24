'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input } from '@kaven/ui-base';
import { Plus, Search, Megaphone, TrendingUp } from 'lucide-react';
import { CampaignCard } from '@/components/ads/CampaignCard';
import { MetricsChart } from '@/components/ads/MetricsChart';
import type { AdCampaign, AdStatus, AdsMetric, MetricsSummary } from '@/types/ads';

type StatusFilter = 'ALL' | AdStatus;

export default function AdsPage() {
  const { tenant } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['ads-campaigns', tenant?.id, deferredSearch, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch) params.search = deferredSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/api/v1/ads/campaigns', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Fetch metrics summary
  const { data: metricsData } = useQuery({
    queryKey: ['ads-metrics-summary', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ads/metrics');
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const campaigns: AdCampaign[] = campaignsData?.data || [];

  // Compute summary from metrics
  const metricsSummary: MetricsSummary | null = metricsData?.data?.length
    ? metricsData.data.reduce(
        (acc: MetricsSummary, m: AdsMetric) => ({
          impressions: acc.impressions + (m.impressions || 0),
          clicks: acc.clicks + (m.clicks || 0),
          conversions: acc.conversions + (m.conversions || 0),
          spend: acc.spend + (m.spend || 0),
          revenue: acc.revenue + (m.revenue || 0),
          ctr: 0,
          cpc: 0,
          roas: 0,
        }),
        { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, ctr: 0, cpc: 0, roas: 0 },
      )
    : null;

  // Compute derived metrics
  if (metricsSummary) {
    metricsSummary.ctr =
      metricsSummary.impressions > 0
        ? (metricsSummary.clicks / metricsSummary.impressions) * 100
        : 0;
    metricsSummary.cpc =
      metricsSummary.clicks > 0 ? metricsSummary.spend / metricsSummary.clicks : 0;
    metricsSummary.roas =
      metricsSummary.spend > 0 ? metricsSummary.revenue / metricsSummary.spend : 0;
  }

  const statusFilters: StatusFilter[] = ['ALL', 'ACTIVE', 'DRAFT', 'PAUSED', 'ARCHIVED'];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Ads Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your advertising campaigns across platforms.
          </p>
        </div>
        <Button disabled aria-label="Create new campaign">
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Metrics summary */}
      {metricsSummary && <MetricsChart metrics={metricsSummary} />}

      {/* Search and filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search campaigns"
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

      {/* Campaign grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-medium">No campaigns found</p>
          <p className="text-sm mt-1">
            {searchQuery
              ? 'Try adjusting your search or filters.'
              : 'Create your first ad campaign to get started.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
