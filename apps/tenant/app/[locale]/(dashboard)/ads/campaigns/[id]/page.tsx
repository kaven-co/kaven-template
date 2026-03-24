'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@kaven/ui-base';
import { ArrowLeft, Calendar, DollarSign, Layers, Target, Eye, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { MetricsChart } from '@/components/ads/MetricsChart';
import type { AdCampaign, AdsMetric, MetricsSummary } from '@/types/ads';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-green-500/10 text-green-600',
  PAUSED: 'bg-yellow-500/10 text-yellow-600',
  ARCHIVED: 'bg-gray-500/10 text-gray-600',
  ERROR: 'bg-red-500/10 text-red-600',
};

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { tenant } = useTenant();

  // Fetch campaign detail
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['ads-campaign', tenant?.id, id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/ads/campaigns/${id}`);
      return res.data as AdCampaign;
    },
    enabled: !!tenant?.id && !!id,
  });

  // Fetch campaign metrics
  const { data: metricsData } = useQuery({
    queryKey: ['ads-campaign-metrics', tenant?.id, id],
    queryFn: async () => {
      const res = await api.get('/api/v1/ads/metrics', { params: { campaignId: id } });
      return res.data;
    },
    enabled: !!tenant?.id && !!id,
  });

  const metrics: AdsMetric[] = metricsData?.data || [];

  // Compute summary
  const metricsSummary: MetricsSummary = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      conversions: acc.conversions + m.conversions,
      spend: acc.spend + m.spend,
      revenue: acc.revenue + m.revenue,
      ctr: 0,
      cpc: 0,
      roas: 0,
    }),
    { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, ctr: 0, cpc: 0, roas: 0 },
  );

  metricsSummary.ctr =
    metricsSummary.impressions > 0
      ? (metricsSummary.clicks / metricsSummary.impressions) * 100
      : 0;
  metricsSummary.cpc =
    metricsSummary.clicks > 0 ? metricsSummary.spend / metricsSummary.clicks : 0;
  metricsSummary.roas =
    metricsSummary.spend > 0 ? metricsSummary.revenue / metricsSummary.spend : 0;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Campaign not found</p>
        <Link href="/ads">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ads">
            <Button variant="ghost" size="sm" aria-label="Back to campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[campaign.status] || ''}`}
              >
                {campaign.status}
              </span>
            </div>
            {campaign.account && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {campaign.account.platform} - {campaign.account.accountName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Campaign details */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Objective</span>
            </div>
            <p className="font-medium capitalize">
              {campaign.objective?.toLowerCase().replace('_', ' ') || 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Daily Budget</span>
            </div>
            <p className="font-medium">
              {campaign.dailyBudget ? `$${campaign.dailyBudget.toFixed(2)}` : 'No limit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs">Ad Sets</span>
            </div>
            <p className="font-medium">{campaign._count?.adSets || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="font-medium text-sm">
              {campaign.startDate
                ? `${format(new Date(campaign.startDate), 'PP')} - ${campaign.endDate ? format(new Date(campaign.endDate), 'PP') : 'Ongoing'}`
                : 'Not scheduled'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance metrics */}
      {metrics.length > 0 && <MetricsChart metrics={metricsSummary} />}

      {/* Creatives placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Creatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Creatives associated with this campaign will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
