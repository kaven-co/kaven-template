'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card } from '@kaven/ui-base';
import { ArrowLeft, Building2, Star, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { ContractStatusBadge } from '@/components/operations/ContractStatus';
import type { Vendor, VendorContract } from '@/types/operations';

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { tenant } = useTenant();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const res = await api.get(`/api/v1/operations/vendors/${id}`);
      return res.data as Vendor & {
        contacts: Array<{ id: string; name: string; email?: string; phone?: string; role?: string; isPrimary: boolean }>;
        contracts: VendorContract[];
        scorecardHistory: Array<{ id: string; period: string; scoreOverall: number; scoredAt: string }>;
      };
    },
    enabled: !!tenant && !!id,
  });

  if (isLoading) return <Card className="p-12 animate-pulse bg-muted/50 h-64" />;
  if (!vendor) return <Card className="p-12 text-center"><p className="text-muted-foreground">Vendor not found</p></Card>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operations/vendors" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Vendors
        </Link>
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            {vendor.legalName && <p className="text-sm text-muted-foreground">{vendor.legalName}</p>}
          </div>
        </div>
      </div>

      {/* Scores */}
      {vendor.scoreOverall != null && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1"><Star className="h-4 w-4 text-amber-400" /> Scorecard</h3>
          <div className="grid grid-cols-5 gap-4 text-center">
            {[
              { label: 'Overall', value: vendor.scoreOverall },
              { label: 'Quality', value: vendor.scoreQuality },
              { label: 'Pontuality', value: vendor.scorePontuality },
              { label: 'Cost', value: vendor.scoreCost },
              { label: 'Support', value: vendor.scoreSupport },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-lg font-bold">{s.value?.toFixed(1) ?? '-'}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contacts */}
      {vendor.contacts && vendor.contacts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {vendor.contacts.map((c) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.name}</span>
                  {c.isPrimary && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">Primary</span>}
                </div>
                {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Contracts */}
      {vendor.contracts && vendor.contracts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Contracts</h3>
          <div className="space-y-2">
            {vendor.contracts.map((c: VendorContract) => (
              <Card key={c.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{c.title}</span>
                    {c.contractNumber && <span className="text-xs text-muted-foreground ml-2">#{c.contractNumber}</span>}
                  </div>
                  <ContractStatusBadge status={c.status} />
                </div>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {c.monthlyValue && <span>{c.currency} {Number(c.monthlyValue).toFixed(2)}/mo</span>}
                  <span>{new Date(c.startDate).toLocaleDateString()}{c.endDate ? ` — ${new Date(c.endDate).toLocaleDateString()}` : ''}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
