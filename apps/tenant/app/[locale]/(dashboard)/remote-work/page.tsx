'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { Clock, MessageSquare, Globe, FileSpreadsheet } from 'lucide-react';

export default function RemoteWorkPage() {
  const { tenant } = useTenant();

  const { data: timeEntries } = useQuery({
    queryKey: ['remote-time-entries', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/remote-work/time-entries', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: runningTimers } = useQuery({
    queryKey: ['remote-running-timers', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/remote-work/time-entries', { params: { limit: '1', isRunning: 'true' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: standups } = useQuery({
    queryKey: ['remote-standups', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/remote-work/standups', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: timesheets } = useQuery({
    queryKey: ['remote-timesheets', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/remote-work/timesheets', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Remote / Hybrid Work
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Time tracking, async standups, timezones and timesheets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <Clock className="h-8 w-8 mb-3 text-blue-500" />
          <h3 className="font-semibold">Time Entries</h3>
          <p className="text-sm text-muted-foreground mb-3">Track work hours</p>
          <p className="text-2xl font-bold">{timeEntries?.meta?.total || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {runningTimers?.meta?.total || 0} running
          </p>
        </Card>

        <Card className="p-6">
          <MessageSquare className="h-8 w-8 mb-3 text-green-500" />
          <h3 className="font-semibold">Async Standups</h3>
          <p className="text-sm text-muted-foreground mb-3">Daily check-ins</p>
          <p className="text-2xl font-bold">{standups?.meta?.total || 0}</p>
        </Card>

        <Card className="p-6">
          <Globe className="h-8 w-8 mb-3 text-purple-500" />
          <h3 className="font-semibold">Timezones</h3>
          <p className="text-sm text-muted-foreground mb-3">Team overlap</p>
          <p className="text-2xl font-bold">--</p>
        </Card>

        <Card className="p-6">
          <FileSpreadsheet className="h-8 w-8 mb-3 text-amber-500" />
          <h3 className="font-semibold">Timesheets</h3>
          <p className="text-sm text-muted-foreground mb-3">Weekly approval</p>
          <p className="text-2xl font-bold">{timesheets?.meta?.total || 0}</p>
        </Card>
      </div>
    </div>
  );
}
