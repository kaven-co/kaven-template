'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, Truck } from 'lucide-react';
import Link from 'next/link';

const poStatusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONFIRMED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  PARTIAL_RECEIVED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RECEIVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => { const res = await api.get(`/api/v1/inventory/purchase-orders/${id}`); return res.data; },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!order) return <div className="text-center py-12 text-muted-foreground">Purchase order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/purchase-orders"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <Badge className={poStatusColors[order.status] || ''} variant="outline">{order.status?.replace('_', ' ')}</Badge>
          </div>
          <p className="text-muted-foreground">Supplier: {order.supplierName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-4 w-4" /> Order Items</h2>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.stockItem?.name}</span>
                  <span className="text-muted-foreground ml-2">SKU: {item.stockItem?.sku}</span>
                </div>
                <div className="text-right">
                  <span>Ordered: {item.quantity} | Received: {item.receivedQuantity}</span>
                  <span className="font-medium ml-2">R$ {item.total?.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4">Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {order.subtotal?.toLocaleString('pt-BR')}</span></div>
            {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>R$ {order.shippingCost?.toLocaleString('pt-BR')}</span></div>}
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>R$ {order.total?.toLocaleString('pt-BR')}</span></div>
            {order.expectedDate && <div className="mt-3"><span className="text-muted-foreground">Expected:</span> <span className="ml-2">{new Date(order.expectedDate).toLocaleDateString('pt-BR')}</span></div>}
            {order.supplierEmail && <div><span className="text-muted-foreground">Email:</span> <span className="ml-2">{order.supplierEmail}</span></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
