import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AlertingService } from './alerting.service';
import type { Alert } from './alerting.service';

// Mock prisma
vi.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// Mock notification service
vi.mock('../../notifications/services/notification.service', () => ({
  notificationService: {
    createNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AlertingService', () => {
  let service: AlertingService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Use fake timers only for cleanup interval, then restore
    service = new AlertingService();
  });

  // ─── checkMetrics ──────────────────────────────────────────────────────────

  describe('checkMetrics', () => {
    it('deve disparar alerta quando CPU excede threshold', async () => {
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);

      expect(newAlerts.length).toBeGreaterThan(0);
      const cpuAlert = newAlerts.find(a => a.thresholdId === 'cpu_high');
      expect(cpuAlert).toBeDefined();
      expect(cpuAlert!.severity).toBe('high');
    });

    it('deve disparar alerta quando memória excede threshold', async () => {
      const metrics = {
        cpu: { usage: 30 },
        memory: { usagePercent: 90 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);

      const memAlert = newAlerts.find(a => a.thresholdId === 'memory_high');
      expect(memAlert).toBeDefined();
      expect(memAlert!.severity).toBe('high');
    });

    it('deve disparar alerta critical quando disco excede 90%', async () => {
      const metrics = {
        cpu: { usage: 30 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 95 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);

      const diskAlert = newAlerts.find(a => a.thresholdId === 'disk_high');
      expect(diskAlert).toBeDefined();
      expect(diskAlert!.severity).toBe('critical');
    });

    it('não deve disparar alerta quando métricas estão dentro dos limites', async () => {
      const metrics = {
        cpu: { usage: 30 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [
          { name: 'PostgreSQL', status: 'healthy' },
          { name: 'Redis', status: 'healthy' },
        ],
      };

      const newAlerts = await service.checkMetrics(metrics);

      // Only service status alerts might fire for services not in the list
      const resourceAlerts = newAlerts.filter(a =>
        ['cpu_high', 'memory_high', 'disk_high', 'error_rate_high'].includes(a.thresholdId),
      );
      expect(resourceAlerts).toHaveLength(0);
    });

    it('deve auto-resolver alerta quando métrica volta ao normal', async () => {
      // First call: trigger alert
      const highMetrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      await service.checkMetrics(highMetrics);
      expect(service.getActiveAlerts().some(a => a.thresholdId === 'cpu_high')).toBe(true);

      // Second call: metrics normal, alert should auto-resolve
      const normalMetrics = {
        cpu: { usage: 30 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      await service.checkMetrics(normalMetrics);
      expect(service.getActiveAlerts().some(a => a.thresholdId === 'cpu_high')).toBe(false);
    });

    it('não deve duplicar alertas se threshold já ativo', async () => {
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const firstAlerts = await service.checkMetrics(metrics);
      const secondAlerts = await service.checkMetrics(metrics);

      const cpuAlertsFirst = firstAlerts.filter(a => a.thresholdId === 'cpu_high');
      const cpuAlertsSecond = secondAlerts.filter(a => a.thresholdId === 'cpu_high');

      expect(cpuAlertsFirst).toHaveLength(1);
      expect(cpuAlertsSecond).toHaveLength(0); // No new alert second time
    });
  });

  // ─── Threshold Management ─────────────────────────────────────────────────

  describe('getAllThresholds', () => {
    it('deve retornar todos os thresholds configurados', () => {
      const thresholds = service.getAllThresholds();
      expect(thresholds.length).toBeGreaterThan(0);
      expect(thresholds.some(t => t.id === 'cpu_high')).toBe(true);
      expect(thresholds.some(t => t.id === 'memory_high')).toBe(true);
    });
  });

  describe('getThreshold', () => {
    it('deve retornar threshold pelo id', () => {
      const threshold = service.getThreshold('cpu_high');
      expect(threshold).not.toBeNull();
      expect(threshold!.metric).toBe('cpu_usage');
    });

    it('deve retornar null para id inexistente', () => {
      const threshold = service.getThreshold('nonexistent');
      expect(threshold).toBeNull();
    });
  });

  describe('updateThreshold', () => {
    it('deve atualizar threshold existente', () => {
      const result = service.updateThreshold('cpu_high', { value: 95 });
      expect(result).toBe(true);

      const updated = service.getThreshold('cpu_high');
      expect(updated!.value).toBe(95);
    });

    it('deve retornar false para threshold inexistente', () => {
      const result = service.updateThreshold('nonexistent', { value: 50 });
      expect(result).toBe(false);
    });
  });

  // ─── Alert Management ─────────────────────────────────────────────────────

  describe('resolveAlertById', () => {
    it('deve resolver alerta manualmente', async () => {
      // First trigger an alert
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);
      const cpuAlert = newAlerts.find(a => a.thresholdId === 'cpu_high')!;

      const resolved = service.resolveAlertById(cpuAlert.id);
      expect(resolved).not.toBeNull();
      expect(resolved!.resolved).toBe(true);
      expect(resolved!.resolvedAt).toBeDefined();
    });

    it('deve retornar null para alertId inexistente', () => {
      const result = service.resolveAlertById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getActiveAlerts / getResolvedAlerts / getAllAlerts', () => {
    it('deve separar alertas ativos e resolvidos corretamente', async () => {
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 90 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);
      expect(service.getActiveAlerts().length).toBeGreaterThanOrEqual(2);

      // Resolve one
      const cpuAlert = newAlerts.find(a => a.thresholdId === 'cpu_high')!;
      service.resolveAlertById(cpuAlert.id);

      expect(service.getResolvedAlerts().some(a => a.id === cpuAlert.id)).toBe(true);
      expect(service.getAllAlerts().length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── cleanupOldAlerts ──────────────────────────────────────────────────────

  describe('cleanupOldAlerts', () => {
    it('deve remover alertas resolvidos mais antigos que maxAgeMs', async () => {
      // Trigger and resolve an alert
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      const newAlerts = await service.checkMetrics(metrics);
      const alert = newAlerts.find(a => a.thresholdId === 'cpu_high')!;
      service.resolveAlertById(alert.id);

      // Set resolvedAt to 2 hours ago
      const resolved = service.getAlert(alert.id)!;
      resolved.resolvedAt = Date.now() - 2 * 60 * 60 * 1000;

      service.cleanupOldAlerts(1 * 60 * 60 * 1000); // 1 hour max age

      expect(service.getAlert(alert.id)).toBeNull();
    });

    it('deve manter alertas ativos (não resolvidos)', async () => {
      const metrics = {
        cpu: { usage: 85 },
        memory: { usagePercent: 50 },
        disk: { usagePercent: 50 },
        goldenSignals: { errors: { errorRate: 0 }, latency: { p95: 100 } },
        nodejs: { eventLoopLag: 5 },
        infrastructure: [],
      };

      await service.checkMetrics(metrics);
      const activeBefore = service.getActiveAlerts().length;

      service.cleanupOldAlerts(0); // Even with 0ms max age

      // Active alerts should remain
      expect(service.getActiveAlerts().length).toBe(activeBefore);
    });
  });
});
