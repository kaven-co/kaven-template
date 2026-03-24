'use client';

import { Card } from '@kaven/ui-base';
import { User } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/types/people';

const statusColors: Record<ApplicationStatus, string> = {
  APPLIED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  SCREENING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  INTERVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ASSESSMENT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  OFFER_SENT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  OFFER_ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  HIRED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  WITHDRAWN: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

interface CandidateCardProps {
  application: Application;
  onClick?: () => void;
}

export function CandidateCard({ application, onClick }: CandidateCardProps) {
  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {application.applicant?.fullName || 'Unknown'}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {application.applicant?.email}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[application.status]}`}>
              {application.status.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-muted-foreground">
              {application.stages?.length || 0} stages
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
