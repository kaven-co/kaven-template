import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService } from './invoice.service';

const prismaMock = vi.hoisted(() => ({
  invoice: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((callback: any) => callback(prismaMock)),
}));

const emailMock = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

vi.mock('../../../lib/email', () => ({
  emailServiceV2: emailMock,
}));

vi.mock('../../../lib/email/types', () => ({
  EmailType: { TRANSACTIONAL: 'TRANSACTIONAL' },
}));

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvoiceService();
  });

  // ─── getStats ─────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return aggregated stats for a tenant', async () => {
      prismaMock.invoice.aggregate.mockResolvedValue({
        _count: 10,
        _sum: { amountDue: 1000 },
      });

      const result = await service.getStats('tenant-1');

      expect(result.total.count).toBe(10);
      expect(result.total.amount).toBe(1000);
      expect(result.paid).toBeDefined();
      expect(result.pending).toBeDefined();
      expect(result.overdue).toBeDefined();
      expect(result.draft).toBeDefined();
      expect(result.canceled).toBeDefined();
    });

    it('should return stats without tenantId filter', async () => {
      prismaMock.invoice.aggregate.mockResolvedValue({
        _count: 5,
        _sum: { amountDue: 500 },
      });

      const result = await service.getStats();

      expect(result.total.count).toBe(5);
    });

    it('should handle null amountDue sum as 0', async () => {
      prismaMock.invoice.aggregate.mockResolvedValue({
        _count: 0,
        _sum: { amountDue: null },
      });

      const result = await service.getStats('tenant-1');

      expect(result.total.amount).toBe(0);
    });

    it('should call aggregate 6 times (total, paid, pending, overdue, draft, canceled)', async () => {
      prismaMock.invoice.aggregate.mockResolvedValue({
        _count: 0,
        _sum: { amountDue: 0 },
      });

      await service.getStats('tenant-1');

      expect(prismaMock.invoice.aggregate).toHaveBeenCalledTimes(6);
    });
  });

  // ─── listInvoices ─────────────────────────────────────────────────────────

  describe('listInvoices', () => {
    it('should return paginated invoices', async () => {
      const mockInvoices = [{ id: 'inv-1', invoiceNumber: 'INV-001' }];
      prismaMock.invoice.findMany.mockResolvedValue(mockInvoices);
      prismaMock.invoice.count.mockResolvedValue(1);

      const result = await service.listInvoices({ tenantId: 'tenant-1' });

      expect(result.invoices).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter by status', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.invoice.count.mockResolvedValue(0);

      await service.listInvoices({ status: 'PAID' });

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PAID' }),
        }),
      );
    });

    it('should apply search filter', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.invoice.count.mockResolvedValue(0);

      await service.listInvoices({ search: 'INV-001' });

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.invoice.count.mockResolvedValue(50);

      const result = await service.listInvoices({ page: 3, limit: 10 });

      expect(result.pagination.totalPages).toBe(5);
      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should exclude soft-deleted invoices', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.invoice.count.mockResolvedValue(0);

      await service.listInvoices({});

      expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  // ─── getInvoiceById ───────────────────────────────────────────────────────

  describe('getInvoiceById', () => {
    it('should return invoice by id', async () => {
      const mockInvoice = { id: 'inv-1', invoiceNumber: 'INV-001', deletedAt: null };
      prismaMock.invoice.findFirst.mockResolvedValue(mockInvoice);

      const result = await service.getInvoiceById('inv-1');

      expect(result.id).toBe('inv-1');
    });

    it('should throw when invoice not found', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.getInvoiceById('inv-nonexistent'),
      ).rejects.toThrow('Invoice não encontrada');
    });

    it('should throw when invoice is soft-deleted', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        deletedAt: new Date(),
      });

      await expect(
        service.getInvoiceById('inv-1'),
      ).rejects.toThrow('Invoice não encontrada');
    });

    it('should filter by tenantId when provided', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({ id: 'inv-1', deletedAt: null });

      await service.getInvoiceById('inv-1', 'tenant-1');

      expect(prismaMock.invoice.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });
  });

  // ─── createInvoice ────────────────────────────────────────────────────────

  describe('createInvoice', () => {
    it('should create invoice via transaction with generated number', async () => {
      prismaMock.invoice.count.mockResolvedValue(5);
      prismaMock.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-20260215-0006-ABCD',
        status: 'PENDING',
      });

      const result = await service.createInvoice({
        tenantId: 'tenant-1',
        amountDue: 500,
        dueDate: new Date(),
      });

      expect(result.invoiceNumber).toBeDefined();
      expect(prismaMock.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            amountDue: 500,
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should default currency to BRL', async () => {
      prismaMock.invoice.count.mockResolvedValue(0);
      prismaMock.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await service.createInvoice({
        tenantId: 'tenant-1',
        amountDue: 100,
        dueDate: new Date(),
      });

      expect(prismaMock.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'BRL' }),
        }),
      );
    });

    it('should use provided currency when specified', async () => {
      prismaMock.invoice.count.mockResolvedValue(0);
      prismaMock.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await service.createInvoice({
        tenantId: 'tenant-1',
        amountDue: 100,
        dueDate: new Date(),
        currency: 'USD',
      });

      expect(prismaMock.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'USD' }),
        }),
      );
    });
  });

  // ─── updateInvoice ────────────────────────────────────────────────────────

  describe('updateInvoice', () => {
    it('should update invoice when it exists', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({ id: 'inv-1', deletedAt: null });
      prismaMock.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID' });

      const result = await service.updateInvoice('inv-1', { status: 'PAID' });

      expect(result.status).toBe('PAID');
    });

    it('should throw when invoice not found', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);

      await expect(
        service.updateInvoice('inv-nonexistent', { status: 'PAID' }),
      ).rejects.toThrow('Invoice não encontrada');
    });

    it('should throw when invoice is soft-deleted', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        deletedAt: new Date(),
      });

      await expect(
        service.updateInvoice('inv-1', { status: 'PAID' }),
      ).rejects.toThrow('Invoice não encontrada');
    });
  });

  // ─── sendInvoice ──────────────────────────────────────────────────────────

  describe('sendInvoice', () => {
    it('should send email to tenant admin', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        tenantId: 'tenant-1',
        amountDue: 100,
        currency: 'BRL',
        dueDate: new Date(),
        invoiceNumber: 'INV-001',
        tenant: { name: 'Test Corp' },
        metadata: {},
        deletedAt: null,
      } as any);
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@test.com',
        name: 'Admin',
      });
      prismaMock.invoice.update.mockResolvedValue({});

      const result = await service.sendInvoice('inv-1');

      expect(result.message).toContain('sucesso');
      expect(emailMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@test.com',
          template: 'invoice',
        }),
      );
    });

    it('should throw when no admin found', async () => {
      prismaMock.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        tenantId: 'tenant-1',
        amountDue: 100,
        currency: 'BRL',
        dueDate: new Date(),
        invoiceNumber: 'INV-001',
        deletedAt: null,
      } as any);
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(service.sendInvoice('inv-1')).rejects.toThrow(
        'Administrador do tenant não encontrado',
      );
    });
  });

  // ─── deleteInvoice ────────────────────────────────────────────────────────

  describe('deleteInvoice', () => {
    it('should soft-delete invoice', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-001',
        deletedAt: null,
      });
      prismaMock.invoice.update.mockResolvedValue({});

      const result = await service.deleteInvoice('inv-1');

      expect(result.message).toContain('sucesso');
      expect(prismaMock.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            status: 'CANCELED',
          }),
        }),
      );
    });

    it('should throw when invoice not found', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);

      await expect(service.deleteInvoice('inv-nonexistent')).rejects.toThrow(
        'Invoice não encontrada',
      );
    });

    it('should throw when invoice already deleted', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({
        id: 'inv-1',
        deletedAt: new Date(),
      });

      await expect(service.deleteInvoice('inv-1')).rejects.toThrow(
        'Invoice não encontrada',
      );
    });
  });
});
