'use client';

import { Card } from '@kaven/ui-base';
import { Shield, Plus } from 'lucide-react';

export default function InsurancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insurance Policies</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track cyber, liability, and other insurance coverage
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Policy
        </button>
      </div>

      <Card className="p-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No insurance policies</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add your insurance policies to track coverage, premiums, renewal dates, and deductibles.
        </p>
      </Card>
    </div>
  );
}
