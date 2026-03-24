'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';

const leaseStatusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  EXPIRING_SOON: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  EXPIRED: 'bg-red-500/10 text-red-400 border-red-500/20',
  TERMINATED: 'bg-red-500/10 text-red-400 border-red-500/20',
  RENEWED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20',
  PARTIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CANCELLED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export default function LeaseDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: lease, isLoading } = useQuery({
    queryKey: ['lease', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/property-management/leases/${id}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!lease) return <div className="text-center py-12 text-muted-foreground">Lease not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-management/leases"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{lease.property?.name}{lease.unit ? ` - Unit ${lease.unit?.unitNumber}` : ''}</h1>
            <Badge className={leaseStatusColors[lease.status] || ''} variant="outline">{lease.status?.replace('_', ' ')}</Badge>
          </div>
          <p className="text-muted-foreground">Renter: {lease.renter?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Contract Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Start Date:</span> <span className="ml-2">{new Date(lease.startDate).toLocaleDateString('pt-BR')}</span></div>
            <div><span className="text-muted-foreground">End Date:</span> <span className="ml-2">{new Date(lease.endDate).toLocaleDateString('pt-BR')}</span></div>
            <div><span className="text-muted-foreground">Monthly Rent:</span> <span className="ml-2">R$ {lease.monthlyRent?.toLocaleString('pt-BR')}</span></div>
            <div><span className="text-muted-foreground">Adjustment Index:</span> <span className="ml-2">{lease.adjustmentIndex}</span></div>
            {lease.deposit && <div><span className="text-muted-foreground">Deposit:</span> <span className="ml-2">R$ {lease.deposit?.toLocaleString('pt-BR')}</span></div>}
            {lease.adjustmentMonth && <div><span className="text-muted-foreground">Adjustment Month:</span> <span className="ml-2">{lease.adjustmentMonth}</span></div>}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4">Renter</h2>
          <div className="space-y-2 text-sm">
            <div className="font-medium">{lease.renter?.name}</div>
            {lease.renter?.cpf && <div className="text-muted-foreground">CPF: {lease.renter.cpf}</div>}
            {lease.renter?.guarantors?.length > 0 && (
              <div className="text-muted-foreground">{lease.renter.guarantors.length} guarantor(s)</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Rent Payments</h2>
        {lease.rentPayments?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No payments generated yet</p>
        ) : (
          <div className="space-y-2">
            {lease.rentPayments?.map((payment: any) => (
              <div key={payment.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ref: {payment.referenceMonth || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">R$ {payment.amount?.toLocaleString('pt-BR')}</p>
                  <Badge className={paymentStatusColors[payment.status] || ''} variant="outline">{payment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
