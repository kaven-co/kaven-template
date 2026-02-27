import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from './audit.service';

const prismaMock = vi.hoisted(() => ({
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditService();
  });

  // ─── log ──────────────────────────────────────────────────────────────────

  describe('log', () => {
    it('should create audit log with correct data', async () => {
      prismaMock.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await service.log({
        action: 'CREATE',
        entity: 'USER',
        entityId: 'user-1',
        actorId: 'admin-1',
        tenantId: 'tenant-1',
        metadata: { role: 'ADMIN' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'CREATE',
            entity: 'USER',
            entityId: 'user-1',
            userId: 'admin-1',
            tenantId: 'tenant-1',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
            retentionUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('should calculate retentionUntil based on AUDIT_RETENTION_DAYS', async () => {
      prismaMock.auditLog.create.mockResolvedValue({ id: 'log-1' });

      const before = new Date();
      await service.log({
        action: 'TEST',
        entity: 'USER',
        entityId: '1',
      });

      const callArgs = prismaMock.auditLog.create.mock.calls[0][0];
      const retention = callArgs.data.retentionUntil;
      // Default is 90 days
      const daysDiff = Math.round((retention.getTime() - before.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(89);
      expect(daysDiff).toBeLessThanOrEqual(91);
    });

    it('should default metadata to empty object when not provided', async () => {
      prismaMock.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await service.log({
        action: 'DELETE',
        entity: 'ORDER',
        entityId: 'ord-1',
      });

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: {} }),
        }),
      );
    });

    it('should silently catch database errors', async () => {
      prismaMock.auditLog.create.mockRejectedValue(new Error('DB connection failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        service.log({
          action: 'TEST',
          entity: 'USER',
          entityId: '1',
        }),
      ).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should map actorId to userId in schema', async () => {
      prismaMock.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await service.log({
        action: 'UPDATE',
        entity: 'POLICY',
        entityId: 'pol-1',
        actorId: 'user-abc',
      });

      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-abc' }),
        }),
      );
    });
  });

  // ─── listLogs ─────────────────────────────────────────────────────────────

  describe('listLogs', () => {
    it('should return paginated logs', async () => {
      const mockLogs = [{ id: 'log-1' }, { id: 'log-2' }];
      prismaMock.auditLog.findMany.mockResolvedValue(mockLogs);
      prismaMock.auditLog.count.mockResolvedValue(2);

      const result = await service.listLogs({ tenantId: 'tenant-1' });

      expect(result.logs).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should filter by tenantId', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await service.listLogs({ tenantId: 'tenant-A' });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-A' }),
        }),
      );
    });

    it('should filter by action', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await service.listLogs({ action: 'DELETE' });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'DELETE' }),
        }),
      );
    });

    it('should exclude soft-deleted logs by default', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await service.listLogs({});

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it('should include soft-deleted logs when includeDeleted is true', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await service.listLogs({ includeDeleted: true });

      const callArgs = prismaMock.auditLog.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('deletedAt');
    });

    it('should apply pagination correctly', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(100);

      const result = await service.listLogs({ page: 3, limit: 10 });

      expect(result.pagination.pages).toBe(10);
      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should filter by entity and entityId', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      prismaMock.auditLog.count.mockResolvedValue(0);

      await service.listLogs({ entity: 'USER', entityId: 'user-1' });

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entity: 'USER', entityId: 'user-1' }),
        }),
      );
    });
  });

  // ─── softDeleteLog ──────────────────────────────────────────────────────────

  describe('softDeleteLog', () => {
    it('should soft-delete log when retention has expired', async () => {
      const pastRetention = new Date(Date.now() - 1000);
      prismaMock.auditLog.findUnique.mockResolvedValue({
        id: 'log-1',
        retentionUntil: pastRetention,
        deletedAt: null,
      });
      prismaMock.auditLog.update.mockResolvedValue({
        id: 'log-1',
        deletedAt: expect.any(Date),
      });

      await service.softDeleteLog('log-1');

      expect(prismaMock.auditLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'log-1' },
          data: { deletedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw error when log not found', async () => {
      prismaMock.auditLog.findUnique.mockResolvedValue(null);

      await expect(service.softDeleteLog('log-xxx')).rejects.toThrow(
        'Audit log não encontrado',
      );
    });

    it('should be idempotent - return log when already deleted', async () => {
      const deletedLog = { id: 'log-1', deletedAt: new Date() };
      prismaMock.auditLog.findUnique.mockResolvedValue(deletedLog);

      const result = await service.softDeleteLog('log-1');

      expect(result).toEqual(deletedLog);
      expect(prismaMock.auditLog.update).not.toHaveBeenCalled();
    });

    it('should throw error when retention period has not expired (LGPD compliance)', async () => {
      const futureRetention = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      prismaMock.auditLog.findUnique.mockResolvedValue({
        id: 'log-1',
        retentionUntil: futureRetention,
        deletedAt: null,
      });

      await expect(service.softDeleteLog('log-1')).rejects.toThrow(
        'Log retido por compliance',
      );
    });
  });

  // ─── purgeExpiredLogs ─────────────────────────────────────────────────────

  describe('purgeExpiredLogs', () => {
    it('should purge expired and deleted logs', async () => {
      prismaMock.auditLog.deleteMany.mockResolvedValue({ count: 5 });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await service.purgeExpiredLogs();

      expect(result.purged).toBe(5);
      expect(prismaMock.auditLog.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: { not: null },
            retentionUntil: { lt: expect.any(Date) },
          }),
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should return 0 when no logs to purge', async () => {
      prismaMock.auditLog.deleteMany.mockResolvedValue({ count: 0 });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await service.purgeExpiredLogs();

      expect(result.purged).toBe(0);
      consoleSpy.mockRestore();
    });
  });
});
