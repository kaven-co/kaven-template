/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useDeferredValue } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Badge,
} from '@kaven/ui-base';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  DRAFT: 'secondary',
  REVIEW: 'outline',
  PENDING_APPROVAL: 'outline',
  APPROVED: 'default',
  SENT_FOR_SIGN: 'outline',
  SIGNED: 'default',
  ACTIVE: 'default',
  EXPIRED: 'destructive',
  CANCELLED: 'destructive',
  ARCHIVED: 'secondary',
};

export default function ContractsPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('SERVICE');

  const { data, isLoading } = useQuery({
    queryKey: ['legal-contracts', tenant?.id, deferredSearch, statusFilter],
    queryFn: () =>
      api
        .get('/api/v1/legal/contracts', {
          params: {
            search: deferredSearch || undefined,
            status: statusFilter || undefined,
          },
        })
        .then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; type: string }) =>
      api.post('/api/v1/legal/contracts', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-contracts'] });
      setIsCreateOpen(false);
      setNewTitle('');
      toast.success('Contract created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create contract'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Contract lifecycle management with state machine</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Review</option>
          <option value="APPROVED">Approved</option>
          <option value="SIGNED">Signed</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <Card>
        <div className="divide-y">
          {isLoading && <div className="p-4 text-center text-muted-foreground">Loading...</div>}
          {data?.data?.map((contract: any) => (
            <Link key={contract.id} href={`/legal/contracts/${contract.id}`}>
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{contract.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {contract.contractNumber && <span>{contract.contractNumber} &middot; </span>}
                      {contract.type}
                      {contract.value && (
                        <span>
                          {' '}&middot; {contract.currency} {contract.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={(statusColors[contract.status] || 'outline') as any}>
                    {contract.status}
                  </Badge>
                  {contract.expiresAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(contract.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <Badge variant="outline">{contract.partyCount} parties</Badge>
                </div>
              </div>
            </Link>
          ))}
          {!isLoading && !data?.data?.length && (
            <div className="p-8 text-center text-muted-foreground">No contracts found</div>
          )}
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Service Agreement" />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="SERVICE">Service</option>
                <option value="NDA">NDA</option>
                <option value="EMPLOYMENT">Employment</option>
                <option value="SUPPLY">Supply</option>
                <option value="LEASE">Lease</option>
                <option value="LICENSE">License</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ title: newTitle, type: newType })}
              disabled={!newTitle || createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
