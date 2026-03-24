'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const soStatusColors: Record<string, string> = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PICKING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  PACKED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SHIPPED: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['sales-order', id],
    queryFn: async () => { const res = await api.get(`/api/v1/inventory/sales-orders/${id}`); return res.data; },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!order) return <div className="text-center py-12 text-muted-foreground">Sales order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/sales-orders"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <Badge className={soStatusColors[order.status] || ''} variant="outline">{order.status}</Badge>
          </div>
          <p className="text-muted-foreground">{order.customerName || 'No customer'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Order Items</h2>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{item.stockItem?.name}</span>
                  <span className="text-muted-foreground ml-2">SKU: {item.stockItem?.sku}</span>
                </div>
                <div className="text-right">
                  <span>{item.quantity} x R$ {item.unitPrice?.toLocaleString('pt-BR')}</span>
                  <span className="font-medium ml-2">= R$ {item.total?.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {order.subtotal?.toLocaleString('pt-BR')}</span></div>
            {order.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>- R$ {order.discount?.toLocaleString('pt-BR')}</span></div>}
            {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>R$ {order.shippingCost?.toLocaleString('pt-BR')}</span></div>}
            <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>R$ {order.total?.toLocaleString('pt-BR')}</span></div>
          </div>
          {order.trackingCode && <div className="mt-4 text-sm"><span className="text-muted-foreground">Tracking:</span> <span className="ml-2">{order.trackingCode}</span></div>}
        </Card>
      </div>
    </div>
  );
}
