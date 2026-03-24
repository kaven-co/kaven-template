'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card } from '@kaven/ui-base';
import { Play, ArrowLeft, Clock, CheckCircle, Users, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import type { SOP, SOPExecution } from '@/types/operations';

export default function SOPDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: sop, isLoading } = useQuery({
    queryKey: ['sop', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/operations/sops/${id}`);
      return res.data as SOP;
    },
    enabled: !!tenant && !!id,
  });

  // Recent executions
  const { data: executions } = useQuery({
    queryKey: ['sop-executions', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/operations/executions?sopId=${id}&limit=5`);
      return res.data as { data: SOPExecution[] };
    },
    enabled: !!tenant && !!id,
  });

  // Start execution
  const startExecution = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/v1/operations/executions', { sopId: id });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Execution started');
      queryClient.invalidateQueries({ queryKey: ['sop-executions', id] });
    },
    onError: () => toast.error('Failed to start execution'),
  });

  if (isLoading) {
    return <Card className="p-12 animate-pulse bg-muted/50 h-64" />;
  }

  if (!sop) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">SOP not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/operations/sops"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to SOPs
          </Link>
          <h1 className="text-2xl font-bold">{sop.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{sop.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => startExecution.mutate()}
            disabled={sop.status !== 'ACTIVE' || startExecution.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Execute
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          {sop.steps?.length || 0} steps
        </span>
        {sop.estimatedMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~{sop.estimatedMinutes} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Owner: {sop.owner.name}
        </span>
        {sop.tags.length > 0 && (
          <span className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            {sop.tags.join(', ')}
          </span>
        )}
      </div>

      {/* Steps */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Steps</h2>
        {sop.steps && sop.steps.length > 0 ? (
          <div className="space-y-2">
            {sop.steps.map((step) => (
              <Card key={step.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs bg-amber-500/10 text-amber-400 rounded-full h-6 w-6 flex items-center justify-center shrink-0">
                    {step.order}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.instructions}</p>
                    {step.estimatedMinutes && (
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        ~{step.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No steps yet. Add steps to this SOP.</p>
          </Card>
        )}
      </div>

      {/* Recent Executions */}
      {executions?.data && executions.data.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Executions</h2>
          <div className="space-y-2">
            {executions.data.map((exec) => (
              <Card key={exec.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{exec.executor.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(exec.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {exec.completedSteps}/{exec.totalSteps} steps
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exec.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                      exec.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {exec.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
