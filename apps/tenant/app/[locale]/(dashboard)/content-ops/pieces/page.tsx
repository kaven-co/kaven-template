'use client';

import { Card } from '@kaven/ui-base';
import { Layers, Plus } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  IDEA: 'bg-gray-500',
  BRIEF: 'bg-blue-500',
  IN_CREATION: 'bg-yellow-500',
  IN_REVIEW: 'bg-orange-500',
  SCHEDULED: 'bg-purple-500',
  PUBLISHED: 'bg-green-500',
  ARCHIVED: 'bg-gray-400',
  CANCELLED: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  IDEA: 'Idea',
  BRIEF: 'Brief',
  IN_CREATION: 'In Creation',
  IN_REVIEW: 'In Review',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  CANCELLED: 'Cancelled',
};

export default function PiecesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage content from idea to publication
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Content
        </button>
      </div>

      {/* Pipeline status indicators */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[key]}`} />
            {label}
          </div>
        ))}
      </div>

      <Card className="p-12 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No content pieces yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Create your first content piece. It will flow through the pipeline:
          Idea &rarr; Brief &rarr; Creation &rarr; Review &rarr; Schedule &rarr; Publish.
        </p>
      </Card>
    </div>
  );
}
