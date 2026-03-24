'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { BarChart3, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function FinancesBIPage() {
  const { tenant } = useTenant();

  const { data: dreSnapshots } = useQuery({
    queryKey: ['finances-bi-dre', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/finances-bi/dre', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: cashFlowSnapshots } = useQuery({
    queryKey: ['finances-bi-cashflow', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/finances-bi/cash-flow', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: indicators } = useQuery({
    queryKey: ['finances-bi-indicators', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/finances-bi/indicators/latest'); return res.data; },
    enabled: !!tenant?.id,
  });

  const latestDRE = dreSnapshots?.data?.[0];
  const latestCashFlow = cashFlowSnapshots?.data?.[0];
  const indicatorList = indicators?.data || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Financial Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          DRE, cash flow statements, and KPI indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Revenue */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-semibold">Net Revenue</h3>
          </div>
          <p className="text-2xl font-bold">
            {latestDRE ? `R$ ${Number(latestDRE.netRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Latest DRE period</p>
        </Card>

        {/* EBITDA */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-semibold">EBITDA</h3>
          </div>
          <p className="text-2xl font-bold">
            {latestDRE ? `R$ ${Number(latestDRE.ebitda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Latest DRE period</p>
        </Card>

        {/* Cash Flow */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-semibold">Net Cash Flow</h3>
          </div>
          <p className="text-2xl font-bold">
            {latestCashFlow ? `R$ ${Number(latestCashFlow.netCashFlow).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Closing: {latestCashFlow ? `R$ ${Number(latestCashFlow.closingBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
          </p>
        </Card>
      </div>

      {/* KPI Indicators */}
      {indicatorList.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Financial Indicators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {indicatorList.map((indicator: { id: string; indicatorKey: string; value: string | number; unit: string; status: string }) => (
              <div key={indicator.id} className="text-center">
                <p className="text-xs text-muted-foreground">{indicator.indicatorKey.replace(/_/g, ' ')}</p>
                <p className="text-xl font-bold mt-1">
                  {Number(indicator.value).toFixed(indicator.unit === 'percentage' ? 1 : 2)}
                  {indicator.unit === 'percentage' ? '%' : ''}
                </p>
                <span className={`text-xs ${
                  indicator.status === 'GREEN' ? 'text-green-500' :
                  indicator.status === 'AMBER' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {indicator.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
