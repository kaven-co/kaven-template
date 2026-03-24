'use client';

import { Card } from '@kaven/ui-base';
import { ClipboardCheck, Plus } from 'lucide-react';

const FRAMEWORK_BADGES: Record<string, { label: string; color: string }> = {
  LGPD: { label: 'LGPD', color: 'bg-green-600' },
  SOC2: { label: 'SOC2', color: 'bg-blue-600' },
  ISO27001: { label: 'ISO 27001', color: 'bg-purple-600' },
  GDPR: { label: 'GDPR', color: 'bg-cyan-600' },
  HIPAA: { label: 'HIPAA', color: 'bg-red-600' },
  PCI_DSS: { label: 'PCI DSS', color: 'bg-orange-600' },
  CUSTOM: { label: 'Custom', color: 'bg-gray-600' },
};

export default function ChecklistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Checklists</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track compliance controls by framework — LGPD, SOC2, ISO27001
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Checklist
        </button>
      </div>

      {/* Framework badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(FRAMEWORK_BADGES).map(([key, { label, color }]) => (
          <span key={key} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${color}`}>
            {label}
          </span>
        ))}
      </div>

      <Card className="p-12 text-center">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No checklists yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Create a compliance checklist to track controls, assign owners, and generate audit-ready reports.
        </p>
      </Card>
    </div>
  );
}
