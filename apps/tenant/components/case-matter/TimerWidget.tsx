'use client';

import { useState, useEffect } from 'react';
import { Button, Card } from '@kaven/ui-base';
import { Play, Square, Clock } from 'lucide-react';
import type { CaseTimeEntry } from '@/types/case-matter';

interface TimerWidgetProps {
  activeTimer: CaseTimeEntry | null;
  onStart: () => void;
  onStop: (id: string) => void;
}

export function TimerWidget({ activeTimer, onStart, onStop }: TimerWidgetProps) {
  const startTime = activeTimer ? new Date(activeTimer.startedAt).getTime() : 0;
  const [elapsed, setElapsed] = useState(() =>
    activeTimer ? Math.floor((Date.now() - new Date(activeTimer.startedAt).getTime()) / 1000) : 0,
  );

  useEffect(() => {
    if (!activeTimer) return;

    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeTimer, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Clock className={`h-4 w-4 ${activeTimer ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
        <div>
          {activeTimer ? (
            <>
              <p className="text-sm font-mono font-semibold">{formatTime(elapsed)}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {activeTimer.case?.title || 'Timer active'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No active timer</p>
          )}
        </div>
      </div>

      {activeTimer ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onStop(activeTimer.id)}
        >
          <Square className="h-3 w-3 mr-1" />
          Stop
        </Button>
      ) : (
        <Button size="sm" onClick={onStart}>
          <Play className="h-3 w-3 mr-1" />
          Start
        </Button>
      )}
    </Card>
  );
}
