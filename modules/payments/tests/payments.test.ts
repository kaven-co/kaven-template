// Kaven Payments Module — Test Suite
// Tests for PaymentService, SubscriptionService, and webhook handlers.
// Run with: pnpm test (from kaven-framework root)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentService } from '../backend/services/payment.service';

// ─── PaymentService ───────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
  });

  describe('createSubscription', () => {
    it('should throw if tenantId is missing', async () => {
      await expect(
        service.createSubscription({ tenantId: '', planId: 'plan-1' })
      ).rejects.toThrow('tenantId é obrigatório');
    });

    it('should throw if planId is missing', async () => {
      await expect(
        service.createSubscription({ tenantId: 'tenant-1', planId: '' })
      ).rejects.toThrow('planId é obrigatório');
    });
  });

  describe('processWebhook (Paddle)', () => {
    it('should reject invalid signature', async () => {
      await expect(
        service.processWebhook(
          { event_type: 'subscription.created', event_id: 'evt-1', data: {} },
          'invalid-signature'
        )
      ).rejects.toThrow('Assinatura Paddle inválida');
    });

    it('should be idempotent — skip duplicate event_id', async () => {
      const payload = { event_type: 'payment.completed', event_id: 'evt-dupe', data: {} };

      // First call (no signature check for unknown events)
      const first = await service.processWebhook(payload);
      expect(first.processed).toBe(true);

      // Second call — same event_id
      const second = await service.processWebhook(payload);
      expect(second.processed).toBe(false);
      expect((second as any).reason).toBe('Evento já processado');
    });
  });
});

// ─── Integration tests (require real DB) ─────────────────────────────────────
// See: apps/api/src/modules/billing/services/payment.service.test.ts
// See: apps/api/src/modules/subscriptions/services/subscription.service.spec.ts
