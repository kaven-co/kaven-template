import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntitlementService } from './entitlement.service';
import { UsageTrackingService } from './usage-tracking.service';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  subscription: {
    findFirst: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSubscription(overrides: Record<string, any> = {}) {
  return {
    id: 'sub-1',
    tenantId: 'tenant-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    plan: {
      id: 'plan-1',
      code: 'starter',
      name: 'Starter',
      features: [],
      ...overrides.plan,
    },
    ...overrides,
  };
}

function makePlanFeature(overrides: Record<string, any> = {}) {
  return {
    enabled: true,
    limitValue: null,
    customValue: null,
    feature: {
      code: 'analytics',
      name: 'Analytics',
      type: 'BOOLEAN',
      unit: null,
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EntitlementService', () => {
  let service: EntitlementService;
  let usageTrackingMock: {
    getCurrentUsage: ReturnType<typeof vi.fn>;
    incrementUsage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usageTrackingMock = {
      getCurrentUsage: vi.fn(),
      incrementUsage: vi.fn(),
    };
    service = new EntitlementService(usageTrackingMock as any as UsageTrackingService);
  });

  // -------------------------------------------------------------------------
  // validateAction — no subscription
  // -------------------------------------------------------------------------
  describe('validateAction — no subscription', () => {
    it('should return invalid when no active subscription found', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null);
      prismaMock.plan.findMany.mockResolvedValue([]);

      const result = await service.validateAction('tenant-1', 'analytics');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Nenhuma assinatura ativa');
      expect(result.currentPlan).toBe('FREE');
    });

    it('should suggest available upgrades when no subscription', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null);
      prismaMock.plan.findMany.mockResolvedValue([
        {
          id: 'plan-1',
          code: 'starter',
          name: 'Starter',
          prices: [{ amount: '2900' }],
        },
      ]);

      const result = await service.validateAction('tenant-1', 'analytics');

      expect(result.availableUpgrades).toHaveLength(1);
      expect(result.availableUpgrades![0].code).toBe('starter');
    });
  });

  // -------------------------------------------------------------------------
  // validateAction — feature not in plan
  // -------------------------------------------------------------------------
  describe('validateAction — feature not in plan', () => {
    it('should return invalid when feature not in plan', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: { id: 'plan-1', code: 'starter', name: 'Starter', features: [] },
        })
      );
      // getAvailableUpgrades will call plan.findUnique + plan.findMany
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        prices: [{ amount: '2900' }],
      });
      prismaMock.plan.findMany.mockResolvedValue([]);

      const result = await service.validateAction('tenant-1', 'premium_analytics');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('não disponível');
      expect(result.currentPlan).toBe('starter');
    });
  });

  // -------------------------------------------------------------------------
  // validateAction — BOOLEAN features
  // -------------------------------------------------------------------------
  describe('validateAction — BOOLEAN features', () => {
    it('should return valid for enabled BOOLEAN feature', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [makePlanFeature({ enabled: true })],
          },
        })
      );

      const result = await service.validateAction('tenant-1', 'analytics');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for disabled BOOLEAN feature', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [makePlanFeature({ enabled: false })],
          },
        })
      );

      const result = await service.validateAction('tenant-1', 'analytics');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('desabilitada');
    });
  });

  // -------------------------------------------------------------------------
  // validateAction — QUOTA features
  // -------------------------------------------------------------------------
  describe('validateAction — QUOTA features', () => {
    it('should return valid when usage is within limit', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [
              makePlanFeature({
                limitValue: 10,
                feature: { code: 'max_users', name: 'Max Users', type: 'QUOTA', unit: 'users' },
              }),
            ],
          },
        })
      );
      usageTrackingMock.getCurrentUsage.mockResolvedValue(5);

      const result = await service.validateAction('tenant-1', 'max_users', 1);

      expect(result.isValid).toBe(true);
    });

    it('should return invalid when usage exceeds limit', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          planId: 'plan-1',
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [
              makePlanFeature({
                limitValue: 10,
                feature: { code: 'max_users', name: 'Max Users', type: 'QUOTA', unit: 'users' },
              }),
            ],
          },
        })
      );
      usageTrackingMock.getCurrentUsage.mockResolvedValue(9);
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        prices: [{ amount: '2900' }],
      });
      prismaMock.plan.findMany.mockResolvedValue([]);

      const result = await service.validateAction('tenant-1', 'max_users', 2);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Limite');
      expect(result.currentUsage).toBe(9);
      expect(result.limit).toBe(10);
    });

    it('should allow unlimited usage when limit is -1', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: {
            id: 'plan-1',
            code: 'pro',
            name: 'Pro',
            features: [
              makePlanFeature({
                limitValue: -1,
                feature: { code: 'max_users', name: 'Max Users', type: 'QUOTA', unit: 'users' },
              }),
            ],
          },
        })
      );
      usageTrackingMock.getCurrentUsage.mockResolvedValue(9999);

      const result = await service.validateAction('tenant-1', 'max_users', 1);

      expect(result.isValid).toBe(true);
    });

    it('should return invalid when usage exactly meets limit with requested amount', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          planId: 'plan-1',
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [
              makePlanFeature({
                limitValue: 5,
                feature: { code: 'max_users', name: 'Max Users', type: 'QUOTA', unit: 'users' },
              }),
            ],
          },
        })
      );
      usageTrackingMock.getCurrentUsage.mockResolvedValue(4);
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        prices: [{ amount: '2900' }],
      });
      prismaMock.plan.findMany.mockResolvedValue([]);

      // 4 + 2 = 6 > 5 → invalid
      const result = await service.validateAction('tenant-1', 'max_users', 2);

      expect(result.isValid).toBe(false);
    });

    it('should use default requestedAmount of 1', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(
        makeSubscription({
          plan: {
            id: 'plan-1',
            code: 'starter',
            name: 'Starter',
            features: [
              makePlanFeature({
                limitValue: 10,
                feature: { code: 'max_users', name: 'Max Users', type: 'QUOTA', unit: 'users' },
              }),
            ],
          },
        })
      );
      usageTrackingMock.getCurrentUsage.mockResolvedValue(9);
      // 9 + 1 = 10, which is <= 10, but actually > 10 check is currentUsage + requestedAmount > limit
      // 9 + 1 = 10, 10 > 10 is false, so isValid = true

      const result = await service.validateAction('tenant-1', 'max_users');

      expect(result.isValid).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // getAvailableUpgrades
  // -------------------------------------------------------------------------
  describe('getAvailableUpgrades', () => {
    it('should return all public active plans when no current plan', async () => {
      prismaMock.plan.findMany.mockResolvedValue([
        { id: 'p1', code: 'starter', name: 'Starter', prices: [{ amount: '2900' }] },
        { id: 'p2', code: 'pro', name: 'Pro', prices: [{ amount: '5900' }] },
      ]);

      const result = await service.getAvailableUpgrades(null);

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            isPublic: true,
          }),
          take: 3,
        })
      );
      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(2900);
    });

    it('should return plans with higher price when current plan exists', async () => {
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-1',
        prices: [{ amount: '2900' }],
      });
      prismaMock.plan.findMany.mockResolvedValue([
        { id: 'p2', code: 'pro', name: 'Pro', prices: [{ amount: '5900' }], features: [] },
      ]);

      const result = await service.getAvailableUpgrades('plan-1');

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            prices: {
              some: { amount: { gt: 2900 } },
            },
          }),
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('pro');
    });

    it('should return empty array when current plan not found', async () => {
      prismaMock.plan.findUnique.mockResolvedValue(null);

      const result = await service.getAvailableUpgrades('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle plan with no prices in upgrade list', async () => {
      prismaMock.plan.findMany.mockResolvedValue([
        { id: 'p1', code: 'free', name: 'Free', prices: [] },
      ]);

      const result = await service.getAvailableUpgrades(null);

      expect(result[0].price).toBe(0);
    });
  });
});
