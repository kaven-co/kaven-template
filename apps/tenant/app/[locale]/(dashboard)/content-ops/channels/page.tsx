'use client';

import { Card } from '@kaven/ui-base';
import { Radio, Plus } from 'lucide-react';

export default function ChannelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Publication Channels</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage platforms, accounts, and publication settings
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Channel
        </button>
      </div>

      <Card className="p-12 text-center">
        <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No channels configured</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Add your publication channels (Instagram, Blog, YouTube, etc.) to link content pieces to specific platforms.
        </p>
      </Card>
    </div>
  );
}
