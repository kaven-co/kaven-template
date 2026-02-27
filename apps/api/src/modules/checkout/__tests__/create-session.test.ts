import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks (must be hoisted before any imports that use them) ─────────────────

const prismaMock = vi.hoisted(() => ({
  plan: {
    findUnique: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
  },
}));

const stripeMock = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
}));

vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock, default: prismaMock }));
vi.mock('../../../lib/stripe', () => ({ stripe: stripeMock }));
vi.mock('../../../utils/secure-logger', () => ({
  secureLog: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('../../../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    FRONTEND_URL: 'http://localhost:3000',
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_mock',
  },
}));
vi.mock('../../../middleware/auth.middleware', () => ({
  authMiddleware: vi.fn(async (_req: any, _rep: any) => {
    // No-op: bypass auth in tests
  }),
}));

// ─── Import SUT after mocks ───────────────────────────────────────────────────

import { checkoutRoutes } from '../routes';
import Fastify from 'fastify';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Valid RFC 4122 UUIDs — version 4 (position 3 starts with [89ab])
const PLAN_ID = '6ba7b810-9dad-4a63-8000-00c04fd430c8';
const TENANT_ID = '6ba7b811-9dad-4a63-8000-00c04fd430c8';
const PRICE_ID = '6ba7b812-9dad-4a63-8000-00c04fd430c8';

function buildMockPlan(overrides: Record<string, unknown> = {}) {
  return {
    id: PLAN_ID,
    name: 'Starter Plan',
    description: 'Great plan',
    isActive: true,
    isPublic: true,
    trialDays: 0,
    prices: [
      {
        id: PRICE_ID,
        interval: 'MONTHLY',
        intervalCount: 1,
        amount: '99.00',
        currency: 'USD',
        stripePriceId: 'price_stripe_123',
        isActive: true,
      },
    ],
    ...overrides,
  };
}

async function buildApp() {
  const app = Fastify({ logger: false });

  // Inject authenticated user for all routes
  app.addHook('preHandler', async (req: any) => {
    req.user = { id: 'user-1', email: 'test@example.com', tenantId: TENANT_ID, role: 'MEMBER' };
  });

  await app.register(checkoutRoutes, { prefix: '/api/checkout' });
  await app.ready();
  return app;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/checkout/create-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a session with a known stripePriceId', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan());
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeCustomerId: 'cus_existing',
    });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_abc123',
      url: 'https://checkout.stripe.com/cs_test_abc123',
    });

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({
      sessionId: 'cs_test_abc123',
      url: expect.stringContaining('checkout.stripe.com'),
    });

    // Verify Stripe was called with correct params
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        customer: 'cus_existing',
        line_items: [{ quantity: 1, price: 'price_stripe_123' }],
        metadata: expect.objectContaining({ tenantId: TENANT_ID, planId: PLAN_ID }),
        success_url: expect.stringContaining('/checkout/success'),
        cancel_url: expect.stringContaining('/checkout/cancel'),
      }),
    );
  });

  it('creates a Stripe customer when none exists for the tenant', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan());
    prismaMock.subscription.findUnique.mockResolvedValue({ stripeCustomerId: null });
    prismaMock.tenant.findUnique.mockResolvedValue({ id: TENANT_ID, name: 'Acme Corp' });
    stripeMock.customers.create.mockResolvedValue({ id: 'cus_new_456' });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_def456',
      url: 'https://checkout.stripe.com/cs_test_def456',
    });

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(200);
    expect(stripeMock.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Acme Corp',
        metadata: expect.objectContaining({ tenantId: TENANT_ID }),
      }),
    );
    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new_456' }),
    );
  });

  it('builds inline price_data when plan has no stripePriceId', async () => {
    const planWithoutStripePrice = buildMockPlan({
      prices: [
        {
          id: PRICE_ID,
          interval: 'MONTHLY',
          intervalCount: 1,
          amount: '49.90',
          currency: 'USD',
          stripePriceId: null,
          isActive: true,
        },
      ],
    });

    prismaMock.plan.findUnique.mockResolvedValue(planWithoutStripePrice);
    prismaMock.subscription.findUnique.mockResolvedValue({ stripeCustomerId: 'cus_xyz' });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_inline',
      url: 'https://checkout.stripe.com/cs_test_inline',
    });

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(200);
    const callArg = stripeMock.checkout.sessions.create.mock.calls[0][0];
    const lineItem = callArg.line_items[0];
    expect(lineItem.price_data).toBeDefined();
    expect(lineItem.price_data.unit_amount).toBe(4990); // 49.90 → cents
    expect(lineItem.price_data.currency).toBe('usd');
    expect(lineItem.price_data.recurring.interval).toBe('month');
  });

  it('includes trial_period_days when plan has trialDays > 0', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan({ trialDays: 14 }));
    prismaMock.subscription.findUnique.mockResolvedValue({ stripeCustomerId: 'cus_trial' });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_trial',
      url: 'https://checkout.stripe.com/cs_test_trial',
    });

    const app = await buildApp();
    await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: expect.objectContaining({ trial_period_days: 14 }),
      }),
    );
  });

  it('returns 404 when plan does not exist', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(null);

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'PLAN_NOT_FOUND' });
  });

  it('returns 404 when no price exists for the requested interval', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan({ prices: [] }));

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'PRICE_NOT_FOUND' });
  });

  it('returns 400 when plan is inactive', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan({ isActive: false }));

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: 'PLAN_INACTIVE' });
  });

  it('returns 400 for invalid request body (bad UUID)', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: 'not-a-uuid' }, // missing tenantId, bad planId
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('returns 500 when Stripe throws an unexpected error', async () => {
    prismaMock.plan.findUnique.mockResolvedValue(buildMockPlan());
    prismaMock.subscription.findUnique.mockResolvedValue({ stripeCustomerId: 'cus_error' });
    stripeMock.checkout.sessions.create.mockRejectedValue(new Error('Stripe API error'));

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(500);
    expect(res.json()).toMatchObject({ code: 'CHECKOUT_SESSION_ERROR' });
  });

  it('returns 403 when authenticated user belongs to a different tenant', async () => {
    const differentTenantId = '6ba7b813-9dad-4a63-8000-00c04fd430c8';
    const app = Fastify({ logger: false });
    // User belongs to a different tenant than the requested one
    app.addHook('preHandler', async (req: any) => {
      req.user = { id: 'user-other', tenantId: differentTenantId, role: 'MEMBER' };
    });
    await app.register(checkoutRoutes, { prefix: '/api/checkout' });
    await app.ready();

    const res = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json()).toMatchObject({ code: 'TENANT_MISMATCH' });
  });
});
