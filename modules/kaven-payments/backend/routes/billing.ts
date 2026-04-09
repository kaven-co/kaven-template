import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { paymentService } from '../services/payment.service';
import { authMiddleware } from '../../middleware/auth.middleware';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  priceId: z.string().optional(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  trialDays: z.number().int().positive().optional(),
});

const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
  atPeriodEnd: z.boolean().default(false),
});

const listInvoicesSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELED', 'REFUNDED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ─── Route registration ───────────────────────────────────────────────────────

export async function billingRoutes(app: FastifyInstance) {
  // POST /api/billing/subscriptions — Create subscription
  app.post('/subscriptions', {
    preHandler: [authMiddleware],
    // [KAVEN_MODULE:payments BEGIN]
    schema: { body: createSubscriptionSchema },
    // [KAVEN_MODULE:payments END]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const body = createSubscriptionSchema.parse(request.body);

    const subscription = await paymentService.createSubscription({
      tenantId: user.tenantId,
      ...body,
    });

    return reply.status(201).send(subscription);
  });

  // DELETE /api/billing/subscriptions/:tenantId — Cancel subscription
  app.delete('/subscriptions/:tenantId', {
    preHandler: [authMiddleware],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = request.params as { tenantId: string };
    const body = cancelSubscriptionSchema.parse(request.body ?? {});

    const subscription = await paymentService.cancelSubscription(
      tenantId,
      body.reason,
      { atPeriodEnd: body.atPeriodEnd },
    );

    return reply.send(subscription);
  });

  // GET /api/billing/invoices — List invoices for tenant
  app.get('/invoices', {
    preHandler: [authMiddleware],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = listInvoicesSchema.parse(request.query);

    const result = await paymentService.getInvoices({
      tenantId: user.tenantId,
      ...query,
    });

    return reply.send(result);
  });
}
