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
import { Plus, Search, Building2, User, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LegalEntitiesPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [newType, setNewType] = useState('PJ');

  const { data, isLoading } = useQuery({
    queryKey: ['legal-entities', tenant?.id, deferredSearch, statusFilter],
    queryFn: () =>
      api
        .get('/api/v1/legal/entities', {
          params: {
            search: deferredSearch || undefined,
            status: statusFilter || undefined,
          },
        })
        .then((r) => r.data),
    enabled: !!tenant?.id,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; document: string; type: string }) =>
      api.post('/api/v1/legal/entities', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-entities'] });
      setIsCreateOpen(false);
      setNewName('');
      setNewDocument('');
      toast.success('Legal entity created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to create entity'),
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'SUSPENDED': return 'destructive';
      default: return 'outline';
    }
  };

  const cnpjStatusColor = (status: string) => {
    if (status === 'ATIVA') return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Legal Entities</h1>
          <p className="text-muted-foreground">Companies and individuals with CNPJ/CPF validation</p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entity
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, trade name, or document..."
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <Card>
        <div className="divide-y">
          {isLoading && <div className="p-4 text-center text-muted-foreground">Loading...</div>}
          {data?.data?.map((entity: any) => (
            <Link key={entity.id} href={`/legal/entities/${entity.id}`}>
              <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  {entity.type === 'PJ' ? (
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {entity.tradeName && <span>{entity.tradeName} &middot; </span>}
                      {entity.documentType}: {entity.document}
                      {entity.cnpjStatus && (
                        <span className={`ml-2 ${cnpjStatusColor(entity.cnpjStatus)}`}>
                          ({entity.cnpjStatus})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColor(entity.status) as any}>{entity.status}</Badge>
                  {entity.representativeCount > 0 && (
                    <Badge variant="outline">{entity.representativeCount} reps</Badge>
                  )}
                  {entity.contractCount > 0 && (
                    <Badge variant="outline">
                      <FileCheck className="w-3 h-3 mr-1" />
                      {entity.contractCount}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {!isLoading && !data?.data?.length && (
            <div className="p-8 text-center text-muted-foreground">No legal entities found</div>
          )}
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Legal Entity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="PJ">Company (PJ)</option>
                <option value="PF">Individual (PF)</option>
              </select>
            </div>
            <div>
              <Label>Name (Razao Social)</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Company Name Ltd." />
            </div>
            <div>
              <Label>{newType === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder={newType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  name: newName,
                  document: newDocument,
                  type: newType,
                })
              }
              disabled={!newName || !newDocument || createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
