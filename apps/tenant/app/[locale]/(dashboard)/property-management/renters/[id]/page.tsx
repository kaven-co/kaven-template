'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge, Button } from '@kaven/ui-base';
import { ArrowLeft, User, Shield } from 'lucide-react';
import Link from 'next/link';

export default function RenterDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const id = params?.id as string;

  const { data: renter, isLoading } = useQuery({
    queryKey: ['renter', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/property-management/renters/${id}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!id,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><Card className="h-48 bg-muted" /></div>;
  if (!renter) return <div className="text-center py-12 text-muted-foreground">Renter not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-management/renters"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">{renter.name}</h1>
          <p className="text-muted-foreground">{renter.cpf || 'No CPF'}{renter.email ? ` | ${renter.email}` : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="h-4 w-4" /> Personal Info</h2>
          <div className="space-y-2 text-sm">
            {renter.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="ml-2">{renter.phone}</span></div>}
            {renter.profession && <div><span className="text-muted-foreground">Profession:</span> <span className="ml-2">{renter.profession}</span></div>}
            {renter.monthlyIncome && <div><span className="text-muted-foreground">Monthly Income:</span> <span className="ml-2">R$ {renter.monthlyIncome?.toLocaleString('pt-BR')}</span></div>}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4" /> Guarantors</h2>
          {renter.guarantors?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guarantors registered</p>
          ) : (
            <div className="space-y-2">
              {renter.guarantors?.map((g: any) => (
                <div key={g.id} className="border rounded p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{g.name}</span>
                    <Badge variant="outline" className="text-xs">{g.type?.replace('_', ' ')}</Badge>
                  </div>
                  {g.cpf && <p className="text-xs text-muted-foreground">CPF: {g.cpf}</p>}
                  {g.coverageAmount && <p className="text-xs text-muted-foreground">Coverage: R$ {g.coverageAmount?.toLocaleString('pt-BR')}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {renter.leases?.length > 0 && (
        <Card className="p-4">
          <h2 className="font-semibold mb-4">Leases</h2>
          <div className="space-y-2">
            {renter.leases?.map((lease: any) => (
              <Link key={lease.id} href={`/property-management/leases/${lease.id}`}>
                <div className="border rounded p-3 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lease.property?.name}{lease.unit ? ` - Unit ${lease.unit.unitNumber}` : ''}</span>
                    <Badge variant="outline">{lease.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
