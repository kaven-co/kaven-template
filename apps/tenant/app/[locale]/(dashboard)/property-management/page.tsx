'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@kaven/ui-base';
import { Plus, Search, Building2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const PROPERTY_TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED'] as const;
const PROPERTY_STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE'] as const;

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  OCCUPIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UNAVAILABLE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PropertyManagementPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'RESIDENTIAL', addressStreet: '', addressCity: '', addressState: '', addressZipCode: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['properties', tenant?.id, search, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/api/v1/property-management/properties', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const properties = data?.data || [];

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await api.post('/api/v1/property-management/properties', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreateOpen(false);
      setForm({ name: '', type: 'RESIDENTIAL', addressStreet: '', addressCity: '', addressState: '', addressZipCode: '' });
      toast.success('Property created');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Error creating property'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Property Management</h1>
          <p className="text-muted-foreground">Manage your properties, units, renters and leases</p>
        </div>
        <div className="flex gap-2">
          <Link href="/property-management/renters">
            <Button variant="outline">Renters</Button>
          </Link>
          <Link href="/property-management/leases">
            <Button variant="outline">Leases</Button>
          </Link>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Property
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search properties..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {PROPERTY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No properties yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first property</p>
          <Button onClick={() => setIsCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Property</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property: any) => (
            <Link key={property.id} href={`/property-management/${property.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{property.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{property.type.toLowerCase()}</p>
                  </div>
                  <Badge className={statusColors[property.status] || ''} variant="outline">{property.status}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.addressCity}, {property.addressState}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{property._count?.units || 0} units</span>
                  <span>{property._count?.leases || 0} leases</span>
                  {property.area && <span>{property.area} m²</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Property</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Street</Label><Input value={form.addressStreet} onChange={(e) => setForm({ ...form, addressStreet: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>City</Label><Input value={form.addressCity} onChange={(e) => setForm({ ...form, addressCity: e.target.value })} /></div>
              <div><Label>State</Label><Input value={form.addressState} onChange={(e) => setForm({ ...form, addressState: e.target.value })} maxLength={2} /></div>
              <div><Label>ZIP</Label><Input value={form.addressZipCode} onChange={(e) => setForm({ ...form, addressZipCode: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.addressStreet || !form.addressCity || !form.addressState || !form.addressZipCode}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
