/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import { Button, Card, Badge } from '@kaven/ui-base';
import {
  FileText,
  Users,
  PenTool,
  CheckCircle,
  Paperclip,
  MessageSquare,
  History,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['REVIEW', 'CANCELLED'],
  REVIEW: ['DRAFT', 'PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REVIEW', 'CANCELLED'],
  APPROVED: ['SENT_FOR_SIGN', 'CANCELLED'],
  SENT_FOR_SIGN: ['SIGNED', 'CANCELLED'],
  SIGNED: ['ACTIVE'],
  ACTIVE: ['EXPIRED', 'CANCELLED', 'ARCHIVED'],
  EXPIRED: ['ARCHIVED', 'ACTIVE'],
  CANCELLED: ['ARCHIVED'],
  ARCHIVED: [],
};

const statusColors: Record<string, string> = {
  DRAFT: 'secondary',
  REVIEW: 'outline',
  PENDING_APPROVAL: 'outline',
  APPROVED: 'default',
  SENT_FOR_SIGN: 'outline',
  SIGNED: 'default',
  ACTIVE: 'default',
  EXPIRED: 'destructive',
  CANCELLED: 'destructive',
  ARCHIVED: 'secondary',
};

export default function ContractDetailPage() {
  const params = useParams();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const contractId = params?.id as string;

  const { data: contract, isLoading } = useQuery({
    queryKey: ['legal-contract', tenant?.id, contractId],
    queryFn: () => api.get(`/api/v1/legal/contracts/${contractId}`).then((r) => r.data),
    enabled: !!tenant?.id && !!contractId,
  });

  const transitionMutation = useMutation({
    mutationFn: (toStatus: string) =>
      api.post(`/api/v1/legal/contracts/${contractId}/transition`, { toStatus }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-contract'] });
      toast.success('Status updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to transition'),
  });

  const createVersionMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/legal/contracts/${contractId}/versions`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-contract'] });
      toast.success('New version created');
    },
    onError: () => toast.error('Failed to create version'),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!contract) return <div className="p-8 text-center text-muted-foreground">Contract not found</div>;

  const allowedTransitions = VALID_TRANSITIONS[contract.status] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            <p className="text-muted-foreground">
              {contract.contractNumber && <span>{contract.contractNumber} &middot; </span>}
              {contract.type} &middot; v{contract.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={(statusColors[contract.status] || 'outline') as any} className="text-sm">
            {contract.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => createVersionMutation.mutate()}>
            <GitBranch className="w-4 h-4 mr-1" />
            New Version
          </Button>
        </div>
      </div>

      {/* State Machine Transitions */}
      {allowedTransitions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Available Transitions
          </h3>
          <div className="flex flex-wrap gap-2">
            {allowedTransitions.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => transitionMutation.mutate(status)}
                disabled={transitionMutation.isPending}
              >
                {status.replace(/_/g, ' ')}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 space-y-2">
          <h3 className="font-semibold">Details</h3>
          {contract.value && (
            <div className="text-sm">
              <span className="text-muted-foreground">Value:</span> {contract.currency}{' '}
              {contract.value.toLocaleString()}
            </div>
          )}
          {contract.effectiveDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Effective:</span>{' '}
              {new Date(contract.effectiveDate).toLocaleDateString()}
            </div>
          )}
          {contract.expiresAt && (
            <div className="text-sm">
              <span className="text-muted-foreground">Expires:</span>{' '}
              {new Date(contract.expiresAt).toLocaleDateString()}
            </div>
          )}
          {contract.autoRenew && (
            <Badge variant="outline">Auto-renew ({contract.renewalPeriodDays} days)</Badge>
          )}
        </Card>

        {contract.description && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{contract.description}</p>
          </Card>
        )}
      </div>

      {/* Parties */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Parties ({contract.parties?.length || 0})
        </h3>
        <div className="divide-y">
          {contract.parties?.map((party: any) => (
            <div key={party.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{party.name}</div>
                <div className="text-sm text-muted-foreground">
                  {party.document && <span>{party.document} &middot; </span>}
                  {party.entity?.name && <span>({party.entity.name})</span>}
                </div>
              </div>
              <Badge variant="outline">{party.role}</Badge>
            </div>
          ))}
          {!contract.parties?.length && (
            <div className="text-sm text-muted-foreground py-2">No parties added</div>
          )}
        </div>
      </Card>

      {/* Signers */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          Signers ({contract.signers?.length || 0})
        </h3>
        <div className="divide-y">
          {contract.signers?.map((signer: any) => (
            <div key={signer.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{signer.name}</div>
                <div className="text-sm text-muted-foreground">{signer.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{signer.authMethod}</Badge>
                {signer.signedAt && (
                  <Badge variant="default">
                    Signed {new Date(signer.signedAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Obligations */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Obligations ({contract.obligations?.length || 0})
        </h3>
        <div className="divide-y">
          {contract.obligations?.map((obligation: any) => (
            <div key={obligation.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{obligation.title}</div>
                <div className="text-sm text-muted-foreground">
                  {obligation.owner?.name && <span>{obligation.owner.name} &middot; </span>}
                  {obligation.dueDate && (
                    <span>Due: {new Date(obligation.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <Badge variant={obligation.status === 'COMPLETED' ? 'default' : 'outline'}>
                {obligation.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Attachments ({contract.attachments?.length || 0})
        </h3>
        <div className="divide-y">
          {contract.attachments?.map((attachment: any) => (
            <div key={attachment.id} className="flex items-center justify-between py-3">
              <div className="font-medium text-sm">{attachment.fileName}</div>
              <div className="text-xs text-muted-foreground">
                {attachment.uploadedBy?.name} &middot;{' '}
                {new Date(attachment.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Notes ({contract.notes?.length || 0})
        </h3>
        <div className="divide-y">
          {contract.notes?.map((note: any) => (
            <div key={note.id} className="py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{note.author?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()}
                </span>
                {note.isInternal && <Badge variant="outline" className="text-xs">Internal</Badge>}
              </div>
              <p className="text-sm">{note.content}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Status History (Timeline) */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <History className="w-4 h-4" />
          Status Timeline
        </h3>
        <div className="space-y-3">
          {contract.statusHistory?.map((entry: any) => (
            <div key={entry.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <div className="text-sm font-medium">
                  {entry.fromStatus} → {entry.toStatus}
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.changedBy?.name} &middot;{' '}
                  {new Date(entry.createdAt).toLocaleString()}
                  {entry.reason && <span> &middot; {entry.reason}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Version History */}
      {(contract.parent || contract.childVersions?.length > 0) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Version History
          </h3>
          {contract.parent && (
            <div className="text-sm mb-2">
              Parent: v{contract.parent.version} — {contract.parent.title}
            </div>
          )}
          {contract.childVersions?.map((v: any) => (
            <div key={v.id} className="text-sm text-muted-foreground">
              v{v.version} — {v.title} ({v.status})
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
