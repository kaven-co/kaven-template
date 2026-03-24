'use client';

import { Card } from '@kaven/ui-base';
import { FileSearch, Plus } from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-yellow-500',
  LOW: 'text-blue-500',
  INFORMATIONAL: 'text-gray-500',
};

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Assessments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vulnerability scans, penetration tests, code reviews, and audits
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Assessment
        </button>
      </div>

      {/* Risk level indicators */}
      <div className="flex gap-4">
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`font-medium ${color}`}>
              {level.charAt(0) + level.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-12 text-center">
        <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No assessments yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Schedule and track security assessments — from vulnerability scans to full penetration tests.
        </p>
      </Card>
    </div>
  );
}
