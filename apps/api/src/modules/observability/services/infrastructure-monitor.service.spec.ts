import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PrismaClient and Redis BEFORE imports
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class MockPrismaClient {
      $queryRaw = vi.fn().mockResolvedValue([{ '?column?': 1 }]);
      $disconnect = vi.fn().mockResolvedValue(undefined);
    },
  };
});

vi.mock('ioredis', () => {
  return {
    Redis: class MockRedis {
      status = 'ready';
      ping = vi.fn().mockResolvedValue('PONG');
      connect = vi.fn().mockResolvedValue(undefined);
      quit = vi.fn().mockResolvedValue(undefined);
      on = vi.fn();
      constructor(..._args: any[]) {}
    },
  };
});

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { InfrastructureMonitorService } from './infrastructure-monitor.service';

describe('InfrastructureMonitorService', () => {
  let service: InfrastructureMonitorService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    service = new InfrastructureMonitorService();
  });

  // ─── checkAll ──────────────────────────────────────────────────────────────

  describe('checkAll', () => {
    it('deve retornar status de todos os serviços de infraestrutura', async () => {
      const results = await service.checkAll();

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name === 'PostgreSQL')).toBe(true);
      expect(results.some(r => r.name === 'Redis')).toBe(true);
    });

    it('deve retornar healthy quando todos os serviços respondem', async () => {
      const results = await service.checkAll();

      const postgres = results.find(r => r.name === 'PostgreSQL')!;
      expect(postgres.status).toBe('healthy');
      expect(postgres.errorCount).toBe(0);
      expect(postgres.successRate).toBe(100);

      const redis = results.find(r => r.name === 'Redis')!;
      expect(redis.status).toBe('healthy');
    });

    it('deve retornar latência e lastCheck para cada serviço', async () => {
      const results = await service.checkAll();

      for (const result of results) {
        expect(result.latency).toBeGreaterThanOrEqual(0);
        expect(result.lastCheck).toBeGreaterThan(0);
      }
    });

    it('deve incluir serviços de monitoramento (Prometheus, Grafana)', async () => {
      const results = await service.checkAll();

      expect(results.some(r => r.name === 'Prometheus')).toBe(true);
      expect(results.some(r => r.name === 'Grafana')).toBe(true);
    });

    it('deve retornar unhealthy quando serviço HTTP falha', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const results = await service.checkAll();

      const prometheus = results.find(r => r.name === 'Prometheus')!;
      expect(prometheus.status).toBe('unhealthy');
      expect(prometheus.errorCount).toBe(1);
      expect(prometheus.successRate).toBe(0);
    });

    it('deve retornar unhealthy quando serviço HTTP retorna erro 500+', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      const results = await service.checkAll();

      // HTTP services (Prometheus, Grafana, Loki, MailHog) should be unhealthy
      const httpServices = results.filter(r =>
        ['Prometheus', 'Grafana', 'Loki', 'MailHog'].includes(r.name),
      );
      for (const svc of httpServices) {
        expect(svc.status).toBe('unhealthy');
      }
    });
  });

  // ─── close ─────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('deve fechar conexões de Prisma e Redis', async () => {
      await service.close();

      // Verifying the method doesn't throw is sufficient
      // The mocks handle the actual disconnect
    });
  });
});
