import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planService, PlanRequesterContext } from './plan.service';

const prismaMock = vi.hoisted(() => ({
  plan: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  planFeature: {
    createMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
  feature: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlan(overrides: Record<string, any> = {}) {
  return {
    id: 'plan-1',
    code: 'starter',
    name: 'Starter',
    description: 'Starter plan',
    type: 'SUBSCRIPTION',
    trialDays: 14,
    isDefault: false,
    isPublic: true,
    isActive: true,
    sortOrder: 0,
    badge: null,
    stripeProductId: null,
    tenantId: null,
    metadata: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    prices: [],
    features: [],
    products: [],
    ...overrides,
  };
}

function makePrice(overrides: Record<string, any> = {}) {
  return {
    id: 'price-1',
    interval: 'MONTH',
    intervalCount: 1,
    amount: '2900',
    currency: 'BRL',
    originalAmount: null,
    stripePriceId: null,
    pagueBitPriceId: null,
    isActive: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listPlans
  // -------------------------------------------------------------------------
  describe('listPlans', () => {
    it('should return formatted plans with default filters', async () => {
      const plan = makePlan({ prices: [makePrice()], features: [], products: [] });
      prismaMock.plan.findMany.mockResolvedValue([plan]);

      const result = await planService.listPlans();

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('starter');
      expect(result[0].prices[0].amount).toBe(2900);
    });

    it('should apply tenantId filter', async () => {
      prismaMock.plan.findMany.mockResolvedValue([]);

      await planService.listPlans({ tenantId: 'tenant-a' });

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-a' }),
        })
      );
    });

    it('should apply isActive filter', async () => {
      prismaMock.plan.findMany.mockResolvedValue([]);

      await planService.listPlans({ isActive: true });

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should apply isPublic filter', async () => {
      prismaMock.plan.findMany.mockResolvedValue([]);

      await planService.listPlans({ isPublic: false });

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isPublic: false }),
        })
      );
    });

    it('should apply type filter', async () => {
      prismaMock.plan.findMany.mockResolvedValue([]);

      await planService.listPlans({ type: 'SUBSCRIPTION' } as any);

      expect(prismaMock.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'SUBSCRIPTION' }),
        })
      );
    });

    it('should format price amounts as numbers', async () => {
      const plan = makePlan({
        prices: [makePrice({ amount: '9900', originalAmount: '14900' })],
      });
      prismaMock.plan.findMany.mockResolvedValue([plan]);

      const [result] = await planService.listPlans();

      expect(result.prices[0].amount).toBe(9900);
      expect(result.prices[0].originalAmount).toBe(14900);
    });
  });

  // -------------------------------------------------------------------------
  // getPlanById
  // -------------------------------------------------------------------------
  describe('getPlanById', () => {
    it('should return plan when found', async () => {
      const plan = makePlan();
      prismaMock.plan.findFirst.mockResolvedValue(plan);

      const result = await planService.getPlanById('plan-1');

      expect(result.id).toBe('plan-1');
    });

    it('should apply tenant isolation via OR clause when tenantId is provided', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(makePlan());

      await planService.getPlanById('plan-1', 'tenant-a');

      expect(prismaMock.plan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'plan-1',
            OR: [
              { tenantId: 'tenant-a' },
              { tenantId: null },
              { isPublic: true },
            ],
          }),
        })
      );
    });

    it('should restrict to public plans for anonymous access', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(makePlan());

      await planService.getPlanById('plan-1');

      expect(prismaMock.plan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'plan-1',
            isPublic: true,
          }),
        })
      );
    });

    it('should throw when plan not found', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(null);

      await expect(planService.getPlanById('nonexistent')).rejects.toThrow(
        'Plano não encontrado'
      );
    });
  });

  // -------------------------------------------------------------------------
  // getPlanByCode
  // -------------------------------------------------------------------------
  describe('getPlanByCode', () => {
    it('should find plan by code and tenantId', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(makePlan({ code: 'pro' }));

      const result = await planService.getPlanByCode('pro', 'tenant-a');

      expect(prismaMock.plan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'pro', tenantId: 'tenant-a' },
        })
      );
      expect(result.code).toBe('pro');
    });

    it('should default tenantId to null when not provided', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(makePlan());

      await planService.getPlanByCode('starter');

      expect(prismaMock.plan.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'starter', tenantId: null },
        })
      );
    });

    it('should throw when plan not found by code', async () => {
      prismaMock.plan.findFirst.mockResolvedValue(null);

      await expect(planService.getPlanByCode('nonexistent')).rejects.toThrow(
        'Plano não encontrado'
      );
    });
  });

  // -------------------------------------------------------------------------
  // createPlan
  // -------------------------------------------------------------------------
  describe('createPlan', () => {
    it('should throw when duplicate code exists', async () => {
      prismaMock.plan.findFirst
        .mockResolvedValueOnce({ id: 'existing' }) // duplicate check
      ;

      await expect(
        planService.createPlan({
          code: 'starter',
          name: 'Starter',
          prices: [],
        } as any)
      ).rejects.toThrow('Já existe um plano com este código');
    });

    it('should create plan with prices', async () => {
      const createdPlan = makePlan({ id: 'new-plan' });

      prismaMock.plan.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(createdPlan); // getPlanById lookup
      prismaMock.plan.create.mockResolvedValue(createdPlan);

      const result = await planService.createPlan({
        code: 'starter',
        name: 'Starter',
        prices: [{ interval: 'MONTH', intervalCount: 1, amount: 29, currency: 'BRL' }],
      } as any);

      expect(prismaMock.plan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'starter',
            name: 'Starter',
          }),
        })
      );
      expect(result.id).toBe('new-plan');
    });

    it('should unset other default plans when isDefault is true', async () => {
      const createdPlan = makePlan({ id: 'new-default', isDefault: true });

      prismaMock.plan.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(createdPlan); // getPlanById
      prismaMock.plan.create.mockResolvedValue(createdPlan);
      prismaMock.plan.updateMany.mockResolvedValue({ count: 1 });

      await planService.createPlan({
        code: 'default-plan',
        name: 'Default',
        isDefault: true,
        prices: [],
      } as any);

      expect(prismaMock.plan.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isDefault: false },
        })
      );
    });

    it('should add features when provided', async () => {
      const createdPlan = makePlan({ id: 'plan-feat' });

      prismaMock.plan.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(createdPlan); // getPlanById
      prismaMock.plan.create.mockResolvedValue(createdPlan);
      prismaMock.feature.findMany.mockResolvedValue([
        { id: 'f1', code: 'max_users', isActive: true },
      ]);
      prismaMock.planFeature.createMany.mockResolvedValue({ count: 1 });

      await planService.createPlan({
        code: 'starter',
        name: 'Starter',
        prices: [],
        features: [{ featureCode: 'max_users', enabled: true, limitValue: 10 }],
      } as any);

      expect(prismaMock.planFeature.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              planId: 'plan-feat',
              featureId: 'f1',
              enabled: true,
              limitValue: 10,
            }),
          ]),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // updatePlan
  // -------------------------------------------------------------------------
  describe('updatePlan', () => {
    it('should throw when plan does not exist', async () => {
      prismaMock.plan.findUnique.mockResolvedValue(null);

      await expect(
        planService.updatePlan('nonexistent', { name: 'Updated' } as any)
      ).rejects.toThrow('Plano não encontrado');
    });

    it('should update plan and return refreshed data', async () => {
      const existing = makePlan();
      const updated = makePlan({ name: 'Updated' });

      prismaMock.plan.findUnique.mockResolvedValue(existing);
      prismaMock.plan.update.mockResolvedValue(updated);
      prismaMock.plan.findFirst.mockResolvedValue(updated); // getPlanById

      const result = await planService.updatePlan('plan-1', { name: 'Updated' } as any);

      expect(prismaMock.plan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'plan-1' },
          data: { name: 'Updated' },
        })
      );
      expect(result.name).toBe('Updated');
    });

    it('should unset other defaults when setting isDefault to true', async () => {
      const existing = makePlan({ tenantId: 'tenant-a' });
      const updated = makePlan({ isDefault: true, tenantId: 'tenant-a' });

      prismaMock.plan.findUnique.mockResolvedValue(existing);
      prismaMock.plan.update.mockResolvedValue(updated);
      prismaMock.plan.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.plan.findFirst.mockResolvedValue(updated); // getPlanById

      await planService.updatePlan('plan-1', { isDefault: true } as any);

      expect(prismaMock.plan.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-a',
            isDefault: true,
            id: { not: 'plan-1' },
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // deletePlan
  // -------------------------------------------------------------------------
  describe('deletePlan', () => {
    it('should throw when plan does not exist', async () => {
      prismaMock.plan.findUnique.mockResolvedValue(null);

      await expect(planService.deletePlan('nonexistent')).rejects.toThrow(
        'Plano não encontrado'
      );
    });

    it('should throw when plan has active subscriptions', async () => {
      prismaMock.plan.findUnique.mockResolvedValue(
        makePlan({ subscriptions: [{ id: 'sub-1', status: 'ACTIVE' }] })
      );

      await expect(planService.deletePlan('plan-1')).rejects.toThrow(
        'assinaturas ativas'
      );
    });

    it('should soft-delete plan when no active subscriptions', async () => {
      prismaMock.plan.findUnique.mockResolvedValue(
        makePlan({ subscriptions: [] })
      );
      prismaMock.plan.update.mockResolvedValue({});

      const result = await planService.deletePlan('plan-1');

      expect(prismaMock.plan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'plan-1' },
          data: { isActive: false, isPublic: false },
        })
      );
      expect(result.message).toContain('desativado');
    });
  });

  // -------------------------------------------------------------------------
  // addFeaturesToPlan
  // -------------------------------------------------------------------------
  describe('addFeaturesToPlan', () => {
    it('should throw when features are not found', async () => {
      prismaMock.feature.findMany.mockResolvedValue([]);

      await expect(
        planService.addFeaturesToPlan('plan-1', [
          { featureCode: 'missing_feature' },
        ])
      ).rejects.toThrow('Features não encontradas: missing_feature');
    });

    it('should create plan features with defaults', async () => {
      prismaMock.feature.findMany.mockResolvedValue([
        { id: 'f1', code: 'max_users', isActive: true },
      ]);
      prismaMock.planFeature.createMany.mockResolvedValue({ count: 1 });

      await planService.addFeaturesToPlan('plan-1', [
        { featureCode: 'max_users' },
      ]);

      expect(prismaMock.planFeature.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            expect.objectContaining({
              planId: 'plan-1',
              featureId: 'f1',
              enabled: true, // default
            }),
          ],
          skipDuplicates: true,
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // updatePlanFeature
  // -------------------------------------------------------------------------
  describe('updatePlanFeature', () => {
    it('should throw when feature code is invalid', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        planService.updatePlanFeature('plan-1', 'nonexistent', { enabled: false })
      ).rejects.toThrow('Feature não encontrada');
    });

    it('should upsert plan feature', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'f1', code: 'max_users' });
      prismaMock.planFeature.upsert.mockResolvedValue({});
      prismaMock.plan.findFirst.mockResolvedValue(makePlan()); // getPlanById

      await planService.updatePlanFeature('plan-1', 'max_users', {
        enabled: true,
        limitValue: 50,
      });

      expect(prismaMock.planFeature.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            planId_featureId: { planId: 'plan-1', featureId: 'f1' },
          },
          update: { enabled: true, limitValue: 50 },
          create: expect.objectContaining({
            planId: 'plan-1',
            featureId: 'f1',
            enabled: true,
            limitValue: 50,
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // removePlanFeature
  // -------------------------------------------------------------------------
  describe('removePlanFeature', () => {
    it('should throw when feature code is invalid', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        planService.removePlanFeature('plan-1', 'nonexistent')
      ).rejects.toThrow('Feature não encontrada');
    });

    it('should delete the plan-feature association', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'f1', code: 'max_users' });
      prismaMock.planFeature.delete.mockResolvedValue({});

      const result = await planService.removePlanFeature('plan-1', 'max_users');

      expect(prismaMock.planFeature.delete).toHaveBeenCalledWith({
        where: {
          planId_featureId: { planId: 'plan-1', featureId: 'f1' },
        },
      });
      expect(result.message).toContain('removida');
    });
  });

  // -------------------------------------------------------------------------
  // validatePlanTenantScope (DB-M5: Feature/Plan Multi-Tenant Ambiguity)
  // -------------------------------------------------------------------------
  describe('validatePlanTenantScope', () => {
    it('should allow SUPER_ADMIN to create global plans (tenantId=null)', () => {
      const requester: PlanRequesterContext = { role: 'SUPER_ADMIN', tenantId: null };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: null }, requester)
      ).not.toThrow();
    });

    it('should allow SUPER_ADMIN to create tenant-specific plans for any tenant', () => {
      const requester: PlanRequesterContext = { role: 'SUPER_ADMIN', tenantId: null };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: 'tenant-a' }, requester)
      ).not.toThrow();
    });

    it('should reject TENANT_ADMIN creating global plans (tenantId=null)', () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: 'tenant-a' };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: null }, requester)
      ).toThrow('Only SUPER_ADMIN can create global plans');
    });

    it('should reject TENANT_ADMIN creating plans for a different tenant', () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: 'tenant-a' };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: 'tenant-b' }, requester)
      ).toThrow('Cannot create plans for a different tenant');
    });

    it('should allow TENANT_ADMIN to create plans for their own tenant', () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: 'tenant-a' };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: 'tenant-a' }, requester)
      ).not.toThrow();
    });

    it('should reject USER role creating global plans', () => {
      const requester: PlanRequesterContext = { role: 'USER', tenantId: 'tenant-a' };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: null }, requester)
      ).toThrow('Only SUPER_ADMIN can create global plans');
    });

    it('should reject requester without tenantId creating tenant-specific plans', () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: null };

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: 'tenant-a' }, requester)
      ).toThrow('Requester must belong to a tenant');
    });

    it('should skip validation when no requester context is provided', () => {
      expect(() =>
        planService.validatePlanTenantScope({ tenantId: null })
      ).not.toThrow();

      expect(() =>
        planService.validatePlanTenantScope({ tenantId: 'tenant-a' })
      ).not.toThrow();
    });

    it('should treat undefined tenantId as null (global plan)', () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: 'tenant-a' };

      expect(() =>
        planService.validatePlanTenantScope({}, requester)
      ).toThrow('Only SUPER_ADMIN can create global plans');
    });
  });

  // -------------------------------------------------------------------------
  // createPlan with requester context (DB-M5 integration)
  // -------------------------------------------------------------------------
  describe('createPlan with tenant validation', () => {
    it('should reject non-SUPER_ADMIN creating global plans', async () => {
      const requester: PlanRequesterContext = { role: 'TENANT_ADMIN', tenantId: 'tenant-a' };

      await expect(
        planService.createPlan(
          { code: 'global-plan', name: 'Global', prices: [], tenantId: null } as any,
          requester
        )
      ).rejects.toThrow('Only SUPER_ADMIN can create global plans');

      // Prisma should NOT have been called
      expect(prismaMock.plan.findFirst).not.toHaveBeenCalled();
    });

    it('should allow SUPER_ADMIN to create global plans', async () => {
      const requester: PlanRequesterContext = { role: 'SUPER_ADMIN', tenantId: null };
      const createdPlan = makePlan({ id: 'global-plan' });

      prismaMock.plan.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(createdPlan); // getPlanById
      prismaMock.plan.create.mockResolvedValue(createdPlan);

      const result = await planService.createPlan(
        { code: 'global', name: 'Global', prices: [], tenantId: null } as any,
        requester
      );

      expect(result.id).toBe('global-plan');
    });
  });
});
