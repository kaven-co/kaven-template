/**
 * Integration Test: Stripe Checkout Full Flow Simulation
 *
 * Simulates the complete lifecycle:
 *   1. Frontend calls POST /api/checkout/create-session
 *   2. Stripe fires checkout.session.completed webhook
 *   3. Webhook activates subscription in DB
 *   4. Stripe fires invoice.payment_succeeded on next renewal
 *   5. Stripe fires customer.subscription.deleted if tenant cancels
 *
 * All external services (Stripe, DB) are mocked. The goal is to verify
 * the interaction between checkout routes and webhook routes from the
 * perspective of the HTTP layer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import Stripe from 'stripe';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  plan: { findUnique: vi.fn() },
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  tenant: { findUnique: vi.fn() },
}));

const stripeMock = vi.hoisted(() => ({
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
  webhooks: { constructEvent: vi.fn() },
  subscriptions: { cancel: vi.fn(), update: vi.fn() },
}));

const paymentServiceMock = vi.hoisted(() => ({
  createSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
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
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
  },
}));
vi.mock('../../../middleware/auth.middleware', () => ({
  authMiddleware: vi.fn((_req: any, _rep: any, done: any) => done?.()),
}));
vi.mock('../../billing/services/payment.service', () => ({
  paymentService: paymentServiceMock,
}));

// ─── SUT ──────────────────────────────────────────────────────────────────────

import { checkoutRoutes } from '../routes';
import { stripeWebhookRoutes } from '../../webhooks/stripe';

// ─── Constants ────────────────────────────────────────────────────────────────

// Valid RFC 4122 UUIDs
const TENANT_ID = '6ba7b810-9dad-4a63-8000-00c04fd430c9';
const PLAN_ID = '6ba7b811-9dad-4a63-8000-00c04fd430c9';
const PRICE_ID = '6ba7b812-9dad-4a63-8000-00c04fd430c9';
const STRIPE_CUSTOMER_ID = 'cus_integration_test';
const STRIPE_SUBSCRIPTION_ID = 'sub_integration_test';

// ─── Test app factory ─────────────────────────────────────────────────────────

async function buildIntegrationApp() {
  const app = Fastify({ logger: false });

  // Inject authenticated user for checkout routes
  app.addHook('preHandler', async (req: any, _rep) => {
    if (req.url.startsWith('/api/checkout')) {
      req.user = { id: 'user-1', email: 'owner@example.com', tenantId: TENANT_ID, role: 'ADMIN' };
    }
  });

  await app.register(checkoutRoutes, { prefix: '/api/checkout' });
  await app.register(stripeWebhookRoutes, { prefix: '/api/webhooks/stripe' });

  await app.ready();
  return app;
}

function buildStripeEvent(type: string, data: Record<string, unknown>): Stripe.Event {
  return {
    id: `evt_${type}_${Date.now()}`,
    type,
    object: 'event',
    api_version: '2024-12-18.acacia',
    created: Math.floor(Date.now() / 1000),
    data: { object: data },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Stripe Checkout Integration — Full Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Phase 1 → 2 → 3: checkout creation triggers webhook that activates subscription', async () => {
    // ── Phase 1: Tenant initiates checkout ──────────────────────────────────
    prismaMock.plan.findUnique.mockResolvedValue({
      id: PLAN_ID,
      name: 'Complete Plan',
      description: 'Full features',
      isActive: true,
      trialDays: 0,
      prices: [
        {
          id: PRICE_ID,
          interval: 'MONTHLY',
          intervalCount: 1,
          amount: '399.00',
          currency: 'USD',
          stripePriceId: 'price_stripe_complete_monthly',
          isActive: true,
        },
      ],
    });
    prismaMock.subscription.findUnique.mockResolvedValue({ stripeCustomerId: STRIPE_CUSTOMER_ID });
    stripeMock.checkout.sessions.create.mockResolvedValue({
      id: 'cs_integration_001',
      url: `https://checkout.stripe.com/cs_integration_001`,
    });

    const app = await buildIntegrationApp();

    const checkoutRes = await app.inject({
      method: 'POST',
      url: '/api/checkout/create-session',
      headers: { 'content-type': 'application/json' },
      payload: { planId: PLAN_ID, interval: 'MONTHLY', tenantId: TENANT_ID },
    });

    expect(checkoutRes.statusCode).toBe(200);
    const { sessionId, url } = checkoutRes.json();
    expect(sessionId).toBe('cs_integration_001');
    expect(url).toContain('checkout.stripe.com');

    // ── Phase 2: Stripe fires checkout.session.completed ───────────────────
    const completedSession = {
      id: 'cs_integration_001',
      subscription: STRIPE_SUBSCRIPTION_ID,
      customer: STRIPE_CUSTOMER_ID,
      metadata: {
        tenantId: TENANT_ID,
        planId: PLAN_ID,
        priceId: PRICE_ID,
        interval: 'MONTHLY',
      },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('checkout.session.completed', completedSession),
    );
    paymentServiceMock.createSubscription.mockResolvedValue({ id: 'sub-local', tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID, status: 'ACTIVE' });

    const webhookRes = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: JSON.stringify(completedSession),
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    // ── Phase 3: Verify subscription was activated ─────────────────────────
    expect(webhookRes.statusCode).toBe(200);
    expect(webhookRes.json()).toMatchObject({ received: true });

    expect(paymentServiceMock.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        planId: PLAN_ID,
        stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
        stripeCustomerId: STRIPE_CUSTOMER_ID,
      }),
    );

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_ID },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });

  it('Phase 4: Renewal via invoice.payment_succeeded keeps subscription ACTIVE', async () => {
    const invoice = {
      id: 'in_renewal_001',
      subscription: STRIPE_SUBSCRIPTION_ID,
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('invoice.payment_succeeded', invoice),
    );
    prismaMock.subscription.findFirst.mockResolvedValue({
      tenantId: TENANT_ID,
      stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
    });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildIntegrationApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_ID },
        data: { status: 'ACTIVE' },
      }),
    );
  });

  it('Phase 5: customer.subscription.deleted cancels the tenant subscription', async () => {
    const deletedSub = {
      id: STRIPE_SUBSCRIPTION_ID,
      status: 'canceled',
      metadata: { tenantId: TENANT_ID },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('customer.subscription.deleted', deletedSub),
    );
    paymentServiceMock.cancelSubscription.mockResolvedValue({
      tenantId: TENANT_ID,
      status: 'CANCELED',
    });

    const app = await buildIntegrationApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(paymentServiceMock.cancelSubscription).toHaveBeenCalledWith(
      TENANT_ID,
      'Stripe subscription deleted',
    );
  });

  it('Failed payment flow: invoice.payment_failed → PAST_DUE → retry succeeds → ACTIVE', async () => {
    const invoice = { id: 'in_failed_retry', subscription: STRIPE_SUBSCRIPTION_ID };

    prismaMock.subscription.findFirst.mockResolvedValue({ tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildIntegrationApp();

    // Step A: Payment fails → PAST_DUE
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(
      buildStripeEvent('invoice.payment_failed', invoice),
    );

    const failedRes = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(failedRes.statusCode).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PAST_DUE' } }),
    );

    vi.clearAllMocks();

    // Step B: Stripe retries, payment succeeds → ACTIVE
    prismaMock.subscription.findFirst.mockResolvedValue({ tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });
    stripeMock.webhooks.constructEvent.mockReturnValueOnce(
      buildStripeEvent('invoice.payment_succeeded', invoice),
    );

    const retryRes = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(retryRes.statusCode).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'ACTIVE' } }),
    );
  });

  it('Plan upgrade: subscription.updated reflects new plan pricing', async () => {
    const updatedSub = {
      id: STRIPE_SUBSCRIPTION_ID,
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1700000000,
      current_period_end: 1702678400,
      metadata: { tenantId: TENANT_ID },
      items: { data: [{ price: { id: 'price_stripe_pro_monthly' } }] },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('customer.subscription.updated', updatedSub),
    );
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildIntegrationApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_ID },
        data: expect.objectContaining({
          status: 'ACTIVE',
          stripeSubscriptionId: STRIPE_SUBSCRIPTION_ID,
          priceId: 'price_stripe_pro_monthly',
        }),
      }),
    );
  });
});
