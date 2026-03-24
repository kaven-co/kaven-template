'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Button } from '@kaven/ui-base';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

const movementTypeColors: Record<string, string> = {
  IN: 'text-emerald-400',
  OUT: 'text-red-400',
  RESERVE: 'text-amber-400',
  RELEASE: 'text-blue-400',
  ADJUST: 'text-purple-400',
  TRANSFER: 'text-cyan-400',
  RETURN_SUPPLIER: 'text-red-300',
  RETURN_CUSTOMER: 'text-emerald-300',
};

export default function StockItemDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: item, isLoading } = useQuery({
    queryKey: ['stock-item', id],
    queryFn: async () => { const res = await api.get(`/api/v1/inventory/stock-items/${id}`); return res.data; },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!item) return <div className="text-center py-12 text-muted-foreground">Stock item not found</div>;

  const available = item.quantity - item.reservedQty;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/stock-items"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-muted-foreground">SKU: {item.sku} | {item.warehouse?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">In Stock</p>
          <p className="text-3xl font-bold">{item.quantity}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Reserved</p>
          <p className="text-3xl font-bold text-amber-400">{item.reservedQty}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-3xl font-bold text-emerald-400">{available}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Cost Price</p>
          <p className="text-3xl font-bold">{item.costPrice ? `R$ ${item.costPrice.toLocaleString('pt-BR')}` : '-'}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-4">Movement History</h2>
        {item.movements?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No movements recorded</p>
        ) : (
          <div className="space-y-2">
            {item.movements?.map((mov: any) => (
              <div key={mov.id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {['IN', 'RETURN_CUSTOMER', 'RELEASE'].includes(mov.type) ? (
                    <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-400" />
                  )}
                  <div>
                    <span className={`font-medium ${movementTypeColors[mov.type] || ''}`}>{mov.type}</span>
                    <span className="text-muted-foreground ml-2">x{mov.quantity}</span>
                    {mov.reason && <p className="text-xs text-muted-foreground">{mov.reason}</p>}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(mov.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p>{mov.createdBy?.name || 'System'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
