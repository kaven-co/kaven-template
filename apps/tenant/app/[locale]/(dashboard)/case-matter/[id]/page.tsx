'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card } from '@kaven/ui-base';
import { ArrowLeft, Users, FileText, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { Case, CaseTask, CaseDeadline } from '@/types/case-matter';

export default function CaseDetailPage() {
  const { tenant } = useTenant();
  const params = useParams();
  const caseId = params?.id as string;

  // Fetch case details
  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case-detail', tenant?.id, caseId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/case-matter/cases/${caseId}`);
      return res.data as Case;
    },
    enabled: !!tenant?.id && !!caseId,
  });

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ['case-tasks', tenant?.id, caseId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/case-matter/tasks/case/${caseId}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!caseId,
  });

  // Fetch deadlines
  const { data: deadlinesData } = useQuery({
    queryKey: ['case-deadlines', tenant?.id, caseId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/case-matter/deadlines/case/${caseId}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!caseId,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-4 md:p-6 text-center">
        <p className="text-muted-foreground">Case not found</p>
      </div>
    );
  }

  const tasks: CaseTask[] = tasksData?.data || [];
  const deadlines: CaseDeadline[] = deadlinesData?.data || [];

  const statusCounts: Record<string, number> = {};
  for (const task of tasks) {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="../case-matter">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{caseData.title}</h1>
          <p className="text-sm text-muted-foreground">
            {caseData.caseNumber && `#${caseData.caseNumber} · `}
            {caseData.caseType} · {caseData.status}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Parties</p>
            <p className="text-lg font-semibold">{caseData._count?.parties || 0}</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Tasks</p>
            <p className="text-lg font-semibold">{caseData._count?.tasks || 0}</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Deadlines</p>
            <p className="text-lg font-semibold">{caseData._count?.deadlines || 0}</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Time Entries</p>
            <p className="text-lg font-semibold">{caseData._count?.timeEntries || 0}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Kanban summary */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tasks by Status
          </h2>
          <div className="space-y-2">
            {['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{status.replace('_', ' ')}</span>
                <span className="text-sm font-medium">{statusCounts[status] || 0}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Deadlines */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Deadlines
          </h2>
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deadlines set</p>
          ) : (
            <div className="space-y-2">
              {deadlines.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className={d.isFulfilled ? 'line-through text-muted-foreground' : ''}>
                    {d.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Financial info */}
      {(caseData.estimatedValue || caseData.hourlyRate) && (
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {caseData.estimatedValue && (
              <div>
                <p className="text-xs text-muted-foreground">Estimated Value</p>
                <p className="font-medium">{caseData.currency} {Number(caseData.estimatedValue).toLocaleString()}</p>
              </div>
            )}
            {caseData.hourlyRate && (
              <div>
                <p className="text-xs text-muted-foreground">Hourly Rate</p>
                <p className="font-medium">{caseData.currency} {Number(caseData.hourlyRate).toLocaleString()}/hr</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Billing Type</p>
              <p className="font-medium">{caseData.billingType}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
