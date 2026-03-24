'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Badge, Input } from '@kaven/ui-base';
import { ArrowLeft, Search, Package } from 'lucide-react';
import Link from 'next/link';

export default function StockItemsPage() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['stock-items', tenant?.id, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/api/v1/inventory/stock-items', { params });
      return res.data;
    },
    enabled: !!tenant?.id,
  });

  const items = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Stock Items</h1>
          <p className="text-muted-foreground">Inventory levels per SKU and warehouse</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by SKU, name or barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Card key={i} className="h-16 animate-pulse bg-muted" />)}</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No stock items</h3>
          <p className="text-muted-foreground">Stock items are created when you add inventory to warehouses</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => (
            <Link key={item.id} href={`/inventory/stock-items/${item.id}`}>
              <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {item.sku} | {item.warehouse?.name} ({item.warehouse?.code})</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} <span className="text-sm text-muted-foreground font-normal">in stock</span></p>
                  {item.reservedQty > 0 && <p className="text-xs text-muted-foreground">{item.reservedQty} reserved</p>}
                  {item.reorderPoint && item.quantity <= item.reorderPoint && (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20" variant="outline">Low Stock</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
