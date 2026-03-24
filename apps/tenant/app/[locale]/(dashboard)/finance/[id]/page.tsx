'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/lib/hooks/use-tenant';
import { api } from '@/lib/api';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@kaven/ui-base';
import { ArrowLeft, Calendar, User, Tag, Paperclip, StickyNote } from 'lucide-react';
import { AmountDisplay } from '@/components/finance/AmountDisplay';
import { StatusBadge } from '@/components/finance/StatusBadge';
import type { FinancialEntry } from '@/types/finance';

export default function FinancialEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenant();
  const entryId = params?.id as string;

  const { data: entry, isLoading } = useQuery<FinancialEntry>({
    queryKey: ['finance-entry', tenant?.id, entryId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/finance/entries/${entryId}`);
      return res.data;
    },
    enabled: !!tenant?.id && !!entryId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">Entry not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{entry.description || 'Financial Entry'}</h1>
          <p className="text-muted-foreground">
            {entry.type.charAt(0).toUpperCase() + entry.type.slice(1).replace('_', ' ')}
          </p>
        </div>
        <StatusBadge status={entry.status} />
        <AmountDisplay
          amount={entry.totalAmount}
          type={entry.type}
          currency={entry.currency}
          className="text-2xl font-bold"
        />
      </div>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entry Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Cash Date (DFC)">
              {new Date(entry.dateDFC).toLocaleDateString('pt-BR')}
            </DetailRow>
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Accrual Date (DRE)">
              {new Date(entry.dateDRE).toLocaleDateString('pt-BR')}
            </DetailRow>
            {entry.dueDate && (
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Due Date">
                {new Date(entry.dueDate).toLocaleDateString('pt-BR')}
              </DetailRow>
            )}
            {entry.paidAt && (
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Paid At">
                {new Date(entry.paidAt).toLocaleDateString('pt-BR')}
              </DetailRow>
            )}
            {entry.client && (
              <DetailRow icon={<User className="h-4 w-4" />} label="Client">
                {entry.client.fullName}
              </DetailRow>
            )}
            {entry.createdBy && (
              <DetailRow icon={<User className="h-4 w-4" />} label="Created By">
                {entry.createdBy.name}
              </DetailRow>
            )}
            {entry.notes && (
              <DetailRow icon={<StickyNote className="h-4 w-4" />} label="Notes">
                {entry.notes}
              </DetailRow>
            )}
            {entry.attachmentUrl && (
              <DetailRow icon={<Paperclip className="h-4 w-4" />} label="Attachment">
                <a href={entry.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  View attachment
                </a>
              </DetailRow>
            )}
            {entry.tags.length > 0 && (
              <DetailRow icon={<Tag className="h-4 w-4" />} label="Tags">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DetailRow>
            )}
          </CardContent>
        </Card>

        {/* Split lines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Entry Lines ({entry.lines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entry.lines.map((line, index) => (
                <div key={line.id}>
                  {index > 0 && <hr className="my-2 border-border" />}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {line.chartOfAccount?.name || 'Unknown Account'}
                      </p>
                      {line.chartOfAccount?.code && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {line.chartOfAccount.code}
                        </p>
                      )}
                      {line.bankAccount && (
                        <p className="text-xs text-muted-foreground">
                          {line.bankAccount.name}
                        </p>
                      )}
                      {line.costCenter && (
                        <p className="text-xs text-muted-foreground">
                          CC: {line.costCenter.name}
                        </p>
                      )}
                      {line.description && (
                        <p className="text-xs text-muted-foreground">{line.description}</p>
                      )}
                    </div>
                    <AmountDisplay
                      amount={line.amount}
                      type={entry.type}
                      className="font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
