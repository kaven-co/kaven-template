'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@kaven/ui-base';
import { Square, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useTenant } from '@/lib/hooks/use-tenant';
import type { TimeEntry } from '@/types/projects';

export function TimeTracker() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [elapsed, setElapsed] = useState(0);

  // Fetch running timer
  const { data: runningTimer } = useQuery({
    queryKey: ['running-timer', tenant?.id],
    queryFn: async () => {
      const res = await api.get('/api/v1/time-entries/running');
      return res.data as TimeEntry | null;
    },
    enabled: !!tenant?.id,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Calculate elapsed time via interval (avoids direct setState in effect body)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!runningTimer?.isRunning) {
      return;
    }

    const start = new Date(runningTimer.startTime).getTime();
    // Use interval for all updates including initial
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runningTimer]);

  // Stop timer
  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/v1/time-entries/stop/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['running-timer'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  if (!runningTimer?.isRunning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-mono font-bold">{formatTime(elapsed)}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">
          {runningTimer.project?.name}
          {runningTimer.task ? ` — ${runningTimer.task.title}` : ''}
        </span>
      </div>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => stopMutation.mutate(runningTimer.id)}
        disabled={stopMutation.isPending}
      >
        <Square className="h-3 w-3 mr-1" />
        Stop
      </Button>
    </div>
  );
}
