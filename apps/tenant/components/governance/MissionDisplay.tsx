'use client';

import { Card } from '@kaven/ui-base';
import { Compass, Eye, Heart, Lightbulb } from 'lucide-react';
import type { MissionStatement } from '@/types/governance';

interface MissionDisplayProps {
  mission: MissionStatement;
}

export function MissionDisplay({ mission }: MissionDisplayProps) {
  if (!mission.mission && !mission.vision && !mission.purpose && (!mission.values || mission.values.length === 0)) {
    return (
      <Card className="p-8 text-center">
        <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold mb-1">No mission defined yet</h3>
        <p className="text-sm text-muted-foreground">
          Define your company mission, vision, and values to align your team.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {mission.mission && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Mission</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{mission.mission}</p>
        </Card>
      )}

      {mission.vision && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Vision</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{mission.vision}</p>
        </Card>
      )}

      {mission.purpose && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Purpose</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{mission.purpose}</p>
        </Card>
      )}

      {mission.values && mission.values.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Values</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mission.values.map((value, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-muted rounded-full text-xs font-medium"
              >
                {value}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
