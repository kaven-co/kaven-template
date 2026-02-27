import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import Stripe from 'stripe';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const prismaMock = vi.hoisted(() => ({
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
  },
}));

const stripeMock = vi.hoisted(() => ({
  webhooks: {
    constructEvent: vi.fn(),
  },
  subscriptions: {
    cancel: vi.fn(),
    update: vi.fn(),
  },
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
    STRIPE_WEBHOOK_SECRET: 'whsec_test_secret',
    STRIPE_SECRET_KEY: 'sk_test_mock',
  },
}));
vi.mock('../../billing/services/payment.service', () => ({
  paymentService: paymentServiceMock,
}));

// ─── SUT ──────────────────────────────────────────────────────────────────────

import { stripeWebhookRoutes } from '../../webhooks/stripe';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Valid RFC 4122 UUIDs
const TENANT_ID = '6ba7b810-9dad-4a63-8000-00c04fd430c8';
const PLAN_ID = '6ba7b811-9dad-4a63-8000-00c04fd430c8';
const STRIPE_SUB_ID = 'sub_test_12345';

async function buildApp() {
  const app = Fastify({ logger: false });
  await app.register(stripeWebhookRoutes, { prefix: '/api/webhooks/stripe' });
  await app.ready();
  return app;
}

function buildStripeEvent(type: string, data: Record<string, unknown>): Stripe.Event {
  return {
    id: `evt_${Date.now()}`,
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

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Signature verification ────────────────────────────────────────────────

  it('returns 400 when stripe-signature header is missing', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: {},
      headers: { 'content-type': 'application/json' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('Missing stripe-signature');
  });

  it('returns 400 when signature is invalid', async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'bad_sig',
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain('Webhook signature verification failed');
  });

  // ── checkout.session.completed ────────────────────────────────────────────

  it('handles checkout.session.completed — creates and activates subscription', async () => {
    const session = {
      id: 'cs_test_completed',
      subscription: STRIPE_SUB_ID,
      customer: 'cus_abc',
      metadata: { tenantId: TENANT_ID, planId: PLAN_ID, priceId: 'price_123', interval: 'MONTHLY' },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('checkout.session.completed', session),
    );
    paymentServiceMock.createSubscription.mockResolvedValue({ id: 'sub-local-1' });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID, status: 'ACTIVE' });

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: JSON.stringify({ type: 'checkout.session.completed', data: { object: session } }),
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ received: true });

    expect(paymentServiceMock.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        planId: PLAN_ID,
        stripeSubscriptionId: STRIPE_SUB_ID,
        stripeCustomerId: 'cus_abc',
      }),
    );

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: TENANT_ID },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });

  it('handles checkout.session.completed — skips when metadata is missing', async () => {
    const session = { id: 'cs_no_meta', subscription: null, customer: null, metadata: null };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('checkout.session.completed', session),
    );

    const app = await buildApp();
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
    expect(paymentServiceMock.createSubscription).not.toHaveBeenCalled();
  });

  // ── customer.subscription.updated ────────────────────────────────────────

  it('handles customer.subscription.updated — syncs status to ACTIVE', async () => {
    const stripeSubscription = {
      id: STRIPE_SUB_ID,
      status: 'active',
      cancel_at_period_end: false,
      current_period_start: 1700000000,
      current_period_end: 1702678400,
      metadata: { tenantId: TENANT_ID },
      items: { data: [{ price: { id: 'price_stripe_abc' } }] },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('customer.subscription.updated', stripeSubscription),
    );
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildApp();
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
          stripeSubscriptionId: STRIPE_SUB_ID,
          cancelAtPeriodEnd: false,
        }),
      }),
    );
  });

  it('handles customer.subscription.updated — falls back to DB lookup when no metadata', async () => {
    const stripeSubscription = {
      id: STRIPE_SUB_ID,
      status: 'past_due',
      cancel_at_period_end: false,
      current_period_start: 1700000000,
      current_period_end: 1702678400,
      metadata: {},
      items: { data: [] },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('customer.subscription.updated', stripeSubscription),
    );
    prismaMock.subscription.findFirst.mockResolvedValue({ tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildApp();
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
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: STRIPE_SUB_ID },
    });
    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAST_DUE' }),
      }),
    );
  });

  // ── customer.subscription.deleted ────────────────────────────────────────

  it('handles customer.subscription.deleted — cancels subscription', async () => {
    const stripeSubscription = {
      id: STRIPE_SUB_ID,
      status: 'canceled',
      metadata: { tenantId: TENANT_ID },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('customer.subscription.deleted', stripeSubscription),
    );
    paymentServiceMock.cancelSubscription.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildApp();
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

  // ── invoice events ────────────────────────────────────────────────────────

  it('handles invoice.payment_succeeded — activates subscription', async () => {
    const invoice = { id: 'in_paid', subscription: STRIPE_SUB_ID };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('invoice.payment_succeeded', invoice),
    );
    prismaMock.subscription.findFirst.mockResolvedValue({ tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildApp();
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

  it('handles invoice.payment_failed — marks subscription PAST_DUE', async () => {
    const invoice = { id: 'in_failed', subscription: STRIPE_SUB_ID };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('invoice.payment_failed', invoice),
    );
    prismaMock.subscription.findFirst.mockResolvedValue({ tenantId: TENANT_ID });
    prismaMock.subscription.update.mockResolvedValue({ tenantId: TENANT_ID });

    const app = await buildApp();
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
        data: { status: 'PAST_DUE' },
      }),
    );
  });

  // ── Unhandled event types ─────────────────────────────────────────────────

  it('returns 200 and ignores unrecognized event types gracefully', async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('payment_intent.created', { id: 'pi_test' }),
    );

    const app = await buildApp();
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
    expect(res.json()).toMatchObject({ received: true });
    expect(paymentServiceMock.createSubscription).not.toHaveBeenCalled();
    expect(paymentServiceMock.cancelSubscription).not.toHaveBeenCalled();
  });

  it('still returns 200 even when handler throws (prevents Stripe retry loop)', async () => {
    const session = {
      id: 'cs_test_err',
      subscription: STRIPE_SUB_ID,
      customer: 'cus_err',
      metadata: { tenantId: TENANT_ID, planId: PLAN_ID },
    };

    stripeMock.webhooks.constructEvent.mockReturnValue(
      buildStripeEvent('checkout.session.completed', session),
    );
    paymentServiceMock.createSubscription.mockRejectedValue(new Error('DB error'));

    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/stripe',
      payload: '{}',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'valid_sig',
      },
    });

    // Must return 200 even on handler error so Stripe doesn't retry
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ received: true });
  });
});
