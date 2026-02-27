import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsageService, clearUsageCache } from './usage.service';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  feature: {
    findUnique: vi.fn(),
  },
  usageRecord: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    findFirst: vi.fn(),
  },
  plan: {
    findFirst: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TENANT_ID = 'tenant-1';
const FEATURE_CODE = 'max_users';
const FEATURE_ID = 'feat-uuid-1';

function mockFeature(code = FEATURE_CODE, id = FEATURE_ID) {
  prismaMock.feature.findUnique.mockResolvedValue({ id, code, type: 'QUOTA' });
}

function mockSubscriptionWithLimit(limitValue: number | null) {
  prismaMock.subscription.findFirst.mockResolvedValue({
    plan: {
      features: [{ limitValue, feature: { code: FEATURE_CODE } }],
    },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UsageService', () => {
  let service: UsageService;

  beforeEach(() => {
    vi.clearAllMocks();
    clearUsageCache();
    service = new UsageService();
  });

  // -------------------------------------------------------------------------
  // incrementUsage
  // -------------------------------------------------------------------------
  describe('incrementUsage', () => {
    it('should upsert usage record with increment and return result', async () => {
      mockFeature();
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 5 });
      mockSubscriptionWithLimit(100);

      const result = await service.incrementUsage(TENANT_ID, FEATURE_CODE, 5);

      expect(prismaMock.feature.findUnique).toHaveBeenCalledWith({
        where: { code: FEATURE_CODE },
      });
      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId_featureId_periodStart: expect.objectContaining({
              tenantId: TENANT_ID,
              featureId: FEATURE_ID,
            }),
          }),
          update: expect.objectContaining({
            currentUsage: { increment: 5 },
          }),
          create: expect.objectContaining({
            tenantId: TENANT_ID,
            featureId: FEATURE_ID,
            currentUsage: 5,
          }),
        }),
      );
      expect(result).toEqual({
        resource: FEATURE_CODE,
        used: 5,
        limit: 100,
        percentage: 5,
      });
    });

    it('should default amount to 1', async () => {
      mockFeature();
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 1 });
      mockSubscriptionWithLimit(10);

      const result = await service.incrementUsage(TENANT_ID, FEATURE_CODE);

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            currentUsage: { increment: 1 },
          }),
          create: expect.objectContaining({
            currentUsage: 1,
          }),
        }),
      );
      expect(result.used).toBe(1);
    });

    it('should throw when feature code not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        service.incrementUsage(TENANT_ID, 'nonexistent'),
      ).rejects.toThrow('not found');
    });
  });

  // -------------------------------------------------------------------------
  // decrementUsage
  // -------------------------------------------------------------------------
  describe('decrementUsage', () => {
    it('should upsert usage record with decrement', async () => {
      mockFeature();
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 3 });
      mockSubscriptionWithLimit(100);

      const result = await service.decrementUsage(TENANT_ID, FEATURE_CODE, 2);

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            currentUsage: { decrement: 2 },
          }),
        }),
      );
      expect(result.used).toBe(3);
    });

    it('should clamp negative values to 0', async () => {
      mockFeature();
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: -2 });
      prismaMock.usageRecord.update.mockResolvedValue({ currentUsage: 0 });
      mockSubscriptionWithLimit(100);

      const result = await service.decrementUsage(TENANT_ID, FEATURE_CODE, 10);

      expect(prismaMock.usageRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentUsage: 0 },
        }),
      );
      expect(result.used).toBe(0);
    });

    it('should default amount to 1', async () => {
      mockFeature();
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 4 });
      mockSubscriptionWithLimit(10);

      await service.decrementUsage(TENANT_ID, FEATURE_CODE);

      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            currentUsage: { decrement: 1 },
          }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // getCurrentUsage
  // -------------------------------------------------------------------------
  describe('getCurrentUsage', () => {
    it('should return current usage from database', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 42 });
      mockSubscriptionWithLimit(100);

      const result = await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(result).toEqual({
        resource: FEATURE_CODE,
        used: 42,
        limit: 100,
        percentage: 42,
      });
    });

    it('should return 0 when no usage record found', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue(null);
      mockSubscriptionWithLimit(50);

      const result = await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(result.used).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should throw when feature code not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        service.getCurrentUsage(TENANT_ID, 'nonexistent'),
      ).rejects.toThrow('not found');
    });
  });

  // -------------------------------------------------------------------------
  // Unlimited plan handling (limit = -1)
  // -------------------------------------------------------------------------
  describe('unlimited plan handling', () => {
    it('should return percentage 0 when limit is -1 (unlimited)', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 999 });
      mockSubscriptionWithLimit(null); // null limitValue => -1

      const result = await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(result.limit).toBe(-1);
      expect(result.percentage).toBe(0);
      expect(result.used).toBe(999);
    });

    it('should return -1 limit when no subscription found', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 10 });
      prismaMock.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(result.limit).toBe(-1);
    });
  });

  // -------------------------------------------------------------------------
  // getUsageSummary
  // -------------------------------------------------------------------------
  describe('getUsageSummary', () => {
    it('should return usage summary for all quota features', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({
        plan: {
          features: [
            {
              enabled: true,
              limitValue: 100,
              feature: { id: 'feat-1', code: 'max_users', type: 'QUOTA' },
            },
            {
              enabled: true,
              limitValue: 500,
              feature: { id: 'feat-2', code: 'max_storage', type: 'QUOTA' },
            },
          ],
        },
      });
      prismaMock.plan.findFirst.mockResolvedValue(null);
      prismaMock.usageRecord.findMany.mockResolvedValue([
        { featureId: 'feat-1', currentUsage: 25 },
        { featureId: 'feat-2', currentUsage: 200 },
      ]);

      const result = await service.getUsageSummary(TENANT_ID);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        resource: 'max_users',
        used: 25,
        limit: 100,
        percentage: 25,
      });
      expect(result[1]).toEqual({
        resource: 'max_storage',
        used: 200,
        limit: 500,
        percentage: 40,
      });
    });

    it('should return empty array when no plan found', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null);
      prismaMock.plan.findFirst.mockResolvedValue(null);

      const result = await service.getUsageSummary(TENANT_ID);

      expect(result).toEqual([]);
    });

    it('should use default plan when no subscription', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null);
      prismaMock.plan.findFirst.mockResolvedValue({
        features: [
          {
            enabled: true,
            limitValue: 5,
            feature: { id: 'feat-1', code: 'max_users', type: 'QUOTA' },
          },
        ],
      });
      prismaMock.usageRecord.findMany.mockResolvedValue([]);

      const result = await service.getUsageSummary(TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0].used).toBe(0);
      expect(result[0].limit).toBe(5);
    });
  });

  // -------------------------------------------------------------------------
  // resetPeriod
  // -------------------------------------------------------------------------
  describe('resetPeriod', () => {
    it('should reset usage to 0 for the given feature', async () => {
      mockFeature();
      prismaMock.usageRecord.updateMany.mockResolvedValue({ count: 1 });
      mockSubscriptionWithLimit(100);

      const result = await service.resetPeriod(TENANT_ID, FEATURE_CODE);

      expect(prismaMock.usageRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: TENANT_ID,
            featureId: FEATURE_ID,
          }),
          data: expect.objectContaining({
            currentUsage: 0,
            lastReset: expect.any(Date),
          }),
        }),
      );
      expect(result.used).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Tenant isolation
  // -------------------------------------------------------------------------
  describe('tenant isolation', () => {
    it('should always pass tenantId in queries', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 10 });
      mockSubscriptionWithLimit(50);

      await service.getCurrentUsage('tenant-A', FEATURE_CODE);

      const call = prismaMock.usageRecord.findUnique.mock.calls[0][0];
      expect(call.where.tenantId_featureId_periodStart.tenantId).toBe('tenant-A');
    });

    it('should not leak data between tenants', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique
        .mockResolvedValueOnce({ currentUsage: 10 })
        .mockResolvedValueOnce({ currentUsage: 99 });
      mockSubscriptionWithLimit(100);

      const resultA = await service.getCurrentUsage('tenant-A', FEATURE_CODE);
      clearUsageCache(); // Clear cache so next call hits DB
      const resultB = await service.getCurrentUsage('tenant-B', FEATURE_CODE);

      expect(resultA.used).toBe(10);
      expect(resultB.used).toBe(99);

      // Verify different tenantIds were passed
      const calls = prismaMock.usageRecord.findUnique.mock.calls;
      expect(calls[0][0].where.tenantId_featureId_periodStart.tenantId).toBe('tenant-A');
      expect(calls[1][0].where.tenantId_featureId_periodStart.tenantId).toBe('tenant-B');
    });
  });

  // -------------------------------------------------------------------------
  // Cache behavior
  // -------------------------------------------------------------------------
  describe('cache behavior', () => {
    it('should use cached value on second call', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 42 });
      mockSubscriptionWithLimit(100);

      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);
      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      // DB should only be called once for the usage record (cache hit on second)
      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache after increment', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 10 });
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 11 });
      mockSubscriptionWithLimit(100);

      // First call — populates cache
      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);
      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledTimes(1);

      // Increment — invalidates cache
      await service.incrementUsage(TENANT_ID, FEATURE_CODE);

      // Third call — should hit DB again
      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);
      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache after decrement', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 10 });
      prismaMock.usageRecord.upsert.mockResolvedValue({ currentUsage: 9 });
      mockSubscriptionWithLimit(100);

      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);
      await service.decrementUsage(TENANT_ID, FEATURE_CODE);
      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache after resetPeriod', async () => {
      mockFeature();
      prismaMock.usageRecord.findUnique.mockResolvedValue({ currentUsage: 10 });
      prismaMock.usageRecord.updateMany.mockResolvedValue({ count: 1 });
      mockSubscriptionWithLimit(100);

      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);
      await service.resetPeriod(TENANT_ID, FEATURE_CODE);
      await service.getCurrentUsage(TENANT_ID, FEATURE_CODE);

      expect(prismaMock.usageRecord.findUnique).toHaveBeenCalledTimes(2);
    });
  });
});
