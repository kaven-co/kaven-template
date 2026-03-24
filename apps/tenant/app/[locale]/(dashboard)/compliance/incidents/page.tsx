'use client';

import { Card } from '@kaven/ui-base';
import { AlertTriangle, Plus } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-600',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
};

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incident Response</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Security incidents — detect, investigate, mitigate, resolve
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4" />
          Report Incident
        </button>
      </div>

      {/* Severity indicators */}
      <div className="flex gap-4">
        {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
          <div key={severity} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {severity.charAt(0) + severity.slice(1).toLowerCase()}
          </div>
        ))}
      </div>

      <Card className="p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No incidents recorded</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When a security incident occurs, report it here to track timeline, SLA, root cause, and resolution.
        </p>
      </Card>
    </div>
  );
}
