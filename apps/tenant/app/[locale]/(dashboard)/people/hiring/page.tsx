'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card } from '@kaven/ui-base';
import { ArrowLeft, Plus, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PipelineColumn } from '@/components/people/PipelineColumn';
import type { HiringJob, Application, ApplicationStatus } from '@/types/people';

const PIPELINE_STAGES: ApplicationStatus[] = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'ASSESSMENT',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
  'HIRED',
];

export default function HiringPipelinePage() {
  const { tenant } = useTenant();
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch hiring jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['hiring-jobs', tenant?.id],
    queryFn: () =>
      api.get('/api/v1/people/hiring/jobs', {
        params: { status: 'OPEN', limit: 50 },
      }).then((r) => r.data),
    enabled: !!tenant?.id,
  });

  // Fetch applications for selected job
  const { data: applicationsData } = useQuery({
    queryKey: ['applications', selectedJobId],
    queryFn: () =>
      api.get('/api/v1/people/applications', {
        params: { jobId: selectedJobId, limit: 100 },
      }).then((r) => r.data),
    enabled: !!selectedJobId,
  });

  const jobs: HiringJob[] = jobsData?.data || [];
  const applications: Application[] = applicationsData?.data || [];

  // Group applications by status for kanban
  const groupedApplications = PIPELINE_STAGES.reduce(
    (acc, status) => {
      acc[status] = applications.filter((app) => app.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Hiring Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              {jobs.length} open positions
            </p>
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Job Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {jobs.map((job) => (
          <Button
            key={job.id}
            variant={selectedJobId === job.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedJobId(job.id)}
            className="flex-shrink-0"
          >
            <Briefcase className="w-3 h-3 mr-1" />
            {job.title}
            <span className="ml-1 text-xs opacity-70">
              ({job._count?.applications || 0})
            </span>
          </Button>
        ))}
        {jobs.length === 0 && !jobsLoading && (
          <Card className="p-8 w-full text-center">
            <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium">No open positions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a job posting to start your hiring pipeline
            </p>
          </Card>
        )}
      </div>

      {/* Pipeline Kanban */}
      {selectedJobId && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((status) => (
            <PipelineColumn
              key={status}
              status={status}
              applications={groupedApplications[status] || []}
            />
          ))}
        </div>
      )}

      {!selectedJobId && jobs.length > 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Select a job posting to view its pipeline
          </p>
        </Card>
      )}
    </div>
  );
}
