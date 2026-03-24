'use client';

import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { Monitor, ClipboardList, UserCheck, Package } from 'lucide-react';

export default function AssetManagementPage() {
  const { tenant } = useTenant();

  const { data: equipment } = useQuery({
    queryKey: ['admin-equipment', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/admin/equipment', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: availableEquipment } = useQuery({
    queryKey: ['admin-equipment-available', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/admin/equipment', { params: { limit: '1', status: 'AVAILABLE' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: registry } = useQuery({
    queryKey: ['admin-asset-registry', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/admin/asset-registry', { params: { limit: '1' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  const { data: assignments } = useQuery({
    queryKey: ['admin-asset-assignments', tenant?.id],
    queryFn: async () => { const res = await api.get('/api/v1/admin/asset-assignments', { params: { limit: '1', status: 'ACTIVE' } }); return res.data; },
    enabled: !!tenant?.id,
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Asset Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Equipment tracking, asset registry and assignments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <Monitor className="h-8 w-8 mb-3 text-blue-500" />
          <h3 className="font-semibold">Total Equipment</h3>
          <p className="text-sm text-muted-foreground mb-3">All registered equipment</p>
          <p className="text-2xl font-bold">{equipment?.meta?.total || 0}</p>
        </Card>

        <Card className="p-6">
          <Monitor className="h-8 w-8 mb-3 text-green-500" />
          <h3 className="font-semibold">Available</h3>
          <p className="text-sm text-muted-foreground mb-3">Ready for assignment</p>
          <p className="text-2xl font-bold">{availableEquipment?.meta?.total || 0}</p>
        </Card>

        <Card className="p-6">
          <ClipboardList className="h-8 w-8 mb-3 text-purple-500" />
          <h3 className="font-semibold">Asset Registry</h3>
          <p className="text-sm text-muted-foreground mb-3">All company assets</p>
          <p className="text-2xl font-bold">{registry?.meta?.total || 0}</p>
        </Card>

        <Card className="p-6">
          <UserCheck className="h-8 w-8 mb-3 text-amber-500" />
          <h3 className="font-semibold">Active Assignments</h3>
          <p className="text-sm text-muted-foreground mb-3">Equipment assigned</p>
          <p className="text-2xl font-bold">{assignments?.meta?.total || 0}</p>
        </Card>
      </div>
    </div>
  );
}
