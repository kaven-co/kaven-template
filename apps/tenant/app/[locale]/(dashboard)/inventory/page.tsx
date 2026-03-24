'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { Package, Warehouse, ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const { tenant } = useTenant();

  const { data: warehouseData } = useQuery({
    queryKey: ['warehouses-count', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/inventory/warehouses', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: stockData } = useQuery({
    queryKey: ['stock-items-count', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/inventory/stock-items', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-orders-count', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/inventory/sales-orders', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: purchaseData } = useQuery({
    queryKey: ['purchase-orders-count', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/inventory/purchase-orders', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const sections = [
    { title: 'Warehouses', description: 'Manage storage locations', icon: Warehouse, count: warehouseData?.meta?.total || 0, href: '/inventory/warehouses' },
    { title: 'Stock Items', description: 'SKUs and inventory levels', icon: Package, count: stockData?.meta?.total || 0, href: '/inventory/stock-items' },
    { title: 'Sales Orders', description: 'Fulfillment pipeline', icon: ShoppingCart, count: salesData?.meta?.total || 0, href: '/inventory/sales-orders' },
    { title: 'Purchase Orders', description: 'Supplier ordering and receiving', icon: Truck, count: purchaseData?.meta?.total || 0, href: '/inventory/purchase-orders' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory & Fulfillment</h1>
        <p className="text-muted-foreground">Manage warehouses, stock, sales and purchase orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer">
              <section.icon className="h-8 w-8 mb-3 text-primary" />
              <h3 className="font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
              <p className="text-2xl font-bold">{section.count}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
