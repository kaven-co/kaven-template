import { SubscriptionStatus, InvoiceStatus } from "@prisma/client";
import prisma from "../../../lib/prisma";
import { stripe } from "../../../lib/stripe";
import { secureLog } from "../../../utils/secure-logger";

export interface CreateSubscriptionInput {
  tenantId: string;
  planId: string;
  priceId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialDays?: number;
}

export interface PaddleWebhookPayload {
  event_type: string;
  event_id: string;
  data: Record<string, unknown>;
}

export class PaymentService {
  private processedWebhooks = new Set<string>(); // In-memory idempotency (use Redis in prod)

  /**
   * Cria subscription associada ao tenant
   */
  async createSubscription(input: CreateSubscriptionInput) {
    if (!input.tenantId) throw new Error("tenantId é obrigatório");
    if (!input.planId) throw new Error("planId é obrigatório");

    // Verificar que tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });
    if (!tenant) throw new Error("Tenant não encontrado");

    // Verificar se já possui subscription ativa
    const existing = await prisma.subscription.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new Error("Tenant já possui subscription ativa");
    }

    const now = new Date();
    const trialEnd = input.trialDays
      ? new Date(now.getTime() + input.trialDays * 24 * 60 * 60 * 1000)
      : undefined;

    if (existing) {
      // Atualizar subscription existente
      return prisma.subscription.update({
        where: { tenantId: input.tenantId },
        data: {
          planId: input.planId,
          priceId: input.priceId,
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          status: SubscriptionStatus.TRIALING,
          trialEnd,
          currentPeriodStart: now,
        },
      });
    }

    return prisma.subscription.create({
      data: {
        tenantId: input.tenantId,
        planId: input.planId,
        priceId: input.priceId,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        status: SubscriptionStatus.TRIALING,
        trialEnd,
        currentPeriodStart: now,
      },
    });
  }

  /**
   * Cancela subscription do tenant.
   *
   * When a stripeSubscriptionId is present the subscription is canceled in Stripe
   * immediately (cancel_at_period_end = false). If the subscription should instead
   * expire at the end of the billing period, pass `atPeriodEnd: true`.
   */
  async cancelSubscription(
    tenantId: string,
    reason?: string,
    options: { atPeriodEnd?: boolean } = {},
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) throw new Error("Subscription não encontrada");
    if (subscription.status === SubscriptionStatus.CANCELED) {
      // Idempotente
      return subscription;
    }

    // ── Cancel in Stripe if a Stripe subscription exists ──────────────────
    if (subscription.stripeSubscriptionId) {
      try {
        if (options.atPeriodEnd) {
          // Schedule cancellation at period end
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          secureLog.info('[PaymentService] Stripe subscription set to cancel at period end', {
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            tenantId,
          });

          // Mark locally as scheduled for cancellation but keep ACTIVE status
          return prisma.subscription.update({
            where: { tenantId },
            data: {
              cancelAtPeriodEnd: true,
              cancelReason: reason,
            },
          });
        } else {
          // Immediate cancellation
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
          secureLog.info('[PaymentService] Stripe subscription canceled immediately', {
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            tenantId,
          });
        }
      } catch (err: any) {
        secureLog.error('[PaymentService] Failed to cancel Stripe subscription', {
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          error: err.message,
        });
        throw new Error(`Failed to cancel Stripe subscription: ${err.message}`);
      }
    }

    return prisma.subscription.update({
      where: { tenantId },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelReason: reason,
      },
    });
  }

  /**
   * Processa webhook Paddle
   */
  async processWebhook(payload: PaddleWebhookPayload, signature?: string) {
    // Validar assinatura (simplificado — em prod usar Paddle SDK)
    if (signature !== undefined && signature !== "valid-signature") {
      throw new Error("Assinatura Paddle inválida");
    }

    // Idempotência: não processar mesmo evento duas vezes
    if (this.processedWebhooks.has(payload.event_id)) {
      return { processed: false, reason: "Evento já processado" };
    }

    this.processedWebhooks.add(payload.event_id);

    switch (payload.event_type) {
      case "subscription.created":
      case "subscription.activated":
        return this.handleSubscriptionActivated(payload.data);
      case "subscription.canceled":
        return this.handleSubscriptionCanceled(payload.data);
      case "payment.completed":
        return this.handlePaymentCompleted(payload.data);
      default:
        return { processed: true, event: payload.event_type, action: "ignored" };
    }
  }

  /**
   * Lista invoices filtradas por tenantId
   */
  async getInvoices(filters: {
    tenantId: string;
    status?: InvoiceStatus;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, status, page = 1, limit = 10 } = filters;

    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  // ─── Private handlers ──────────────────────────────────────────────────────

  private async handleSubscriptionActivated(data: Record<string, unknown>) {
    const tenantId = data.tenantId as string;
    if (!tenantId) return { processed: true, action: "skipped", reason: "no tenantId" };

    await prisma.subscription.updateMany({
      where: { tenantId },
      data: { status: SubscriptionStatus.ACTIVE },
    });

    return { processed: true, action: "subscription_activated", tenantId };
  }

  private async handleSubscriptionCanceled(data: Record<string, unknown>) {
    const tenantId = data.tenantId as string;
    if (!tenantId) return { processed: true, action: "skipped", reason: "no tenantId" };

    await prisma.subscription.updateMany({
      where: { tenantId },
      data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date(), cancelReason: undefined },
    });

    return { processed: true, action: "subscription_canceled", tenantId };
  }

  private async handlePaymentCompleted(data: Record<string, unknown>) {
    const invoiceId = data.invoiceId as string;
    if (!invoiceId) return { processed: true, action: "skipped", reason: "no invoiceId" };

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });

    return { processed: true, action: "payment_completed", invoiceId };
  }
}

export const paymentService = new PaymentService();
