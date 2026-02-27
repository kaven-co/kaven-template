'use client';

import { useEffect, useState } from 'react';
import { PlanUsageSummary, type PlanUsageFeature } from '@kaven/ui-base';
import { Loader2, AlertCircle } from 'lucide-react';

interface PlanUsageResponse {
  planName: string;
  features: PlanUsageFeature[];
}

export default function PlanPage() {
  const [data, setData] = useState<PlanUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/plan/usage');
        if (!res.ok) {
          throw new Error(`Erro ao buscar dados do plano (${res.status})`);
        }
        const json: PlanUsageResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <AlertCircle className="h-12 w-12 text-red-500/60" />
        <p className="text-muted-foreground font-medium">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Meu Plano</h1>
        <p className="text-muted-foreground mt-1">Veja os limites e uso do seu plano atual</p>
      </div>

      <PlanUsageSummary planName={data.planName} features={data.features} />
    </div>
  );
}
