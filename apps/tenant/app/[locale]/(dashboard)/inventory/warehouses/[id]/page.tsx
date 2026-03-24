'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function WarehouseDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: warehouse, isLoading } = useQuery({
    queryKey: ['warehouse', id],
    queryFn: async () => { const res = await api.get(`/api/v1/inventory/warehouses/${id}`); return res.data; },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!warehouse) return <div className="text-center py-12 text-muted-foreground">Warehouse not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory/warehouses"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{warehouse.name}</h1>
            <Badge variant="outline">{warehouse.type}</Badge>
            {warehouse.isDefault && <Badge variant="secondary">Default</Badge>}
          </div>
          <p className="text-muted-foreground">Code: {warehouse.code} | {warehouse._count?.stockItems || 0} items</p>
        </div>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Package className="h-4 w-4" /> Stock Items</h2>
        {warehouse.stockItems?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No stock items in this warehouse</p>
        ) : (
          <div className="space-y-2">
            {warehouse.stockItems?.map((item: any) => (
              <Link key={item.id} href={`/inventory/stock-items/${item.id}`}>
                <div className="border rounded p-3 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">SKU: {item.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{item.quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">in stock</span>
                    {item.reorderPoint && item.quantity <= item.reorderPoint && (
                      <Badge className="ml-2 bg-amber-500/10 text-amber-400 border-amber-500/20" variant="outline">Low</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
