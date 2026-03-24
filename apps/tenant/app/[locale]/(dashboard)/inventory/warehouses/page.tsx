'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@kaven/ui-base';
import { Plus, ArrowLeft, Warehouse as WarehouseIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const WAREHOUSE_TYPES = ['MAIN', 'STORE', 'VIRTUAL', 'TRANSIT'] as const;

export default function WarehousesPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 'MAIN' });

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/inventory/warehouses'); return res.data; },
    enabled: !!tenant?.id,
  });

  const warehouses = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.post('/api/v1/inventory/warehouses', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsCreateOpen(false);
      setForm({ name: '', code: '', type: 'MAIN' });
      toast.success('Warehouse created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Error creating warehouse'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-muted-foreground">Storage locations for inventory</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Warehouse</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
        </div>
      ) : warehouses.length === 0 ? (
        <Card className="p-12 text-center">
          <WarehouseIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No warehouses yet</h3>
          <p className="text-muted-foreground mb-4">Create your first warehouse to start tracking inventory</p>
          <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Warehouse</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh: any) => (
            <Link key={wh.id} href={`/inventory/warehouses/${wh.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{wh.name}</h3>
                    <p className="text-sm text-muted-foreground">Code: {wh.code}</p>
                  </div>
                  <Badge variant="outline">{wh.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{wh._count?.stockItems || 0} stock items</p>
                {wh.isDefault && <Badge className="mt-2" variant="secondary">Default</Badge>}
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Warehouse</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., CD-SP" /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{WAREHOUSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.code}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
