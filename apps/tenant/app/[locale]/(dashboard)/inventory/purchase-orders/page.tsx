'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kaven/ui-base';
import { ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';

const PO_STATUSES = ['DRAFT', 'SENT', 'CONFIRMED', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED'] as const;

const poStatusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONFIRMED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  PARTIAL_RECEIVED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PurchaseOrdersPage() {
  const { tenant } = useTenant();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', tenant?.id, statusFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/api/v1/inventory/purchase-orders', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const orders = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Supplier ordering and receiving</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {PO_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No purchase orders</h3>
          <p className="text-muted-foreground">Create purchase orders to replenish inventory</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order: any) => (
            <Link key={order.id} href={`/inventory/purchase-orders/${order.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{order.orderNumber}</h3>
                  <p className="text-sm text-muted-foreground">{order.supplierName} | {order._count?.items || 0} items</p>
                </div>
                <div className="text-right">
                  <Badge className={poStatusColors[order.status] || ''} variant="outline">{order.status?.replace('_', ' ')}</Badge>
                  <p className="text-sm font-medium mt-1">R$ {order.total?.toLocaleString('pt-BR')}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
