'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kaven/ui-base';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

const LEASE_STATUSES = ['DRAFT', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED'] as const;

const leaseStatusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPIRING_SOON: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/20',
  TERMINATED: 'bg-red-500/10 text-red-400 border-red-500/20',
  RENEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function LeasesPage() {
  const { tenant } = useTenant();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['leases', tenant?.id, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/api/v1/property-management/leases', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const leases = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-management"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Leases</h1>
          <p className="text-muted-foreground">Contract lifecycle management</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {LEASE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : leases.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No leases found</h3>
          <p className="text-muted-foreground">Create leases from property detail pages</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {leases.map((lease: any) => (
            <Link key={lease.id} href={`/property-management/leases/${lease.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{lease.property?.name}{lease.unit ? ` - Unit ${lease.unit.unitNumber}` : ''}</h3>
                    <p className="text-sm text-muted-foreground">Renter: {lease.renter?.name} | R$ {lease.monthlyRent?.toLocaleString('pt-BR')}/mo</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lease.startDate).toLocaleDateString('pt-BR')} - {new Date(lease.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={leaseStatusColors[lease.status] || ''} variant="outline">{lease.status?.replace('_', ' ')}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{lease._count?.rentPayments || 0} payments</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
