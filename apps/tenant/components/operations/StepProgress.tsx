'use client';

import { CheckCircle, Circle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import type { SOPStepStatus } from '@/types/operations';

const stepIcons: Record<SOPStepStatus, React.ReactNode> = {
  PENDING: <Circle className="h-4 w-4 text-gray-400" />,
  IN_PROGRESS: <Loader className="h-4 w-4 text-blue-400 animate-spin" />,
  COMPLETED: <CheckCircle className="h-4 w-4 text-green-400" />,
  SKIPPED: <XCircle className="h-4 w-4 text-gray-500" />,
  BLOCKED: <AlertTriangle className="h-4 w-4 text-red-400" />,
};

interface StepProgressProps {
  steps: Array<{
    id: string;
    step: { id: string; title: string; order: number; instructions?: string };
    status: SOPStepStatus;
    completedAt?: string;
    notes?: string;
    executor?: { id: string; name: string };
  }>;
  onCompleteStep?: (stepId: string, status: 'COMPLETED' | 'SKIPPED' | 'BLOCKED') => void;
}

export function StepProgress({ steps, onCompleteStep }: StepProgressProps) {
  return (
    <div className="space-y-1">
      {steps.map((stepExec, idx) => (
        <div
          key={stepExec.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card"
        >
          <div className="flex flex-col items-center">
            {stepIcons[stepExec.status]}
            {idx < steps.length - 1 && (
              <div className="w-px h-6 bg-border mt-1" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {stepExec.step.order}. {stepExec.step.title}
              </h4>
              <span className="text-[10px] text-muted-foreground uppercase">
                {stepExec.status.replace('_', ' ')}
              </span>
            </div>

            {stepExec.step.instructions && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {stepExec.step.instructions}
              </p>
            )}

            {stepExec.notes && (
              <p className="text-xs text-blue-400 mt-1">Note: {stepExec.notes}</p>
            )}

            {stepExec.status === 'PENDING' && onCompleteStep && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onCompleteStep(stepExec.step.id, 'COMPLETED')}
                  className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20"
                >
                  Complete
                </button>
                <button
                  onClick={() => onCompleteStep(stepExec.step.id, 'SKIPPED')}
                  className="text-xs px-2 py-1 bg-gray-500/10 text-gray-400 rounded hover:bg-gray-500/20"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
