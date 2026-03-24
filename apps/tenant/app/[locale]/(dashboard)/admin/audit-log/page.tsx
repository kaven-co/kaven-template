/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Input, Badge } from '@kaven/ui-base';
import { Search, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogPage() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-log', tenant?.id, search, moduleFilter, page],
    queryFn: () =>
      api
        .get('/api/v1/admin/audit-log', {
          params: {
            page,
            limit: 20,
            action: search || undefined,
            module: moduleFilter || undefined,
          },
        })
        .then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const exportCsv = async () => {
    try {
      const response = await api.get('/api/v1/admin/audit-log/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-log.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">Track all actions in your workspace</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by action..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Modules</option>
          <option value="admin">Admin</option>
          <option value="legal">Legal</option>
          <option value="clients">Clients</option>
          <option value="finance">Finance</option>
        </select>
      </div>

      <Card>
        <div className="divide-y">
          {isLoading && <div className="p-4 text-center text-muted-foreground">Loading...</div>}
          {data?.data?.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium text-sm">{log.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {log.entity} &middot; {log.user?.name || 'System'} &middot;{' '}
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.module && <Badge variant="outline">{log.module}</Badge>}
                <Badge variant="secondary">{log.entity}</Badge>
              </div>
            </div>
          ))}
          {!isLoading && !data?.data?.length && (
            <div className="p-8 text-center text-muted-foreground">No audit logs found</div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
