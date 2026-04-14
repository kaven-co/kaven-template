import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { secureLog } from '../../utils/secure-logger';
import { paymentService, PaddleWebhookPayload } from '../../services/payment.service';

// ─── Paddle Webhook handler ───────────────────────────────────────────────────

/**
 * POST /api/webhooks/paddle
 *
 * Receives and processes Paddle webhook events.
 * Signature validation uses PADDLE_WEBHOOK_SECRET.
 *
 * Handled events:
 *   - subscription.created    → activate subscription
 *   - subscription.activated  → activate subscription
 *   - subscription.canceled   → cancel subscription
 *   - payment.completed       → mark invoice as paid
 */
async function paddleWebhookHandler(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers['paddle-signature'] as string | undefined;

  const payload = request.body as PaddleWebhookPayload;

  if (!payload?.event_type || !payload?.event_id) {
    return reply.status(400).send({ error: 'Invalid Paddle payload' });
  }

  secureLog.info('[PaddleWebhook] Received event', {
    type: payload.event_type,
    id: payload.event_id,
  });

  try {
    const result = await paymentService.processWebhook(payload, signature);
    return reply.status(200).send(result);
  } catch (err: any) {
    secureLog.error('[PaddleWebhook] Processing failed', { error: err.message });
    return reply.status(400).send({ error: err.message });
  }
}

// ─── Route registration ───────────────────────────────────────────────────────

export async function paddleWebhookRoutes(app: FastifyInstance) {
  app.post('/paddle', {
    config: { rawBody: true },
  }, paddleWebhookHandler);
}
