import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalAPIMonitorService } from './external-api-monitor.service';

// Mock axios
vi.mock('axios', () => ({
  default: {
    head: vi.fn().mockResolvedValue({ status: 200 }),
  },
}));

// Mock prisma (for loadEmailIntegrations)
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    emailIntegration: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import axios from 'axios';

describe('ExternalAPIMonitorService', () => {
  let service: ExternalAPIMonitorService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.PAGBIT_API_KEY;
    delete process.env.PAGBIT_API_URL;

    service = new ExternalAPIMonitorService();
  });

  // ─── checkAll ──────────────────────────────────────────────────────────────

  describe('checkAll', () => {
    it('deve retornar status de todas as APIs externas', async () => {
      const results = await service.checkAll();

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'Stripe')).toBe(true);
      expect(results.some(r => r.name === 'Google Maps')).toBe(true);
    });

    it('deve retornar not_configured quando API key não está definida', async () => {
      const results = await service.checkAll();

      const stripe = results.find(r => r.name === 'Stripe')!;
      expect(stripe.status).toBe('not_configured');
      expect(stripe.errorMessage).toContain('not configured');
    });

    it('deve retornar healthy quando API configurada responde com sucesso', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';

      // Need to create a new instance to pick up the env var
      service = new ExternalAPIMonitorService();

      vi.mocked(axios.head).mockResolvedValueOnce({ status: 200 } as any);

      const results = await service.checkAll();

      const stripe = results.find(r => r.name === 'Stripe')!;
      expect(stripe.status).toBe('healthy');
      expect(stripe.successRate).toBe(100);
      expect(stripe.errorCount).toBe(0);
    });

    it('deve retornar unhealthy quando API configurada falha', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      service = new ExternalAPIMonitorService();

      vi.mocked(axios.head).mockRejectedValueOnce(new Error('Connection timeout'));

      const results = await service.checkAll();

      const stripe = results.find(r => r.name === 'Stripe')!;
      expect(stripe.status).toBe('unhealthy');
      expect(stripe.errorCount).toBe(1);
      expect(stripe.successRate).toBe(0);
      expect(stripe.errorMessage).toBe('Connection timeout');
    });

    it('deve incluir latência na resposta', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      service = new ExternalAPIMonitorService();

      vi.mocked(axios.head).mockResolvedValueOnce({ status: 200 } as any);

      const results = await service.checkAll();

      const stripe = results.find(r => r.name === 'Stripe')!;
      expect(stripe.latency).toBeGreaterThanOrEqual(0);
      expect(stripe.lastCheck).toBeGreaterThan(0);
    });

    it('deve incluir integrações de email carregadas do banco', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked((prisma as any).emailIntegration.findMany).mockResolvedValue([
        {
          id: 'integration-1',
          provider: 'RESEND',
          isActive: true,
          isPrimary: true,
          fromEmail: 'noreply@test.com',
          healthStatus: 'healthy',
          healthMessage: null,
          lastHealthCheck: new Date(),
        },
      ]);

      const results = await service.checkAll();

      const emailIntegration = results.find(r => r.name.includes('RESEND'));
      expect(emailIntegration).toBeDefined();
      expect(emailIntegration!.status).toBe('healthy');
    });

    it('deve tratar erro ao carregar integrações de email graciosamente', async () => {
      const { prisma } = await import('../../../lib/prisma');
      vi.mocked((prisma as any).emailIntegration.findMany).mockRejectedValue(
        new Error('DB connection failed'),
      );

      // Should not throw, just log error and return fixed APIs
      const results = await service.checkAll();
      expect(results.length).toBeGreaterThanOrEqual(3); // At least Stripe, Google Maps, PagBit
    });
  });
});
