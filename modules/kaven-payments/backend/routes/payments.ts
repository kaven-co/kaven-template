import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { secureLog } from '../../utils/secure-logger';
import { authMiddleware } from '../../middleware/auth.middleware';

// ─── Request schemas ──────────────────────────────────────────────────────────

const createSessionSchema = z.object({
  planId: z.string().uuid('planId must be a valid UUID'),
  interval: z.enum(['MONTHLY', 'YEARLY', 'QUARTERLY', 'WEEKLY']).default('MONTHLY'),
  tenantId: z.string().uuid('tenantId must be a valid UUID'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ─── Route handlers ───────────────────────────────────────────────────────────

/**
 * POST /api/checkout/create-session
 *
 * Creates a Stripe Checkout session for a subscription plan.
 * Requires authenticated user (authMiddleware).
 *
 * Body: { planId, interval, tenantId }
 * Returns: { sessionId, url }
 */
async function createSessionHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createSessionSchema.parse(request.body);
    const { planId, interval, tenantId } = body;

    // ── 1. Validate that the requesting user belongs to the tenant ─────────
    const requestingUser = (request as any).user;
    if (requestingUser?.tenantId && requestingUser.tenantId !== tenantId) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'You do not have access to this tenant',
        code: 'TENANT_MISMATCH',
        statusCode: 403,
      });
    }

    // ── 2. Fetch the plan ──────────────────────────────────────────────────
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        prices: {
          where: { interval: interval as any, isActive: true },
          take: 1,
        },
      },
    });

    if (!plan) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Plan ${planId} not found`,
        code: 'PLAN_NOT_FOUND',
        statusCode: 404,
      });
    }

    if (!plan.isActive) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'This plan is not currently available for purchase',
        code: 'PLAN_INACTIVE',
        statusCode: 400,
      });
    }

    // ── 3. Find price for the requested interval ───────────────────────────
    const price = plan.prices[0];

    if (!price) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `No ${interval} price found for plan "${plan.name}"`,
        code: 'PRICE_NOT_FOUND',
        statusCode: 404,
      });
    }

    // ── 4. Resolve Stripe price ────────────────────────────────────────────
    // Prefer an already-configured Stripe Price ID on the Price record.
    // If none exists, use an inline price definition so the session still works
    // (useful during development before Stripe products are fully configured).
    let stripePrice: string | Stripe.Checkout.SessionCreateParams.LineItem['price_data'];

    if (price.stripePriceId) {
      stripePrice = price.stripePriceId;
    } else {
      // Build an inline price — Stripe will create a one-off price object
      stripePrice = {
        currency: (price.currency ?? 'usd').toLowerCase(),
        unit_amount: Math.round(Number(price.amount) * 100), // convert to cents
        recurring: {
          interval: mapBillingInterval(interval),
          interval_count: price.intervalCount ?? 1,
        },
        product_data: {
          name: plan.name,
          ...(plan.description ? { description: plan.description } : {}),
        },
      };
    }

    // ── 5. Look up or create Stripe customer for tenant ────────────────────
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    let stripeCustomerId: string | undefined = subscription?.stripeCustomerId ?? undefined;

    if (!stripeCustomerId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      const customer = await stripe.customers.create({
        name: tenant?.name ?? tenantId,
        metadata: { tenantId, kaven: 'true' },
      });
      stripeCustomerId = customer.id;
    }

    // ── 6. Build Stripe Checkout session ──────────────────────────────────
    const clientUrl = env.FRONTEND_URL ?? 'http://localhost:3000';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          quantity: 1,
          ...(typeof stripePrice === 'string'
            ? { price: stripePrice }
            : { price_data: stripePrice }),
        },
      ],
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout/cancel`,
      metadata: {
        tenantId,
        planId,
        priceId: price.id,
        interval,
      },
      subscription_data: {
        metadata: { tenantId, planId },
        ...(plan.trialDays && plan.trialDays > 0
          ? { trial_period_days: plan.trialDays }
          : {}),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    secureLog.info('[Checkout] Session created', {
      sessionId: session.id,
      tenantId,
      planId,
      interval,
    });

    return reply.status(200).send({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error.errors,
      });
    }

    secureLog.error('[Checkout] Error creating session:', error);
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create checkout session',
      code: 'CHECKOUT_SESSION_ERROR',
      statusCode: 500,
    });
  }
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function checkoutRoutes(app: FastifyInstance) {
  app.post(
    '/create-session',
    {
      preHandler: [authMiddleware],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: 60_000, // 10 per minute — guard against abuse
        },
      },
    },
    createSessionHandler,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps Kaven BillingInterval enum to Stripe's recurring interval value.
 */
function mapBillingInterval(
  interval: string,
): 'day' | 'week' | 'month' | 'year' {
  switch (interval) {
    case 'WEEKLY':
      return 'week';
    case 'MONTHLY':
      return 'month';
    case 'QUARTERLY':
      return 'month'; // 3 × month handled via intervalCount
    case 'YEARLY':
      return 'year';
    default:
      return 'month';
  }
}
