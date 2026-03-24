'use client';

import { CandidateCard } from './CandidateCard';
import type { Application, ApplicationStatus } from '@/types/people';

const columnLabels: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  ASSESSMENT: 'Assessment',
  OFFER_SENT: 'Offer Sent',
  OFFER_ACCEPTED: 'Accepted',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

interface PipelineColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  onCardClick?: (application: Application) => void;
}

export function PipelineColumn({ status, applications, onCardClick }: PipelineColumnProps) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-medium text-sm">{columnLabels[status]}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px] p-2 bg-muted/30 rounded-lg">
        {applications.map((app) => (
          <CandidateCard
            key={app.id}
            application={app}
            onClick={() => onCardClick?.(app)}
          />
        ))}
        {applications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No candidates
          </p>
        )}
      </div>
    </div>
  );
}
