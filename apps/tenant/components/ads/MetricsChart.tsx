'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kaven/ui-base';
import { TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, Target } from 'lucide-react';
import type { MetricsSummary } from '@/types/ads';

interface MetricsChartProps {
  metrics: MetricsSummary;
}

function MetricItem({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="flex flex-col gap-1" aria-label={`${label}: ${value}`}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-semibold">{value}</span>
        {trend && trend !== 'neutral' && (
          <span
            className={`flex items-center ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export function MetricsChart({ metrics }: MetricsChartProps) {
  const formatNumber = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}K`
        : n.toString();

  const formatCurrency = (n: number) => `$${n.toFixed(2)}`;
  const formatPercent = (n: number) => `${n.toFixed(2)}%`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Performance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricItem
            label="Impressions"
            value={formatNumber(metrics.impressions)}
            icon={Eye}
          />
          <MetricItem
            label="Clicks"
            value={formatNumber(metrics.clicks)}
            icon={MousePointerClick}
          />
          <MetricItem
            label="Conversions"
            value={formatNumber(metrics.conversions)}
            icon={Target}
          />
          <MetricItem
            label="Spend"
            value={formatCurrency(metrics.spend)}
            icon={DollarSign}
          />
          <MetricItem
            label="Revenue"
            value={formatCurrency(metrics.revenue)}
            icon={DollarSign}
            trend={metrics.revenue > metrics.spend ? 'up' : 'down'}
          />
          <MetricItem
            label="CTR"
            value={formatPercent(metrics.ctr)}
            icon={MousePointerClick}
          />
          <MetricItem
            label="CPC"
            value={formatCurrency(metrics.cpc)}
            icon={DollarSign}
          />
          <MetricItem
            label="ROAS"
            value={`${metrics.roas.toFixed(2)}x`}
            icon={TrendingUp}
            trend={metrics.roas >= 1 ? 'up' : 'down'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
