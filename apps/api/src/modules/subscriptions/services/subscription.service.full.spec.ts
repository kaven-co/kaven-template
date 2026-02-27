import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionService } from './subscription.service';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  feature: {
    findUnique: vi.fn(),
  },
  usageRecord: {
    findFirst: vi.fn(),
    create: vi.fn(),
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
    priceId: 'price-1',
    status: 'ACTIVE',
    currentPeriodStart: new Date('2026-01-01'),
    currentPeriodEnd: new Date('2026-02-01'),
    cancelAtPeriodEnd: false,
    canceledAt: null,
    cancelReason: null,
    trialEnd: null,
    plan: {
      id: 'plan-1',
      code: 'starter',
      name: 'Starter',
      description: 'Starter plan',
      type: 'SUBSCRIPTION',
      trialDays: 14,
      features: [],
    },
    price: {
      id: 'price-1',
      interval: 'MONTH',
      intervalCount: 1,
      amount: '2900',
      currency: 'BRL',
    },
    ...overrides,
  };
}

function makePlan(overrides: Record<string, any> = {}) {
  return {
    id: 'plan-pro',
    code: 'pro',
    name: 'Pro',
    isActive: true,
    prices: [
      {
        id: 'price-pro',
        interval: 'MONTH',
        intervalCount: 1,
        amount: '5900',
        currency: 'BRL',
        isActive: true,
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SubscriptionService (full)', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SubscriptionService();
  });

  // -------------------------------------------------------------------------
  // getCurrentSubscription
  // -------------------------------------------------------------------------
  describe('getCurrentSubscription', () => {
    it('should return formatted subscription when found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());

      const result = await service.getCurrentSubscription('tenant-1');

      expect(prismaMock.subscription.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        })
      );
      expect(result.id).toBe('sub-1');
      expect(result.tenantId).toBe('tenant-1');
      expect(result.status).toBe('ACTIVE');
      expect(result.plan).toBeDefined();
      expect(result.plan!.code).toBe('starter');
    });

    it('should format price amount as number', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());

      const result = await service.getCurrentSubscription('tenant-1');

      expect(result.price!.amount).toBe(2900);
    });

    it('should throw when subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.getCurrentSubscription('nonexistent')
      ).rejects.toThrow('Subscription não encontrada');
    });

    it('should include plan features in response', async () => {
      const sub = makeSubscription({
        plan: {
          id: 'plan-1',
          code: 'starter',
          name: 'Starter',
          description: null,
          type: 'SUBSCRIPTION',
          trialDays: 14,
          features: [
            {
              enabled: true,
              limitValue: 10,
              customValue: null,
              feature: {
                code: 'max_users',
                name: 'Max Users',
                type: 'QUOTA',
                unit: 'users',
              },
            },
          ],
        },
      });
      prismaMock.subscription.findUnique.mockResolvedValue(sub);

      const result = await service.getCurrentSubscription('tenant-1');

      expect(result.plan!.features).toHaveLength(1);
      expect(result.plan!.features[0].code).toBe('max_users');
      expect(result.plan!.features[0].enabled).toBe(true);
      expect(result.plan!.features[0].limitValue).toBe(10);
    });

    it('should handle subscription with no price', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ price: null })
      );

      const result = await service.getCurrentSubscription('tenant-1');

      expect(result.price).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // upgradePlan
  // -------------------------------------------------------------------------
  describe('upgradePlan', () => {
    it('should throw when current subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.upgradePlan('tenant-1', { planId: 'plan-pro', prorated: true })
      ).rejects.toThrow('Subscription não encontrada');
    });

    it('should throw when new plan not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(null);

      await expect(
        service.upgradePlan('tenant-1', { planId: 'nonexistent', prorated: true })
      ).rejects.toThrow('Plano não encontrado ou inativo');
    });

    it('should throw when new plan is inactive', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(makePlan({ isActive: false }));

      await expect(
        service.upgradePlan('tenant-1', { planId: 'plan-pro', prorated: true })
      ).rejects.toThrow('Plano não encontrado ou inativo');
    });

    it('should throw when specified priceId not found in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(makePlan());

      await expect(
        service.upgradePlan('tenant-1', {
          planId: 'plan-pro',
          priceId: 'nonexistent-price',
          prorated: true,
        })
      ).rejects.toThrow('Price não encontrado para este plano');
    });

    it('should throw when plan has no active prices', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(
        makePlan({ prices: [{ id: 'p1', isActive: false, amount: '5900' }] })
      );

      await expect(
        service.upgradePlan('tenant-1', { planId: 'plan-pro', prorated: true })
      ).rejects.toThrow('Plano não possui prices ativos');
    });

    it('should upgrade plan using first active price when priceId not specified', async () => {
      const updatedSub = makeSubscription({
        planId: 'plan-pro',
        priceId: 'price-pro',
        plan: {
          id: 'plan-pro',
          code: 'pro',
          name: 'Pro',
          type: 'SUBSCRIPTION',
          description: null,
          trialDays: 0,
          features: [],
        },
        price: { id: 'price-pro', interval: 'MONTH', intervalCount: 1, amount: '5900', currency: 'BRL' },
      });

      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(makePlan());
      prismaMock.subscription.update.mockResolvedValue(updatedSub);

      const result = await service.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        prorated: false,
      });

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          data: expect.objectContaining({
            planId: 'plan-pro',
            priceId: 'price-pro',
          }),
        })
      );
      expect(result.subscription.plan!.code).toBe('pro');
    });

    it('should upgrade with specific priceId when provided', async () => {
      const updatedSub = makeSubscription({
        planId: 'plan-pro',
        priceId: 'price-pro',
        plan: { id: 'plan-pro', code: 'pro', name: 'Pro', type: 'SUBSCRIPTION', description: null, trialDays: 0, features: [] },
        price: { id: 'price-pro', interval: 'MONTH', intervalCount: 1, amount: '5900', currency: 'BRL' },
      });

      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(makePlan());
      prismaMock.subscription.update.mockResolvedValue(updatedSub);

      const result = await service.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        priceId: 'price-pro',
        prorated: false,
      });

      expect(result.subscription.price!.id).toBe('price-pro');
    });

    it('should calculate proration when prorated is true', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // 15 days remaining

      const currentSub = makeSubscription({
        currentPeriodEnd: futureDate,
        price: { id: 'price-1', interval: 'MONTH', intervalCount: 1, amount: '3000', currency: 'BRL' },
      });

      const updatedSub = makeSubscription({
        planId: 'plan-pro',
        priceId: 'price-pro',
        plan: { id: 'plan-pro', code: 'pro', name: 'Pro', type: 'SUBSCRIPTION', description: null, trialDays: 0, features: [] },
        price: { id: 'price-pro', interval: 'MONTH', intervalCount: 1, amount: '6000', currency: 'BRL' },
      });

      prismaMock.subscription.findUnique.mockResolvedValue(currentSub);
      prismaMock.plan.findUnique.mockResolvedValue(
        makePlan({ prices: [{ id: 'price-pro', interval: 'MONTH', amount: '6000', isActive: true }] })
      );
      prismaMock.subscription.update.mockResolvedValue(updatedSub);

      const result = await service.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        prorated: true,
      });

      // proratedAmount should be positive since upgrading to higher price
      expect(result.proratedAmount).toBeGreaterThan(0);
    });

    it('should return zero proration when prorated is false', async () => {
      const updatedSub = makeSubscription({
        planId: 'plan-pro',
        priceId: 'price-pro',
        plan: { id: 'plan-pro', code: 'pro', name: 'Pro', type: 'SUBSCRIPTION', description: null, trialDays: 0, features: [] },
        price: { id: 'price-pro', interval: 'MONTH', intervalCount: 1, amount: '5900', currency: 'BRL' },
      });

      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.plan.findUnique.mockResolvedValue(makePlan());
      prismaMock.subscription.update.mockResolvedValue(updatedSub);

      const result = await service.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        prorated: false,
      });

      expect(result.proratedAmount).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // cancelSubscription
  // -------------------------------------------------------------------------
  describe('cancelSubscription', () => {
    it('should throw when subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelSubscription('tenant-1', { immediately: false })
      ).rejects.toThrow('Subscription não encontrada');
    });

    it('should throw when subscription already canceled', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'CANCELED' })
      );

      await expect(
        service.cancelSubscription('tenant-1', { immediately: false })
      ).rejects.toThrow('Subscription já está cancelada');
    });

    it('should cancel immediately when immediately=true', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.subscription.update.mockResolvedValue(
        makeSubscription({ status: 'CANCELED', canceledAt: new Date(), cancelReason: 'Too expensive' })
      );

      const result = await service.cancelSubscription('tenant-1', {
        immediately: true,
        reason: 'Too expensive',
      });

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          data: expect.objectContaining({
            status: 'CANCELED',
            cancelReason: 'Too expensive',
          }),
        })
      );
      expect(result.status).toBe('CANCELED');
    });

    it('should cancel at period end when immediately=false', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.subscription.update.mockResolvedValue(
        makeSubscription({ cancelAtPeriodEnd: true, canceledAt: new Date() })
      );

      await service.cancelSubscription('tenant-1', {
        immediately: false,
        reason: 'Switching providers',
      });

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cancelAtPeriodEnd: true,
            cancelReason: 'Switching providers',
          }),
        })
      );
      // status should NOT be in update data when not immediate
      const callData = prismaMock.subscription.update.mock.calls[0][0].data;
      expect(callData.status).toBeUndefined();
    });

    it('should set canceledAt timestamp on cancel', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeSubscription());
      prismaMock.subscription.update.mockResolvedValue(
        makeSubscription({ canceledAt: new Date() })
      );

      await service.cancelSubscription('tenant-1', { immediately: false });

      const callData = prismaMock.subscription.update.mock.calls[0][0].data;
      expect(callData.canceledAt).toBeInstanceOf(Date);
    });
  });

  // -------------------------------------------------------------------------
  // hasFeature
  // -------------------------------------------------------------------------
  describe('hasFeature', () => {
    it('should return true for enabled BOOLEAN feature', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: true,
                feature: { code: 'analytics', type: 'BOOLEAN' },
              },
            ],
          },
        })
      );

      const result = await service.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(true);
    });

    it('should return false for disabled BOOLEAN feature', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: false,
                feature: { code: 'analytics', type: 'BOOLEAN' },
              },
            ],
          },
        })
      );

      const result = await service.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return false when subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      const result = await service.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return false when subscription is not ACTIVE', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          status: 'CANCELED',
          plan: {
            features: [
              { enabled: true, feature: { code: 'analytics', type: 'BOOLEAN' } },
            ],
          },
        })
      );

      const result = await service.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return false when feature not in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: { features: [] },
        })
      );

      const result = await service.hasFeature('tenant-1', 'nonexistent');
      expect(result).toBe(false);
    });

    it('should return true for QUOTA feature (just checks existence)', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: true,
                limitValue: 10,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );

      const result = await service.hasFeature('tenant-1', 'max_users');
      expect(result).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // getQuotaLimit
  // -------------------------------------------------------------------------
  describe('getQuotaLimit', () => {
    it('should return limit value for QUOTA feature', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                limitValue: 50,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );

      const limit = await service.getQuotaLimit('tenant-1', 'max_users');
      expect(limit).toBe(50);
    });

    it('should return 0 when subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      const limit = await service.getQuotaLimit('tenant-1', 'max_users');
      expect(limit).toBe(0);
    });

    it('should return 0 when subscription is not active', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'CANCELED', plan: { features: [] } })
      );

      const limit = await service.getQuotaLimit('tenant-1', 'max_users');
      expect(limit).toBe(0);
    });

    it('should return 0 when feature is not QUOTA type', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                limitValue: null,
                feature: { code: 'analytics', type: 'BOOLEAN' },
              },
            ],
          },
        })
      );

      const limit = await service.getQuotaLimit('tenant-1', 'analytics');
      expect(limit).toBe(0);
    });

    it('should return 0 when limitValue is null', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                limitValue: null,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );

      const limit = await service.getQuotaLimit('tenant-1', 'max_users');
      expect(limit).toBe(0);
    });

    it('should return 0 when feature not found in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: { features: [] },
        })
      );

      const limit = await service.getQuotaLimit('tenant-1', 'max_users');
      expect(limit).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // getQuotaUsage
  // -------------------------------------------------------------------------
  describe('getQuotaUsage', () => {
    it('should return current usage from latest record', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 7 });

      const usage = await service.getQuotaUsage('tenant-1', 'max_users');
      expect(usage).toBe(7);
    });

    it('should return 0 when feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      const usage = await service.getQuotaUsage('tenant-1', 'nonexistent');
      expect(usage).toBe(0);
    });

    it('should return 0 when no usage record exists', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users' });
      prismaMock.usageRecord.findFirst.mockResolvedValue(null);

      const usage = await service.getQuotaUsage('tenant-1', 'max_users');
      expect(usage).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // canUseFeature
  // -------------------------------------------------------------------------
  describe('canUseFeature', () => {
    it('should return false when no subscription access', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      const result = await service.canUseFeature('tenant-1', 'max_users');
      expect(result).toBe(false);
    });

    it('should return true for BOOLEAN feature that is enabled', async () => {
      // hasFeature call
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              { enabled: true, feature: { code: 'analytics', type: 'BOOLEAN' } },
            ],
          },
        })
      );
      // canUseFeature calls feature.findUnique for type check
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'f1', code: 'analytics', type: 'BOOLEAN' });

      const result = await service.canUseFeature('tenant-1', 'analytics');
      expect(result).toBe(true);
    });

    it('should return true when QUOTA usage is under limit', async () => {
      // hasFeature needs ACTIVE subscription with the feature
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: true,
                limitValue: 10,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users', type: 'QUOTA' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 5 });

      const result = await service.canUseFeature('tenant-1', 'max_users');
      expect(result).toBe(true);
    });

    it('should return false when QUOTA usage equals limit', async () => {
      // hasFeature
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: true,
                limitValue: 10,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users', type: 'QUOTA' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 10 });

      const result = await service.canUseFeature('tenant-1', 'max_users');
      expect(result).toBe(false);
    });

    it('should return true when QUOTA limit is -1 (unlimited)', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          plan: {
            features: [
              {
                enabled: true,
                limitValue: -1,
                feature: { code: 'max_users', type: 'QUOTA' },
              },
            ],
          },
        })
      );
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: 'max_users', type: 'QUOTA' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 999 });

      const result = await service.canUseFeature('tenant-1', 'max_users');
      expect(result).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // recordUsage
  // -------------------------------------------------------------------------
  describe('recordUsage', () => {
    it('should throw when feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        service.recordUsage('tenant-1', 'nonexistent', 1)
      ).rejects.toThrow('Feature não encontrada ou não é do tipo QUOTA');
    });

    it('should throw when feature is not QUOTA type', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({
        id: 'f1',
        code: 'analytics',
        type: 'BOOLEAN',
      });

      await expect(
        service.recordUsage('tenant-1', 'analytics', 1)
      ).rejects.toThrow('Feature não encontrada ou não é do tipo QUOTA');
    });

    it('should create usage record with incremented value', async () => {
      // recordUsage calls getQuotaUsage internally which calls feature.findUnique + usageRecord.findFirst
      prismaMock.feature.findUnique.mockResolvedValue({
        id: 'feat-1',
        code: 'max_users',
        type: 'QUOTA',
      });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 5 });
      prismaMock.usageRecord.create.mockResolvedValue({});

      const result = await service.recordUsage('tenant-1', 'max_users', 3);

      expect(prismaMock.usageRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            featureId: 'feat-1',
            currentUsage: 8, // 5 + 3
          }),
        })
      );
      expect(result.currentUsage).toBe(8);
    });

    it('should default amount to 1', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({
        id: 'feat-1',
        code: 'max_users',
        type: 'QUOTA',
      });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 3 });
      prismaMock.usageRecord.create.mockResolvedValue({});

      const result = await service.recordUsage('tenant-1', 'max_users');

      expect(result.currentUsage).toBe(4); // 3 + 1
    });

    it('should start from 0 when no prior usage exists', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({
        id: 'feat-1',
        code: 'max_users',
        type: 'QUOTA',
      });
      prismaMock.usageRecord.findFirst.mockResolvedValue(null); // no prior usage

      // getQuotaUsage internally calls feature.findUnique again
      // The second call to feature.findUnique from getQuotaUsage
      prismaMock.usageRecord.create.mockResolvedValue({});

      const result = await service.recordUsage('tenant-1', 'max_users', 1);

      expect(result.currentUsage).toBe(1);
    });
  });
});
