// 🎨 UI: Dashboard Page (Dark Glassmorphism)
'use client';

import { useSpaces } from '@/hooks/use-spaces';
import { useCapabilities } from '@/hooks/use-capabilities';
import { IconResolver } from '@kaven/ui-base';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';

import dynamic from 'next/dynamic';
import { useUsers } from '@/hooks/use-users';
import { useDashboardSummary, useDashboardCharts, useDashboardDistribution } from '@/hooks/use-dashboard';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';
import { StatCard } from '@kaven/ui-base';
import { CurrencyDisplay } from '@kaven/ui-base';
import { Users, DollarSign, FileText } from 'lucide-react';

// Lazy load recharts bundle (FE-L1: code splitting for bundle size reduction)
const DashboardCharts = dynamic(() => import('./dashboard-charts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="rounded-2xl bg-card p-6 shadow-xl border border-border/50 lg:col-span-1 h-[420px] animate-pulse" />
      <div className="rounded-2xl bg-card p-6 shadow-xl border border-border/50 lg:col-span-2 h-[420px] animate-pulse" />
    </div>
  ),
});

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
  createdAt: string;
}

const getRoleBadgeClasses = (role: string) => {
  if (role === 'SUPER_ADMIN') return 'bg-destructive/10 text-destructive border border-destructive/20';
  if (role === 'TENANT_ADMIN') return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
  return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
};

interface MetricItem {
  value: number;
  trend: number;
}

const normalizeMetric = (metric: unknown): MetricItem => {
  if (typeof metric === 'number') return { value: metric, trend: 0 };
  if (metric && typeof metric === 'object' && 'value' in metric && typeof metric.value === 'number') {
    return {
      value: metric.value,
      trend: (metric as { trend?: number }).trend ?? 0
    };
  }
  return { value: 0, trend: 0 };
};

export default function DashboardView() {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const { format: formatCurrency, locale } = useCurrency();
  
  const { data: usersData } = useUsers({ page: 1, limit: 5 });
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: charts, isLoading: isLoadingCharts } = useDashboardCharts();
  const { data: distribution, isLoading: isLoadingDistribution } = useDashboardDistribution();
  const { currentSpace } = useSpaces();
  const { check } = useCapabilities();

  // ✅ Skeleton loader com tema Glassmorphism
  if (isLoadingSummary || isLoadingCharts || isLoadingDistribution || !currentSpace) {
    return <DashboardSkeleton />;
  }

  const rawMetrics = (summary as unknown as Record<string, unknown>) || {};
  
  const metrics = {
    totalUsers: normalizeMetric(rawMetrics.totalUsers),
    revenue: normalizeMetric(rawMetrics.revenue),
    invoices: normalizeMetric(rawMetrics.invoices),
    orders: normalizeMetric(rawMetrics.orders),
    newSignups: normalizeMetric(rawMetrics.newSignups),
    activationRate: normalizeMetric(rawMetrics.activationRate)
  };

  const chartData = charts || [];
  // Use real invoice distribution from API instead of hardcoded percentages
  const donutData = distribution?.invoicesByStatus?.filter(item => item.value > 0) ?? [];

  if (!currentSpace) return null;

  // Render cards based on real capabilities
  const canViewUsers = check('users.read');
  const canViewRevenue = check('revenue.view');
  const canViewInvoices = check('invoices.read');
  const canViewActivity = check('observability.view_metrics');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
         <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <IconResolver name={currentSpace.icon} className="h-8 w-8" />
         </div>
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('title', { name: currentSpace.name })}</h1>
            <p className="text-sm text-muted-foreground">{currentSpace.description || t('welcome')}</p>
         </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Users Card */}
        {canViewUsers && (
            <StatCard
                title={t('cards.totalUsers')}
                value={metrics.totalUsers.value.toLocaleString()}
                icon={Users}
                trend={metrics.totalUsers.trend}
                subtitle="Active Accounts"
                variant="outline"
                iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500"
                className="hover:shadow-lg"
            />
        )}

        {/* New Signups Card */}
        {canViewUsers && (
             <StatCard
                title={t('cards.newSignups')}
                value={metrics.newSignups.value}
                icon={Users}
                trend={metrics.newSignups.trend}
                subtitle={t('metrics.vsPrevious7Days')}
                variant="outline"
                iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500"
             />
        )}

        {/* Activation Rate Card */}
        {canViewUsers && (
             <StatCard
                title={t('cards.activationRate')}
                value={`${metrics.activationRate.value}%`}
                icon={FileText}
                trend={metrics.activationRate.trend}
                subtitle={t('metrics.vsPrevious7Days')}
                variant="outline"
                iconClassName="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500"
             />
        )}
        

      </div>

      {/* Business Section (Revenue, Invoices, Etc) */}
      {(canViewRevenue || canViewInvoices) && (
        <div className="space-y-4">
             <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-bold text-foreground">{tCommon('business')}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Revenue Card */}
                {canViewRevenue && (
                    <StatCard
                        title={t('cards.totalRevenue')}
                        value={<CurrencyDisplay value={metrics.revenue.value} />}
                        icon={DollarSign}
                        trend={metrics.revenue.trend}
                        subtitle={t('metrics.last7Days')}
                        variant="outline"
                        iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500"
                    />
                )}

                {/* Invoices/Downloads Card */}
                {canViewInvoices && (
                    <StatCard
                        title={t('cards.totalInvoices')}
                        value={metrics.invoices.value}
                        icon={FileText}
                        trend={metrics.invoices.trend}
                        subtitle={t('metrics.last7Days')}
                        variant="outline"
                        iconClassName="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500"
                    />
                )}
                
            </div>
        </div>
      )}

      {/* Charts Row - Lazy loaded (FE-L1) */}
      {canViewActivity && (
        <DashboardCharts
          donutData={donutData}
          chartData={chartData}
          formatCurrency={formatCurrency}
          locale={locale}
          labels={{
            currentActivity: t('charts.currentActivity'),
            activityByType: t('charts.activityByType'),
            activityTrends: t('charts.activityTrends'),
            trendComparison: t('charts.trendComparison'),
          }}
        />
      )}

      {/* User Table */}
      {canViewUsers && (
        <div className="rounded-2xl bg-card shadow-xl border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50">
                <h3 className="text-lg font-bold text-foreground">{t('table.title')}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/50">
                    <thead className="bg-muted/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('table.columns.user')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('table.columns.role')}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('table.columns.joined')}</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('table.columns.action')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                    {usersData?.users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-medium text-foreground">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${getRoleBadgeClasses(user.role)}`}>
                            {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}
