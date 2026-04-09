import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { env } from '../../config/env';
import { secureLog } from '../../utils/secure-logger';
import { paymentService } from '../billing/services/payment.service';
import { prisma } from '../../lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

// ─── Webhook handler ──────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/stripe
 *
 * Receives and processes Stripe webhook events.
 * Signature is verified using STRIPE_WEBHOOK_SECRET.
 *
 * Handled events:
 *   - checkout.session.completed        → create/activate subscription
 *   - customer.subscription.updated     → sync subscription status
 *   - customer.subscription.deleted     → mark subscription as canceled
 *   - invoice.payment_succeeded         → mark invoice as paid
 *   - invoice.payment_failed            → mark invoice as past-due
 */
async function stripeWebhookHandler(request: FastifyRequest, reply: FastifyReply) {
  const sig = request.headers['stripe-signature'] as string;

  if (!sig) {
    secureLog.warn('[StripeWebhook] Missing stripe-signature header');
    return reply.status(400).send({ error: 'Missing stripe-signature header' });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    secureLog.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
    return reply.status(500).send({ error: 'Webhook secret not configured' });
  }

  // ── 1. Verify signature ───────────────────────────────────────────────────
  let event: Stripe.Event;

  try {
    // rawBody is set by the addContentTypeParser hook registered in stripeWebhookRoutes
    const rawBody = (request as any).rawBody as Buffer;
    event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    secureLog.warn('[StripeWebhook] Invalid signature', { error: err.message });
    return reply.status(400).send({ error: `Webhook signature verification failed: ${err.message}` });
  }

  secureLog.info('[StripeWebhook] Received event', { type: event.type, id: event.id });

  // ── 2. Dispatch by event type ─────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        secureLog.info('[StripeWebhook] Unhandled event type (ignored)', { type: event.type });
    }
  } catch (err: any) {
    // Log but still return 200 to prevent Stripe retries for application errors.
    // Stripe retries on non-2xx responses, which can cause duplicate processing.
    secureLog.error('[StripeWebhook] Error processing event', {
      type: event.type,
      id: event.id,
      error: err.message,
    });
  }

  // Always return 200 to acknowledge receipt
  return reply.status(200).send({ received: true });
}

// ─── Event handlers ───────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 *
 * Fired when a customer completes the Stripe Checkout flow.
 * Creates or updates the subscription record in the database.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { tenantId, planId, priceId } = session.metadata ?? {};

  if (!tenantId || !planId) {
    secureLog.warn('[StripeWebhook] checkout.session.completed missing metadata', {
      sessionId: session.id,
    });
    return;
  }

  const stripeSubscriptionId = session.subscription as string | null;
  const stripeCustomerId = session.customer as string | null;

  await paymentService.createSubscription({
    tenantId,
    planId,
    priceId: priceId ?? undefined,
    stripeCustomerId: stripeCustomerId ?? undefined,
    stripeSubscriptionId: stripeSubscriptionId ?? undefined,
  });

  // Immediately activate (trial was already set in session creation)
  await prisma.subscription.update({
    where: { tenantId },
    data: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
    },
  });

  secureLog.info('[StripeWebhook] Subscription activated via checkout', {
    tenantId,
    planId,
    stripeSubscriptionId,
  });
}

/**
 * customer.subscription.updated
 *
 * Fired when a subscription changes (plan change, status change, etc.).
 * Syncs status and period dates to the database.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { tenantId } = subscription.metadata ?? {};

  if (!tenantId) {
    // Fall back to lookup by stripeSubscriptionId
    const record = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!record) {
      secureLog.warn('[StripeWebhook] subscription.updated — no matching subscription', {
        stripeSubscriptionId: subscription.id,
      });
      return;
    }

    await syncSubscriptionRecord(record.tenantId, subscription);
    return;
  }

  await syncSubscriptionRecord(tenantId, subscription);
}

/**
 * customer.subscription.deleted
 *
 * Fired when a subscription is canceled and fully expired.
 * Marks the subscription as CANCELED in the database.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { tenantId } = subscription.metadata ?? {};

  let resolvedTenantId = tenantId;

  if (!resolvedTenantId) {
    const record = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!record) {
      secureLog.warn('[StripeWebhook] subscription.deleted — no matching subscription', {
        stripeSubscriptionId: subscription.id,
      });
      return;
    }
    resolvedTenantId = record.tenantId;
  }

  await paymentService.cancelSubscription(resolvedTenantId, 'Stripe subscription deleted');

  secureLog.info('[StripeWebhook] Subscription canceled', {
    tenantId: resolvedTenantId,
    stripeSubscriptionId: subscription.id,
  });
}

/**
 * invoice.payment_succeeded
 *
 * Fired when an invoice is paid. Records payment and ensures subscription is ACTIVE.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionRef = (invoice as any).subscription;
  if (!subscriptionRef) return;

  const stripeSubscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

  const record = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!record) {
    secureLog.warn('[StripeWebhook] invoice.payment_succeeded — no subscription found', {
      stripeSubscriptionId,
    });
    return;
  }

  // Ensure subscription is active (handles past-due → active transitions)
  await prisma.subscription.update({
    where: { tenantId: record.tenantId },
    data: { status: SubscriptionStatus.ACTIVE },
  });

  secureLog.info('[StripeWebhook] Invoice payment succeeded', {
    tenantId: record.tenantId,
    invoiceId: invoice.id,
  });
}

/**
 * invoice.payment_failed
 *
 * Fired when a payment attempt fails. Marks subscription as PAST_DUE.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionRef = (invoice as any).subscription;
  if (!subscriptionRef) return;

  const stripeSubscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;

  const record = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!record) {
    secureLog.warn('[StripeWebhook] invoice.payment_failed — no subscription found', {
      stripeSubscriptionId,
    });
    return;
  }

  await prisma.subscription.update({
    where: { tenantId: record.tenantId },
    data: { status: SubscriptionStatus.PAST_DUE },
  });

  secureLog.warn('[StripeWebhook] Invoice payment failed — subscription past due', {
    tenantId: record.tenantId,
    invoiceId: invoice.id,
  });
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Maps a Stripe subscription status string to the Kaven SubscriptionStatus enum.
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'trialing':
      return SubscriptionStatus.TRIALING;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
    case 'unpaid':
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

/**
 * Syncs a Stripe Subscription object to the database record for the given tenantId.
 */
async function syncSubscriptionRecord(tenantId: string, subscription: Stripe.Subscription) {
  const status = mapStripeStatus(subscription.status);
  const item = subscription.items.data[0];

  await prisma.subscription.update({
    where: { tenantId },
    data: {
      status,
      stripeSubscriptionId: subscription.id,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      ...(item?.price?.id ? { priceId: item.price.id } : {}),
    },
  });

  secureLog.info('[StripeWebhook] Subscription synced', {
    tenantId,
    status,
    stripeSubscriptionId: subscription.id,
  });
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function stripeWebhookRoutes(app: FastifyInstance) {
  // Stripe requires the raw (unparsed) request body to verify the signature.
  // Fastify parses JSON by default, so we register a raw content-type parser
  // scoped to this plugin only.
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      // Store raw buffer on request for signature verification
      (req as any).rawBody = body;
      try {
        const parsed = JSON.parse(body.toString());
        done(null, parsed);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    },
  );

  app.post('/', stripeWebhookHandler);
}
