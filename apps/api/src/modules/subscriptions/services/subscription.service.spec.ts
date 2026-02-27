import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionService } from './subscription.service';

// Mock dependencies
const prismaMock = vi.hoisted(() => ({
  subscription: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
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

describe('SubscriptionService', () => {
  let subService: SubscriptionService;

  beforeEach(() => {
    vi.clearAllMocks();
    subService = new SubscriptionService();
  });

  // ─── hasFeature ────────────────────────────────────────────────────────────

  describe('hasFeature', () => {
    it('should return true if boolean feature is enabled in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            enabled: true,
            feature: { code: 'analytics', type: 'BOOLEAN' },
          }],
        },
      });

      const result = await subService.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(true);
    });

    it('should return false if subscription not active', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({ status: 'CANCELED' });
      const result = await subService.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return false if subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);
      const result = await subService.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return false if feature not in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: { features: [] },
      });
      const result = await subService.hasFeature('tenant-1', 'missing-feature');
      expect(result).toBe(false);
    });

    it('should return false if boolean feature is disabled', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            enabled: false,
            feature: { code: 'analytics', type: 'BOOLEAN' },
          }],
        },
      });
      const result = await subService.hasFeature('tenant-1', 'analytics');
      expect(result).toBe(false);
    });

    it('should return true for non-boolean feature types if present', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            enabled: true,
            limitValue: 100,
            feature: { code: 'users', type: 'QUOTA' },
          }],
        },
      });
      const result = await subService.hasFeature('tenant-1', 'users');
      expect(result).toBe(true);
    });
  });

  // ─── getCurrentSubscription ────────────────────────────────────────────────

  describe('getCurrentSubscription', () => {
    it('should return formatted subscription for tenant', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null,
        trialEnd: null,
        plan: {
          id: 'plan-1',
          code: 'starter',
          name: 'Starter',
          description: 'Basic plan',
          type: 'STANDARD',
          trialDays: 14,
          features: [{
            enabled: true,
            limitValue: null,
            customValue: null,
            feature: {
              code: 'analytics',
              name: 'Analytics',
              type: 'BOOLEAN',
              unit: null,
            },
          }],
        },
        price: {
          id: 'price-1',
          interval: 'month',
          intervalCount: 1,
          amount: 99,
          currency: 'USD',
        },
      });

      const result = await subService.getCurrentSubscription('tenant-1');

      expect(result.id).toBe('sub-1');
      expect(result.status).toBe('ACTIVE');
      expect(result.plan?.code).toBe('starter');
      expect(result.plan?.features).toHaveLength(1);
      expect(result.price?.amount).toBe(99);
    });

    it('should throw if subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(subService.getCurrentSubscription('tenant-unknown'))
        .rejects.toThrow('Subscription não encontrada');
    });
  });

  // ─── cancelSubscription ────────────────────────────────────────────────────

  describe('cancelSubscription', () => {
    it('should cancel subscription immediately', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
      });
      prismaMock.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelReason: 'Not needed',
        plan: null,
        price: null,
      });

      const result = await subService.cancelSubscription('tenant-1', {
        reason: 'Not needed',
        immediately: true,
      });

      expect(result.status).toBe('CANCELED');
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANCELED',
            cancelReason: 'Not needed',
          }),
        }),
      );
    });

    it('should schedule cancellation at period end', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
      });
      prismaMock.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        cancelAtPeriodEnd: true,
        cancelReason: 'Switching',
        plan: null,
        price: null,
      });

      const result = await subService.cancelSubscription('tenant-1', {
        reason: 'Switching',
        immediately: false,
      });

      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cancelAtPeriodEnd: true,
          }),
        }),
      );
    });

    it('should throw if subscription not found', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(subService.cancelSubscription('tenant-1', {
        reason: 'test',
        immediately: true,
      })).rejects.toThrow('Subscription não encontrada');
    });

    it('should throw if subscription already canceled', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'CANCELED',
      });

      await expect(subService.cancelSubscription('tenant-1', {
        reason: 'test',
        immediately: true,
      })).rejects.toThrow('Subscription já está cancelada');
    });
  });

  // ─── upgradePlan ───────────────────────────────────────────────────────────

  describe('upgradePlan', () => {
    it('should upgrade plan successfully', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        plan: { id: 'plan-starter' },
        price: { amount: 99 },
      });
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        isActive: true,
        prices: [{ id: 'price-pro', isActive: true, amount: 299 }],
      });
      prismaMock.subscription.update.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        plan: {
          id: 'plan-pro',
          code: 'pro',
          name: 'Pro',
          features: [],
        },
        price: { id: 'price-pro', interval: 'month', intervalCount: 1, amount: 299, currency: 'USD' },
      });

      const result = await subService.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        prorated: true,
      });

      expect(result.subscription.plan?.id).toBe('plan-pro');
    });

    it('should throw if subscription not found for upgrade', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      await expect(subService.upgradePlan('tenant-1', { planId: 'plan-pro', prorated: false }))
        .rejects.toThrow('Subscription não encontrada');
    });

    it('should throw if target plan not found or inactive', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        plan: { id: 'plan-starter' },
        price: null,
      });
      prismaMock.plan.findUnique.mockResolvedValue(null);

      await expect(subService.upgradePlan('tenant-1', { planId: 'plan-nonexistent', prorated: false }))
        .rejects.toThrow('Plano não encontrado ou inativo');
    });

    it('should throw if specific priceId not found in plan', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        plan: { id: 'plan-starter' },
        price: null,
      });
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        isActive: true,
        prices: [{ id: 'price-monthly', isActive: true }],
      });

      await expect(subService.upgradePlan('tenant-1', {
        planId: 'plan-pro',
        prorated: true,
        priceId: 'price-nonexistent',
      })).rejects.toThrow('Price não encontrado para este plano');
    });

    it('should throw if plan has no active prices', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        tenantId: 'tenant-1',
        plan: { id: 'plan-starter' },
        price: null,
      });
      prismaMock.plan.findUnique.mockResolvedValue({
        id: 'plan-pro',
        isActive: true,
        prices: [{ id: 'price-1', isActive: false }],
      });

      await expect(subService.upgradePlan('tenant-1', { planId: 'plan-pro', prorated: false }))
        .rejects.toThrow('Plano não possui prices ativos');
    });
  });

  // ─── getQuotaLimit ─────────────────────────────────────────────────────────

  describe('getQuotaLimit', () => {
    it('should return quota limit for active subscription', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            limitValue: 50,
            feature: { code: 'users', type: 'QUOTA' },
          }],
        },
      });

      const limit = await subService.getQuotaLimit('tenant-1', 'users');
      expect(limit).toBe(50);
    });

    it('should return 0 if subscription is not active', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({ status: 'CANCELED' });
      const limit = await subService.getQuotaLimit('tenant-1', 'users');
      expect(limit).toBe(0);
    });

    it('should return 0 if feature is not QUOTA type', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            limitValue: null,
            feature: { code: 'analytics', type: 'BOOLEAN' },
          }],
        },
      });
      const limit = await subService.getQuotaLimit('tenant-1', 'analytics');
      expect(limit).toBe(0);
    });
  });

  // ─── getQuotaUsage ─────────────────────────────────────────────────────────

  describe('getQuotaUsage', () => {
    it('should return current usage for feature', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 25 });

      const usage = await subService.getQuotaUsage('tenant-1', 'users');
      expect(usage).toBe(25);
    });

    it('should return 0 if feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);
      const usage = await subService.getQuotaUsage('tenant-1', 'unknown');
      expect(usage).toBe(0);
    });

    it('should return 0 if no usage records exist', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1' });
      prismaMock.usageRecord.findFirst.mockResolvedValue(null);

      const usage = await subService.getQuotaUsage('tenant-1', 'users');
      expect(usage).toBe(0);
    });
  });

  // ─── canUseFeature ─────────────────────────────────────────────────────────

  describe('canUseFeature', () => {
    it('should return true when usage is under limit', async () => {
      // hasFeature returns true
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            limitValue: 10,
            feature: { code: 'users', type: 'QUOTA' },
          }],
        },
      });
      // canUseFeature calls feature.findUnique
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', type: 'QUOTA' });
      // getQuotaUsage
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 5 });

      const canUse = await subService.canUseFeature('tenant-1', 'users');
      expect(canUse).toBe(true);
    });

    it('should return false when usage exceeds limit', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        plan: {
          features: [{
            limitValue: 10,
            feature: { code: 'users', type: 'QUOTA' },
          }],
        },
      });
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', type: 'QUOTA' });
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 10 });

      const canUse = await subService.canUseFeature('tenant-1', 'users');
      expect(canUse).toBe(false);
    });

    it('should return false if subscription not active', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({ status: 'CANCELED' });
      const canUse = await subService.canUseFeature('tenant-1', 'users');
      expect(canUse).toBe(false);
    });
  });

  // ─── recordUsage ───────────────────────────────────────────────────────────

  describe('recordUsage', () => {
    it('should record usage increment successfully', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', type: 'QUOTA' });
      // getQuotaUsage internal call
      prismaMock.usageRecord.findFirst.mockResolvedValue({ currentUsage: 5 });
      prismaMock.usageRecord.create.mockResolvedValue({});

      const result = await subService.recordUsage('tenant-1', 'users', 1);

      expect(result.currentUsage).toBe(6);
      expect(prismaMock.usageRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            featureId: 'feat-1',
            currentUsage: 6,
          }),
        }),
      );
    });

    it('should throw if feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(subService.recordUsage('tenant-1', 'nonexistent'))
        .rejects.toThrow('Feature não encontrada ou não é do tipo QUOTA');
    });

    it('should throw if feature is not QUOTA type', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'feat-1', type: 'BOOLEAN' });

      await expect(subService.recordUsage('tenant-1', 'analytics'))
        .rejects.toThrow('Feature não encontrada ou não é do tipo QUOTA');
    });
  });
});
