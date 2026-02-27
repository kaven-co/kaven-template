'use client';

import { useState } from 'react';
import { useInvoices, type InvoiceStatus } from '@/hooks/use-invoices';
import { Badge } from '@kaven/ui-base';
import { Button } from '@kaven/ui-base';
import { Card } from '@kaven/ui-base';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kaven/ui-base';
import { Tabs, TabsList, TabsTrigger } from '@kaven/ui-base';
import { Loader2, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------

const STATUS_TABS = [
  { value: 'all',     label: 'Todas' },
  { value: 'PAID',    label: 'Pagas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'OVERDUE', label: 'Vencidas' },
  { value: 'DRAFT',   label: 'Rascunho' },
] as const;

const STATUS_BADGE: Record<InvoiceStatus, { label: string; className: string }> = {
  PAID:     { label: 'Paga',      className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  PENDING:  { label: 'Pendente',  className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  OVERDUE:  { label: 'Vencida',   className: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  DRAFT:    { label: 'Rascunho',  className: 'bg-muted text-muted-foreground' },
  CANCELED: { label: 'Cancelada', className: 'bg-muted text-muted-foreground' },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
  }).format(amount / 100);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
}

// ----------------------------------------------------------------------

export default function InvoicesPage() {
  const [activeStatus, setActiveStatus] = useState<'all' | InvoiceStatus>('all');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { invoices, pagination, isLoading } = useInvoices({
    page,
    limit: rowsPerPage,
    status: activeStatus !== 'all' ? activeStatus : undefined,
  });

  const handleStatusChange = (value: string) => {
    setActiveStatus(value as 'all' | InvoiceStatus);
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Faturas</h1>
        <p className="text-muted-foreground mt-1">Histórico de cobranças e faturas do tenant</p>
      </div>

      <Card className="!p-0 !gap-0 block overflow-hidden border-none shadow-md bg-card dark:bg-[#212B36]">
        {/* Status Tabs */}
        <Tabs value={activeStatus} onValueChange={handleStatusChange}>
          <div className="flex items-center border-b border-border/40 px-4">
            <TabsList className="bg-transparent p-0 h-auto gap-6 justify-start">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'relative h-14 rounded-none bg-transparent px-0 pb-3 pt-3 text-sm font-semibold text-muted-foreground shadow-none',
                    '!bg-transparent !shadow-none !border-0 hover:text-foreground transition-colors',
                    'data-[state=active]:!bg-transparent data-[state=active]:text-foreground',
                    'after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:scale-x-0',
                    'after:bg-primary after:transition-transform after:duration-300 data-[state=active]:after:scale-x-100'
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-b border-dashed border-border/50 hover:bg-transparent">
                  <TableHead className="px-4 h-14 font-semibold text-foreground">Fatura</TableHead>
                  <TableHead className="px-4 h-14 font-semibold text-foreground">Emitida em</TableHead>
                  <TableHead className="px-4 h-14 font-semibold text-foreground">Vencimento</TableHead>
                  <TableHead className="px-4 h-14 font-semibold text-foreground">Valor</TableHead>
                  <TableHead className="px-4 h-14 font-semibold text-foreground">Status</TableHead>
                  <TableHead className="px-4 h-14 font-semibold text-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-muted-foreground font-medium">Nenhuma fatura encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const statusInfo = STATUS_BADGE[invoice.status] ?? STATUS_BADGE.DRAFT;
                    return (
                      <TableRow
                        key={invoice.id}
                        className="border-b border-dashed border-border/30 hover:bg-muted/30"
                      >
                        <TableCell className="px-4 py-3">
                          <span className="font-mono text-sm font-medium">
                            {invoice.invoiceNumber}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-semibold">
                          {formatCurrency(invoice.amountDue, invoice.currency)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border-0', statusInfo.className)}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            disabled
                            title="Download PDF (em breve)"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && pagination && pagination.total > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                {pagination.total} {pagination.total === 1 ? 'fatura' : 'faturas'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
