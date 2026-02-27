// Chart components extracted for lazy loading (FE-L1: recharts code splitting)
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name;
    const formattedValue = typeof value === 'number'
        ? value.toLocaleString('pt-BR', { style: name === 'revenue' ? 'currency' : 'decimal', currency: 'BRL' })
        : value;

    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
        {label && <p className="text-muted-foreground text-xs mb-1">{label}</p>}
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }}></span>
            <p className="text-popover-foreground font-bold text-sm">
            {name}: {formattedValue}
            </p>
        </div>
      </div>
    );
  }
  return null;
};

const CHART_COLORS = ['hsl(var(--primary))', '#FFAB00', '#00B8D9', '#FF5630'];

interface DashboardChartsProps {
  donutData: Array<{ name: string; value: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any[];
  labels: {
    currentActivity: string;
    activityByType: string;
    activityTrends: string;
    trendComparison: string;
  };
}

export default function DashboardCharts({
  donutData,
  chartData,
  labels,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Donut Chart */}
      <div className="rounded-2xl bg-card p-6 shadow-xl border border-border/50 lg:col-span-1">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground">{labels.currentActivity}</h3>
          <p className="text-sm text-muted-foreground">{labels.activityByType}</p>
        </div>
        <div className="h-80 w-full flex items-center justify-center relative" style={{ minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={donutData}
                innerRadius={80}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="rounded-2xl bg-card p-6 shadow-xl border border-border/50 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">{labels.activityTrends}</h3>
            <p className="text-sm text-muted-foreground">{labels.trendComparison}</p>
          </div>
        </div>
        <div className="h-80 w-full min-w-0" style={{ minHeight: '320px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={chartData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#919EAB33" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#919EAB'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#919EAB'}} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="users" stackId="a" fill="#00A76F" radius={[0,0,0,0]} />
              <Bar dataKey="revenue" stackId="a" fill="#FFAB00" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
