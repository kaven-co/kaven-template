'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, Building2, DoorOpen } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  OCCUPIED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UNAVAILABLE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/property-management/properties/${id}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /><Card className="h-64 bg-muted" /></div>;
  if (!property) return <div className="text-center py-12 text-muted-foreground">Property not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-management"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <Badge className={statusColors[property.status] || ''} variant="outline">{property.status}</Badge>
          </div>
          <p className="text-muted-foreground capitalize">{property.type?.toLowerCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4" /> Property Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Address:</span> <span className="ml-2">{property.addressStreet}{property.addressNumber ? `, ${property.addressNumber}` : ''}</span></div>
            <div><span className="text-muted-foreground">City:</span> <span className="ml-2">{property.addressCity}, {property.addressState}</span></div>
            <div><span className="text-muted-foreground">ZIP:</span> <span className="ml-2">{property.addressZipCode}</span></div>
            {property.area && <div><span className="text-muted-foreground">Area:</span> <span className="ml-2">{property.area} m²</span></div>}
            {property.marketValue && <div><span className="text-muted-foreground">Market Value:</span> <span className="ml-2">R$ {property.marketValue?.toLocaleString('pt-BR')}</span></div>}
            {property.registrationNumber && <div><span className="text-muted-foreground">Registration:</span> <span className="ml-2">{property.registrationNumber}</span></div>}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4">Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Units</span><span className="font-medium">{property.units?.length || 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Active Leases</span><span className="font-medium">{property.leases?.filter((l: any) => l.status === 'ACTIVE').length || 0}</span></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><DoorOpen className="h-4 w-4" /> Units</h2>
        </div>
        {property.units?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No units registered for this property</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.units?.map((unit: any) => (
              <Card key={unit.id} className="p-3 border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Unit {unit.unitNumber}</span>
                  <Badge variant={unit.isAvailable ? 'default' : 'secondary'}>{unit.isAvailable ? 'Available' : 'Occupied'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground capitalize mt-1">{unit.type?.toLowerCase()}{unit.floor ? ` | Floor ${unit.floor}` : ''}{unit.area ? ` | ${unit.area} m²` : ''}</p>
                {unit.monthlyRent && <p className="text-xs text-muted-foreground mt-1">Rent: R$ {unit.monthlyRent?.toLocaleString('pt-BR')}</p>}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
