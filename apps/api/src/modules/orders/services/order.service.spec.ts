import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from './order.service';

const prismaMock = vi.hoisted(() => ({
  order: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrderService();
  });

  // ─── listOrders ───────────────────────────────────────────────────────────

  describe('listOrders', () => {
    it('should return paginated orders for a tenant', async () => {
      const mockOrders = [{ id: 'ord-1', orderNumber: 'ORD-001' }];
      prismaMock.order.findMany.mockResolvedValue(mockOrders);
      prismaMock.order.count.mockResolvedValue(1);

      const result = await service.listOrders('tenant-1', 1, 10);

      expect(result.orders).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null }),
        }),
      );
    });

    it('should list all orders without tenant filter', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(0);

      await service.listOrders(undefined, 1, 10);

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(50);

      const result = await service.listOrders('tenant-1', 3, 10);

      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.page).toBe(3);
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should use default page=1 and limit=10', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(0);

      await service.listOrders('tenant-1');

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should order by createdAt descending', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(0);

      await service.listOrders('tenant-1');

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });

    it('should exclude soft-deleted orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);
      prismaMock.order.count.mockResolvedValue(0);

      await service.listOrders('tenant-1');

      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  // ─── getOrderById ─────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = { id: 'ord-1', orderNumber: 'ORD-001', deletedAt: null };
      prismaMock.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getOrderById('ord-1');

      expect(result.id).toBe('ord-1');
    });

    it('should throw when order not found', async () => {
      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrderById('ord-nonexistent'),
      ).rejects.toThrow('Order não encontrada');
    });

    it('should throw when order is soft-deleted', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        deletedAt: new Date(),
      });

      await expect(service.getOrderById('ord-1')).rejects.toThrow(
        'Order não encontrada',
      );
    });

    it('should filter by tenantId when provided', async () => {
      prismaMock.order.findFirst.mockResolvedValue({ id: 'ord-1', deletedAt: null });

      await service.getOrderById('ord-1', 'tenant-1');

      expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should include payments in response', async () => {
      prismaMock.order.findFirst.mockResolvedValue({
        id: 'ord-1',
        payments: [{ id: 'pay-1' }],
        deletedAt: null,
      });

      await service.getOrderById('ord-1');

      expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ include: { payments: true } }),
      );
    });
  });

  // ─── createOrder ──────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('should create order with generated number', async () => {
      prismaMock.order.count.mockResolvedValue(10);
      prismaMock.order.create.mockResolvedValue({
        id: 'ord-1',
        orderNumber: 'ORD-20260215-0011',
        status: 'PENDING',
      });

      const result = await service.createOrder({
        tenantId: 'tenant-1',
        totalAmount: 250,
      });

      expect(result.orderNumber).toBeDefined();
      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            totalAmount: 250,
            status: 'PENDING',
          }),
        }),
      );
    });

    it('should default currency to BRL', async () => {
      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.order.create.mockResolvedValue({ id: 'ord-1' });

      await service.createOrder({
        tenantId: 'tenant-1',
        totalAmount: 100,
      });

      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'BRL' }),
        }),
      );
    });

    it('should use provided currency', async () => {
      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.order.create.mockResolvedValue({ id: 'ord-1' });

      await service.createOrder({
        tenantId: 'tenant-1',
        totalAmount: 100,
        currency: 'USD',
      });

      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'USD' }),
        }),
      );
    });

    it('should default metadata to null when not provided', async () => {
      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.order.create.mockResolvedValue({ id: 'ord-1' });

      await service.createOrder({
        tenantId: 'tenant-1',
        totalAmount: 100,
      });

      expect(prismaMock.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: null }),
        }),
      );
    });
  });

  // ─── updateOrderStatus ────────────────────────────────────────────────────

  describe('updateOrderStatus', () => {
    it('should update status successfully', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'ord-1', deletedAt: null });
      prismaMock.order.update.mockResolvedValue({ id: 'ord-1', status: 'COMPLETED' });

      const result = await service.updateOrderStatus('ord-1', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw when order not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('ord-nonexistent', 'COMPLETED'),
      ).rejects.toThrow('Order não encontrada');
    });

    it('should throw when order is soft-deleted', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'ord-1',
        deletedAt: new Date(),
      });

      await expect(
        service.updateOrderStatus('ord-1', 'COMPLETED'),
      ).rejects.toThrow('Order não encontrada');
    });

    it('should support CANCELED status', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'ord-1', deletedAt: null });
      prismaMock.order.update.mockResolvedValue({ id: 'ord-1', status: 'CANCELED' });

      const result = await service.updateOrderStatus('ord-1', 'CANCELED');

      expect(result.status).toBe('CANCELED');
    });

    it('should support REFUNDED status', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'ord-1', deletedAt: null });
      prismaMock.order.update.mockResolvedValue({ id: 'ord-1', status: 'REFUNDED' });

      const result = await service.updateOrderStatus('ord-1', 'REFUNDED');

      expect(result.status).toBe('REFUNDED');
    });
  });

  // ─── deleteOrder ──────────────────────────────────────────────────────────

  describe('deleteOrder', () => {
    it('should soft-delete order', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ id: 'ord-1', deletedAt: null });
      prismaMock.order.update.mockResolvedValue({ id: 'ord-1', deletedAt: new Date() });

      const result = await service.deleteOrder('ord-1');

      expect(result.message).toContain('sucesso');
      expect(prismaMock.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { deletedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw when order not found', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      await expect(service.deleteOrder('ord-nonexistent')).rejects.toThrow(
        'Order não encontrada',
      );
    });

    it('should throw when order already soft-deleted', async () => {
      prismaMock.order.findUnique.mockResolvedValue({
        id: 'ord-1',
        deletedAt: new Date(),
      });

      await expect(service.deleteOrder('ord-1')).rejects.toThrow(
        'Order não encontrada',
      );
    });
  });
});
