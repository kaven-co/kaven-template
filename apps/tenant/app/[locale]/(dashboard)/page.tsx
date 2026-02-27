'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useTenant } from '@/lib/hooks/use-tenant';
import { useSpace } from '@/lib/hooks/use-space';
import { useDashboardSummary, useDashboardCharts } from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@kaven/ui-base';
import { Skeleton } from '@kaven/ui-base';
import {
  Users, FileText, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load recharts bundle (FE-L1: code splitting for bundle size reduction)
const TenantDashboardCharts = dynamic(() => import('./dashboard/dashboard-charts'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <div className="col-span-4 h-[380px] rounded-lg border bg-card animate-pulse" />
      <div className="col-span-3 h-[380px] rounded-lg border bg-card animate-pulse" />
    </div>
  ),
});

// ----------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
}

function Trend({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">sem mudança</span>;
  const positive = value > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}{value}% vs 7 dias
    </span>
  );
}

function StatCard({
  title, value, icon: Icon, trend,
}: { title: string; value: string; icon: React.ElementType; trend: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Trend value={trend} />
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const { tenant } = useTenant();
  const { activeSpace } = useSpace();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {user?.name?.split(' ')[0] || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground">
          Resumo de{' '}
          <span className="font-semibold text-primary">{tenant?.name ?? '...'}</span>
          {activeSpace ? ` (${activeSpace.name})` : ''}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : summary ? (
          <>
            <StatCard
              title="Usuários Ativos"
              value={String(summary.totalUsers.value)}
              icon={Users}
              trend={summary.totalUsers.trend}
            />
            <StatCard
              title="Novos Cadastros (7d)"
              value={String(summary.newSignups.value)}
              icon={TrendingUp}
              trend={summary.newSignups.trend}
            />
            <StatCard
              title="Faturas"
              value={String(summary.invoices.value)}
              icon={FileText}
              trend={summary.invoices.trend}
            />
            <StatCard
              title="Receita Total"
              value={formatCurrency(summary.revenue.value)}
              icon={DollarSign}
              trend={summary.revenue.trend}
            />
          </>
        ) : null}
      </div>

      {/* Charts Section - Lazy loaded (FE-L1) */}
      <TenantDashboardCharts
        chartData={charts ?? []}
        chartsLoading={chartsLoading}
        skeletonElement={<Skeleton className="h-full w-full rounded-lg" />}
      />

      {/* Orders Summary */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.orders.value}</div>
              <Trend value={summary.orders.trend} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ativação (7d)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activationRate.value}%</div>
              <Trend value={summary.activationRate.trend} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
