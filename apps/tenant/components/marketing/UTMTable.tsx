'use client';

import { Card } from '@kaven/ui-base';

interface UTMRecord {
  source: string;
  medium: string;
  visits: number;
  conversions: number;
}

interface UTMTableProps {
  data?: UTMRecord[];
}

const defaultData: UTMRecord[] = [
  { source: 'google', medium: 'cpc', visits: 450, conversions: 32 },
  { source: 'linkedin', medium: 'social', visits: 280, conversions: 18 },
  { source: 'twitter', medium: 'social', visits: 180, conversions: 8 },
  { source: 'newsletter', medium: 'email', visits: 320, conversions: 45 },
  { source: 'direct', medium: '(none)', visits: 560, conversions: 22 },
];

export function UTMTable({ data = defaultData }: UTMTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">UTM Attribution</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2 font-medium">Source</th>
              <th className="pb-2 font-medium">Medium</th>
              <th className="pb-2 font-medium text-right">Visits</th>
              <th className="pb-2 font-medium text-right">Conversions</th>
              <th className="pb-2 font-medium text-right">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const convRate = row.visits > 0
                ? ((row.conversions / row.visits) * 100).toFixed(1)
                : '0';
              return (
                <tr key={`${row.source}-${row.medium}`} className="border-b border-border/50">
                  <td className="py-2 font-medium">{row.source}</td>
                  <td className="py-2 text-muted-foreground">{row.medium}</td>
                  <td className="py-2 text-right">{row.visits.toLocaleString()}</td>
                  <td className="py-2 text-right">{row.conversions.toLocaleString()}</td>
                  <td className="py-2 text-right text-amber-400">{convRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
