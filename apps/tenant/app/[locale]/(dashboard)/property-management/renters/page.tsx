'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@kaven/ui-base';
import { Plus, Search, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RentersPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['renters', tenant?.id, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/api/v1/property-management/renters', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const renters = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.post('/api/v1/property-management/renters', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renters'] });
      setIsCreateOpen(false);
      setForm({ name: '', email: '', phone: '', cpf: '' });
      toast.success('Renter created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Error creating renter'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-management"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Renters</h1>
          <p className="text-muted-foreground">Manage tenants and their guarantors</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Renter</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, CPF or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i} className="h-16 animate-pulse bg-muted" />)}</div>
      ) : renters.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No renters yet</h3>
          <p className="text-muted-foreground mb-4">Add your first renter to start managing leases</p>
          <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Renter</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {renters.map((renter: any) => (
            <Link key={renter.id} href={`/property-management/renters/${renter.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{renter.name}</h3>
                  <p className="text-sm text-muted-foreground">{renter.cpf || 'No CPF'} {renter.email ? `| ${renter.email}` : ''}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {renter._count?.leases || 0} leases | {renter._count?.guarantors || 0} guarantors
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Renter</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>CPF</Label><Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
