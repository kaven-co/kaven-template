'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kaven/ui-base';
import { Bot, Zap, DollarSign, Clock } from 'lucide-react';
import type { TelemetryStats } from '@/types/ai';

interface AgentUsageCardProps {
  stats: TelemetryStats;
}

export function AgentUsageCard({ stats }: AgentUsageCardProps) {
  const formatTokens = (n: number) =>
    n >= 1000000
      ? `${(n / 1000000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}K`
        : n.toString();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Usage Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1" aria-label={`Total calls: ${stats.totalCalls}`}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-xs">Total Calls</span>
            </div>
            <p className="text-lg font-semibold">{stats.totalCalls.toLocaleString()}</p>
          </div>

          <div className="space-y-1" aria-label={`Total tokens: ${formatTokens(stats.totalTokens)}`}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bot className="h-3.5 w-3.5" />
              <span className="text-xs">Total Tokens</span>
            </div>
            <p className="text-lg font-semibold">{formatTokens(stats.totalTokens)}</p>
          </div>

          <div className="space-y-1" aria-label={`Total cost: $${stats.totalCostUsd.toFixed(2)}`}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="text-xs">Total Cost</span>
            </div>
            <p className="text-lg font-semibold">${stats.totalCostUsd.toFixed(2)}</p>
          </div>

          <div className="space-y-1" aria-label={`Average latency: ${stats.avgLatencyMs}ms`}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">Avg Latency</span>
            </div>
            <p className="text-lg font-semibold">{stats.avgLatencyMs}ms</p>
          </div>
        </div>

        {/* Cost by provider */}
        {stats.byProvider.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Cost by Provider</h4>
            <div className="space-y-2">
              {stats.byProvider.map((p) => (
                <div key={p.provider} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.provider}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{p.calls} calls</span>
                    <span className="font-medium text-foreground">
                      ${p.totalCostUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top models */}
        {stats.byModel.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Top Models</h4>
            <div className="space-y-2">
              {stats.byModel.slice(0, 5).map((m) => (
                <div key={m.model} className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[200px]">{m.model}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{formatTokens(m.totalTokens)} tokens</span>
                    <span className="font-medium text-foreground">
                      ${m.totalCostUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
