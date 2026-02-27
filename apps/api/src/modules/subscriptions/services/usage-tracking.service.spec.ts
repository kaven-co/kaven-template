import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageTrackingService } from './usage-tracking.service';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  usageRecord: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  feature: {
    findUnique: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UsageTrackingService', () => {
  let service: UsageTrackingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UsageTrackingService();
  });

  // -------------------------------------------------------------------------
  // incrementUsage
  // -------------------------------------------------------------------------
  describe('incrementUsage', () => {
    it('should upsert usage record with increment', async () => {
      prismaMock.usageRecord.upsert.mockResolvedValue({});

      await service.incrementUsage('tenant-1', 'feat-1', 5);

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId_featureId_periodStart: expect.objectContaining({
              tenantId: 'tenant-1',
              featureId: 'feat-1',
            }),
          }),
          update: expect.objectContaining({
            currentUsage: { increment: 5 },
          }),
          create: expect.objectContaining({
            tenantId: 'tenant-1',
            featureId: 'feat-1',
            currentUsage: 5,
          }),
        })
      );
    });

    it('should default amount to 1', async () => {
      prismaMock.usageRecord.upsert.mockResolvedValue({});

      await service.incrementUsage('tenant-1', 'feat-1');

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            currentUsage: { increment: 1 },
          }),
          create: expect.objectContaining({
            currentUsage: 1,
          }),
        })
      );
    });

    it('should set period start to start of current day', async () => {
      prismaMock.usageRecord.upsert.mockResolvedValue({});

      await service.incrementUsage('tenant-1', 'feat-1', 1);

      const call = prismaMock.usageRecord.upsert.mock.calls[0][0];
      const periodStart = call.where.tenantId_featureId_periodStart.periodStart;
      expect(periodStart.getHours()).toBe(0);
      expect(periodStart.getMinutes()).toBe(0);
      expect(periodStart.getSeconds()).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // incrementUsageByCode
  // -------------------------------------------------------------------------
  describe('incrementUsageByCode', () => {
    it('should lookup feature by code then increment', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users' });
      prismaMock.usageRecord.upsert.mockResolvedValue({});

      await service.incrementUsageByCode('tenant-1', 'max_users', 3);

      expect(prismaMock.feature.findUnique).toHaveBeenCalledWith({
        where: { code: 'max_users' },
      });
      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId_featureId_periodStart: expect.objectContaining({
              featureId: 'feat-1',
            }),
          }),
        })
      );
    });

    it('should throw when feature code not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        service.incrementUsageByCode('tenant-1', 'nonexistent', 1)
      ).rejects.toThrow('não encontrada');
    });

    it('should default amount to 1 for code-based increment', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users' });
      prismaMock.usageRecord.upsert.mockResolvedValue({});

      await service.incrementUsageByCode('tenant-1', 'max_users');

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ currentUsage: 1 }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // getCurrentUsage
  // -------------------------------------------------------------------------
  describe('getCurrentUsage', () => {
    it('should return current usage for the period', async () => {
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 42 });

      const result = await service.getCurrentUsage('tenant-1', 'feat-1');

      expect(result).toBe(42);
      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId_featureId_periodStart: expect.objectContaining({
              tenantId: 'tenant-1',
              featureId: 'feat-1',
            }),
          }),
        })
      );
    });

    it('should return 0 when no usage record found', async () => {
      prismaMock.usageRecord.findUnique.mockResolvedValue(null);

      const result = await service.getCurrentUsage('tenant-1', 'feat-1');

      expect(result).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // getCurrentUsageByCode
  // -------------------------------------------------------------------------
  describe('getCurrentUsageByCode', () => {
    it('should lookup feature by code then get usage', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users' });
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 7 });

      const result = await service.getCurrentUsageByCode('tenant-1', 'max_users');

      expect(result).toBe(7);
    });

    it('should return 0 when feature code not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      const result = await service.getCurrentUsageByCode('tenant-1', 'nonexistent');

      expect(result).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // resetMonthlyUsage
  // -------------------------------------------------------------------------
  describe('resetMonthlyUsage', () => {
    it('should reset expired usage records', async () => {
      prismaMock.usageRecord.updateMany.mockResolvedValue({ count: 5 });

      await service.resetMonthlyUsage();

      expect(prismaMock.usageRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            periodEnd: { lte: expect.any(Date) },
          }),
          data: expect.objectContaining({
            currentUsage: 0,
            periodStart: expect.any(Date),
            periodEnd: expect.any(Date),
            lastReset: expect.any(Date),
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // getUsageStats
  // -------------------------------------------------------------------------
  describe('getUsageStats', () => {
    it('should return formatted usage stats', async () => {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      prismaMock.usageRecord.findMany.mockResolvedValue([
        {
          tenantId: 'tenant-1',
          featureId: 'feat-1',
          currentUsage: 15,
          periodStart: now,
          periodEnd,
          feature: { code: 'max_users' },
          tenant: {
            subscriptions: [
              {
                plan: {
                  features: [
                    {
                      limitValue: 50,
                      feature: { id: 'feat-1' },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getUsageStats('tenant-1');

      expect(prismaMock.usageRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].featureCode).toBe('max_users');
      expect(result[0].currentUsage).toBe(15);
      expect(result[0].limit).toBe(50);
    });

    it('should return -1 limit when no subscription', async () => {
      prismaMock.usageRecord.findMany.mockResolvedValue([
        {
          tenantId: 'tenant-1',
          featureId: 'feat-1',
          currentUsage: 5,
          periodStart: new Date(),
          periodEnd: new Date(),
          feature: { code: 'max_users' },
          tenant: {
            subscriptions: [],
          },
        },
      ]);

      const result = await service.getUsageStats('tenant-1');

      expect(result[0].limit).toBe(-1);
    });

    it('should return -1 limit when feature not in plan', async () => {
      prismaMock.usageRecord.findMany.mockResolvedValue([
        {
          tenantId: 'tenant-1',
          featureId: 'feat-1',
          currentUsage: 5,
          periodStart: new Date(),
          periodEnd: new Date(),
          feature: { code: 'max_users' },
          tenant: {
            subscriptions: [
              {
                plan: {
                  features: [
                    {
                      limitValue: 20,
                      feature: { id: 'feat-OTHER' }, // different feature
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getUsageStats('tenant-1');

      expect(result[0].limit).toBe(-1);
    });

    it('should return empty array when no usage records', async () => {
      prismaMock.usageRecord.findMany.mockResolvedValue([]);

      const result = await service.getUsageStats('tenant-1');

      expect(result).toEqual([]);
    });
  });
});
