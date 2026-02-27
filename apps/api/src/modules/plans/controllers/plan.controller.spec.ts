import { describe, it, expect, vi, beforeEach } from 'vitest';
import { planController } from './plan.controller';

// ---------------------------------------------------------------------------
// Mock planService (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const planServiceMock = vi.hoisted(() => ({
  listPlans: vi.fn(),
  getPlanById: vi.fn(),
  getPlanByCode: vi.fn(),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  deletePlan: vi.fn(),
  addFeaturesToPlan: vi.fn(),
  updatePlanFeature: vi.fn(),
  removePlanFeature: vi.fn(),
}));

vi.mock('../services/plan.service', () => ({
  planService: planServiceMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(overrides: Record<string, any> = {}): any {
  return {
    query: {},
    params: {},
    body: {},
    tenantId: undefined,
    user: undefined,
    ...overrides,
  };
}

function makeReply(): any {
  const reply: any = {
    statusCode: 200,
    body: undefined,
  };
  reply.status = vi.fn((code: number) => {
    reply.statusCode = code;
    return reply;
  });
  reply.send = vi.fn((data: any) => {
    reply.body = data;
    return reply;
  });
  return reply;
}

function makePlan(overrides: Record<string, any> = {}) {
  return {
    id: 'plan-1',
    code: 'starter',
    name: 'Starter',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlanController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------
  describe('list', () => {
    it('should return plans with 200 status', async () => {
      const plans = [makePlan()];
      planServiceMock.listPlans.mockResolvedValue(plans);

      const req = makeRequest({ query: {} });
      const reply = makeReply();

      await planController.list(req, reply);

      expect(reply.send).toHaveBeenCalledWith({ plans });
    });

    it('should pass parsed query filters to service', async () => {
      planServiceMock.listPlans.mockResolvedValue([]);

      const req = makeRequest({
        query: { isActive: 'true', tenantId: '550e8400-e29b-41d4-a716-446655440000' },
      });
      const reply = makeReply();

      await planController.list(req, reply);

      expect(planServiceMock.listPlans).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          tenantId: '550e8400-e29b-41d4-a716-446655440000',
        })
      );
    });

    it('should return 400 on error', async () => {
      // Invalid query that fails Zod validation
      const req = makeRequest({ query: { tenantId: 'not-a-uuid' } });
      const reply = makeReply();

      await planController.list(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.body).toHaveProperty('error');
    });
  });

  // -------------------------------------------------------------------------
  // getById
  // -------------------------------------------------------------------------
  describe('getById', () => {
    it('should return plan by id', async () => {
      const plan = makePlan();
      planServiceMock.getPlanById.mockResolvedValue(plan);

      const req = makeRequest({ params: { id: 'plan-1' } });
      const reply = makeReply();

      await planController.getById(req, reply);

      expect(planServiceMock.getPlanById).toHaveBeenCalledWith('plan-1', undefined);
      expect(reply.send).toHaveBeenCalledWith(plan);
    });

    it('should pass tenantId from request', async () => {
      planServiceMock.getPlanById.mockResolvedValue(makePlan());

      const req = makeRequest({
        params: { id: 'plan-1' },
        tenantId: 'tenant-a',
      });
      const reply = makeReply();

      await planController.getById(req, reply);

      expect(planServiceMock.getPlanById).toHaveBeenCalledWith('plan-1', 'tenant-a');
    });

    it('should pass tenantId from user when tenantId not directly set', async () => {
      planServiceMock.getPlanById.mockResolvedValue(makePlan());

      const req = makeRequest({
        params: { id: 'plan-1' },
        user: { tenantId: 'tenant-b' },
      });
      const reply = makeReply();

      await planController.getById(req, reply);

      expect(planServiceMock.getPlanById).toHaveBeenCalledWith('plan-1', 'tenant-b');
    });

    it('should return 404 when plan not found', async () => {
      planServiceMock.getPlanById.mockRejectedValue(new Error('Plano não encontrado'));

      const req = makeRequest({ params: { id: 'nonexistent' } });
      const reply = makeReply();

      await planController.getById(req, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.body.error).toContain('não encontrado');
    });
  });

  // -------------------------------------------------------------------------
  // getByCode
  // -------------------------------------------------------------------------
  describe('getByCode', () => {
    it('should find plan by code', async () => {
      const plan = makePlan({ code: 'pro' });
      planServiceMock.getPlanByCode.mockResolvedValue(plan);

      const req = makeRequest({ params: { code: 'pro' }, query: {} });
      const reply = makeReply();

      await planController.getByCode(req, reply);

      expect(planServiceMock.getPlanByCode).toHaveBeenCalledWith('pro', undefined);
      expect(reply.send).toHaveBeenCalledWith(plan);
    });

    it('should pass tenantId query param', async () => {
      planServiceMock.getPlanByCode.mockResolvedValue(makePlan());

      const req = makeRequest({
        params: { code: 'starter' },
        query: { tenantId: 'tenant-a' },
      });
      const reply = makeReply();

      await planController.getByCode(req, reply);

      expect(planServiceMock.getPlanByCode).toHaveBeenCalledWith('starter', 'tenant-a');
    });

    it('should return 404 when plan code not found', async () => {
      planServiceMock.getPlanByCode.mockRejectedValue(
        new Error('Plano não encontrado')
      );

      const req = makeRequest({ params: { code: 'nonexistent' }, query: {} });
      const reply = makeReply();

      await planController.getByCode(req, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
    });
  });

  // -------------------------------------------------------------------------
  // create
  // -------------------------------------------------------------------------
  describe('create', () => {
    it('should create plan and return 201', async () => {
      const newPlan = makePlan({ id: 'new-plan' });
      planServiceMock.createPlan.mockResolvedValue(newPlan);

      const req = makeRequest({
        body: {
          code: 'business',
          name: 'Business Plan',
          prices: [{ interval: 'MONTHLY', intervalCount: 1, amount: 99, currency: 'BRL' }],
        },
      });
      const reply = makeReply();

      await planController.create(req, reply);

      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith(newPlan);
    });

    it('should return 400 on validation error', async () => {
      const req = makeRequest({
        body: { code: 'INVALID CODE', name: 'X' }, // invalid code + missing prices
      });
      const reply = makeReply();

      await planController.create(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply.body).toHaveProperty('error');
    });

    it('should return 400 when service throws', async () => {
      planServiceMock.createPlan.mockRejectedValue(
        new Error('Já existe um plano com este código')
      );

      const req = makeRequest({
        body: {
          code: 'starter',
          name: 'Starter',
          prices: [{ interval: 'MONTHLY', intervalCount: 1, amount: 29, currency: 'BRL' }],
        },
      });
      const reply = makeReply();

      await planController.create(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
    });
  });

  // -------------------------------------------------------------------------
  // update
  // -------------------------------------------------------------------------
  describe('update', () => {
    it('should update plan and return result', async () => {
      const updated = makePlan({ name: 'Updated' });
      planServiceMock.updatePlan.mockResolvedValue(updated);

      const req = makeRequest({
        params: { id: 'plan-1' },
        body: { name: 'Updated' },
      });
      const reply = makeReply();

      await planController.update(req, reply);

      expect(planServiceMock.updatePlan).toHaveBeenCalledWith('plan-1', { name: 'Updated' });
      expect(reply.send).toHaveBeenCalledWith(updated);
    });

    it('should return 400 on error', async () => {
      planServiceMock.updatePlan.mockRejectedValue(new Error('Plano não encontrado'));

      const req = makeRequest({
        params: { id: 'nonexistent' },
        body: { name: 'X' },
      });
      const reply = makeReply();

      await planController.update(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
    });
  });

  // -------------------------------------------------------------------------
  // delete
  // -------------------------------------------------------------------------
  describe('delete', () => {
    it('should delete plan and return result', async () => {
      planServiceMock.deletePlan.mockResolvedValue({ message: 'Plano desativado com sucesso' });

      const req = makeRequest({ params: { id: 'plan-1' } });
      const reply = makeReply();

      await planController.delete(req, reply);

      expect(planServiceMock.deletePlan).toHaveBeenCalledWith('plan-1');
      expect(reply.body.message).toContain('desativado');
    });

    it('should return 400 when plan has active subscriptions', async () => {
      planServiceMock.deletePlan.mockRejectedValue(
        new Error('Não é possível deletar plano com assinaturas ativas')
      );

      const req = makeRequest({ params: { id: 'plan-1' } });
      const reply = makeReply();

      await planController.delete(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
    });
  });

  // -------------------------------------------------------------------------
  // addFeature
  // -------------------------------------------------------------------------
  describe('addFeature', () => {
    it('should add feature to plan', async () => {
      planServiceMock.addFeaturesToPlan.mockResolvedValue(undefined);
      const updatedPlan = makePlan({ features: [{ code: 'max_users' }] });
      planServiceMock.getPlanById.mockResolvedValue(updatedPlan);

      const req = makeRequest({
        params: { id: 'plan-1' },
        body: { featureCode: 'max_users', enabled: true, limitValue: 10 },
      });
      const reply = makeReply();

      await planController.addFeature(req, reply);

      expect(planServiceMock.addFeaturesToPlan).toHaveBeenCalledWith(
        'plan-1',
        [expect.objectContaining({ featureCode: 'max_users', enabled: true, limitValue: 10 })]
      );
      expect(reply.send).toHaveBeenCalledWith(updatedPlan);
    });
  });

  // -------------------------------------------------------------------------
  // updateFeature
  // -------------------------------------------------------------------------
  describe('updateFeature', () => {
    it('should update plan feature', async () => {
      const updatedPlan = makePlan();
      planServiceMock.updatePlanFeature.mockResolvedValue(updatedPlan);

      const req = makeRequest({
        params: { id: 'plan-1', featureCode: 'max_users' },
        body: { limitValue: 100 },
      });
      const reply = makeReply();

      await planController.updateFeature(req, reply);

      expect(planServiceMock.updatePlanFeature).toHaveBeenCalledWith(
        'plan-1',
        'max_users',
        { limitValue: 100 }
      );
    });
  });

  // -------------------------------------------------------------------------
  // removeFeature
  // -------------------------------------------------------------------------
  describe('removeFeature', () => {
    it('should remove feature from plan', async () => {
      planServiceMock.removePlanFeature.mockResolvedValue({
        message: 'Feature removida do plano',
      });

      const req = makeRequest({
        params: { id: 'plan-1', featureCode: 'max_users' },
      });
      const reply = makeReply();

      await planController.removeFeature(req, reply);

      expect(planServiceMock.removePlanFeature).toHaveBeenCalledWith('plan-1', 'max_users');
      expect(reply.body.message).toContain('removida');
    });

    it('should return 400 when feature not found', async () => {
      planServiceMock.removePlanFeature.mockRejectedValue(
        new Error('Feature não encontrada')
      );

      const req = makeRequest({
        params: { id: 'plan-1', featureCode: 'nonexistent' },
      });
      const reply = makeReply();

      await planController.removeFeature(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
    });
  });
});
