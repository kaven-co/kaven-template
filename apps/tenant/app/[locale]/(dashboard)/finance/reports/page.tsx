'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
} from '@kaven/ui-base';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import { DREReport } from '@/components/finance/DREReport';
import { BudgetGrid } from '@/components/finance/BudgetGrid';
import { AmountDisplay } from '@/components/finance/AmountDisplay';
import type { DREReport as DREReportType, DFCReport, BudgetComparison, KPIValue } from '@/types/finance';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const months = [
  { value: '', label: 'Full Year' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function ReportsPage() {
  const { tenant } = useTenant();
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState('');

  // DRE
  const { data: dre } = useQuery<DREReportType>({
    queryKey: ['finance-dre', tenant?.id, year, month],
    queryFn: async () => {
      const params: Record<string, string> = { year };
      if (month) params.month = month;
      const res = await api.get('/api/v1/finance/reports/dre', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // DFC
  const { data: dfc } = useQuery<DFCReport>({
    queryKey: ['finance-dfc', tenant?.id, year],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/reports/dfc', { params: { year } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // Budget comparison
  const { data: budgetData } = useQuery<{ comparison: BudgetComparison[] }>({
    queryKey: ['finance-budget-comparison', tenant?.id, year],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/budgets/comparison', { params: { year } });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  // KPIs
  const { data: kpisData } = useQuery<{ data: KPIValue[] }>({
    queryKey: ['finance-kpis', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/finance/reports/kpis');
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const kpis = kpisData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">DRE, Cash Flow, Budget and KPIs</p>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                <Badge
                  variant={
                    kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'
                  }
                >
                  {kpi.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.value !== null ? (
                    kpi.unit === 'percent'
                      ? `${(kpi.value * 100).toFixed(1)}%`
                      : kpi.unit === 'days'
                        ? `${Math.round(kpi.value)} days`
                        : kpi.unit === 'currency_brl'
                          ? <AmountDisplay amount={kpi.value} />
                          : kpi.value.toFixed(2)
                  ) : (
                    'N/A'
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Period selector */}
      <div className="flex items-center gap-3">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]" aria-label="Select year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[140px]" aria-label="Select month">
            <SelectValue placeholder="Full Year" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Report tabs */}
      <Tabs defaultValue="dre">
        <TabsList>
          <TabsTrigger value="dre">
            <BarChart3 className="mr-2 h-4 w-4" />
            DRE
          </TabsTrigger>
          <TabsTrigger value="dfc">
            <TrendingUp className="mr-2 h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="budget">
            <Target className="mr-2 h-4 w-4" />
            Budget
          </TabsTrigger>
        </TabsList>

        {/* DRE Tab */}
        <TabsContent value="dre" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Statement (DRE)</CardTitle>
            </CardHeader>
            <CardContent>
              {dre ? (
                <DREReport report={dre} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No data for the selected period
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DFC Tab */}
        <TabsContent value="dfc" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement (DFC)</CardTitle>
            </CardHeader>
            <CardContent>
              {dfc ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Cash flow report">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Revenue</th>
                        <th className="text-right p-2">Expenses</th>
                        <th className="text-right p-2">Investments</th>
                        <th className="text-right p-2">Net Cash Flow</th>
                        <th className="text-right p-2">Cumulative</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dfc.months.map((m) => (
                        <tr key={m.month} className="border-b hover:bg-muted/30">
                          <td className="p-2">{months[m.month]?.label}</td>
                          <td className="p-2 text-right">
                            <AmountDisplay amount={m.revenue} type="revenue" />
                          </td>
                          <td className="p-2 text-right">
                            <AmountDisplay amount={m.expenses} type="expense" />
                          </td>
                          <td className="p-2 text-right">
                            <AmountDisplay amount={m.investments} type="investment" />
                          </td>
                          <td className="p-2 text-right">
                            <AmountDisplay
                              amount={m.netCashFlow}
                              type={m.netCashFlow >= 0 ? 'revenue' : 'expense'}
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            <AmountDisplay
                              amount={m.cumulativeBalance}
                              type={m.cumulativeBalance >= 0 ? 'revenue' : 'expense'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No data for the selected year
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetData?.comparison ? (
                <BudgetGrid data={budgetData.comparison} year={parseInt(year)} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No budget found for {year}. Create one in Budget management.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
