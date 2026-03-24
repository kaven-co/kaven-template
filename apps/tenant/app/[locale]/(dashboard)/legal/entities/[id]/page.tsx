/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Card, Badge } from '@kaven/ui-base';
import { Building2, User, MapPin, Mail, Phone, Globe, Shield } from 'lucide-react';

export default function LegalEntityDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const entityId = params?.id as string;

  const { data: entity, isLoading } = useQuery({
    queryKey: ['legal-entity', tenant?.id, entityId],
    queryFn: () => api.get(`/api/v1/legal/entities/${entityId}`).then((r) => r.data),
    enabled: !!tenant?.id && !!entityId,
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!entity) return <div className="p-8 text-center text-muted-foreground">Entity not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {entity.type === 'PJ' ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
        <div>
          <h1 className="text-2xl font-bold">{entity.name}</h1>
          {entity.tradeName && <p className="text-muted-foreground">{entity.tradeName}</p>}
        </div>
        <Badge className="ml-auto">{entity.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Info */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Document</h3>
          <div className="text-sm">
            <span className="text-muted-foreground">{entity.documentType}:</span> {entity.document}
          </div>
          {entity.cnpjStatus && (
            <Badge variant={entity.cnpjStatus === 'ATIVA' ? 'default' : 'destructive'}>
              {entity.cnpjStatus}
            </Badge>
          )}
        </Card>

        {/* Contact */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Contact</h3>
          {entity.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" /> {entity.email}
            </div>
          )}
          {entity.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" /> {entity.phone}
            </div>
          )}
          {entity.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" /> {entity.website}
            </div>
          )}
        </Card>

        {/* Address */}
        {entity.street && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Address
            </h3>
            <div className="text-sm">
              {entity.street}, {entity.number}
              {entity.complement && ` - ${entity.complement}`}<br />
              {entity.neighborhood && `${entity.neighborhood}, `}
              {entity.city} - {entity.state}<br />
              {entity.zipCode}
            </div>
          </Card>
        )}

        {/* DPO */}
        {entity.dpoName && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" /> DPO (Data Protection Officer)
            </h3>
            <div className="text-sm">{entity.dpoName}</div>
            {entity.dpoEmail && <div className="text-sm text-muted-foreground">{entity.dpoEmail}</div>}
          </Card>
        )}
      </div>

      {/* Representatives */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Representatives ({entity.representatives?.length || 0})</h3>
        <div className="divide-y">
          {entity.representatives?.map((rep: any) => (
            <div key={rep.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{rep.name}</div>
                <div className="text-sm text-muted-foreground">{rep.role}</div>
              </div>
              <div className="flex items-center gap-2">
                {rep.isPrimary && <Badge>Primary</Badge>}
                {rep.email && <span className="text-sm text-muted-foreground">{rep.email}</span>}
              </div>
            </div>
          ))}
          {!entity.representatives?.length && (
            <div className="text-sm text-muted-foreground py-3">No representatives added</div>
          )}
        </div>
      </Card>

      {/* Linked Contracts */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Linked Contracts ({entity.contractParties?.length || 0})</h3>
        <div className="divide-y">
          {entity.contractParties?.map((party: any) => (
            <div key={party.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{party.contract?.title}</div>
                <div className="text-sm text-muted-foreground">
                  {party.contract?.contractNumber} &middot; {party.role}
                </div>
              </div>
              <Badge variant="outline">{party.contract?.status}</Badge>
            </div>
          ))}
          {!entity.contractParties?.length && (
            <div className="text-sm text-muted-foreground py-3">No contracts linked</div>
          )}
        </div>
      </Card>
    </div>
  );
}
