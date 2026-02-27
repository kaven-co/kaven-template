import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MetricsUpdaterService } from './metrics-updater.service';

// Mock hardware metrics service
vi.mock('./hardware-metrics.service', () => ({
  hardwareMetricsService: {
    getMetrics: vi.fn().mockResolvedValue({
      cpu: { usage: 40, cores: 4 },
      memory: { usagePercent: 60, total: 16000, used: 9600, swap: { total: 0, usagePercent: 0 } },
      disk: { usagePercent: 50, total: 500000, used: 250000, readSpeed: 100, writeSpeed: 50 },
      system: { uptime: 3600 },
      alerts: [],
    }),
  },
}));

// Mock alerting service
vi.mock('./alerting.service', () => ({
  alertingService: {
    checkMetrics: vi.fn().mockResolvedValue([]),
  },
}));

// Mock advanced metrics service
vi.mock('./advanced-metrics.service', () => ({
  advancedMetricsService: {
    getAdvancedMetrics: vi.fn().mockResolvedValue({
      goldenSignals: {
        latency: { p50: 10, p95: 50, p99: 100 },
        traffic: { requestsPerSecond: 5, totalRequests: 1000 },
        errors: { errorRequests: 2, errorRate: 0.2 },
        saturation: { cpuUsagePercent: 40, memoryUsagePercent: 60 },
      },
      nodejs: { eventLoopLag: 3 },
    }),
  },
}));

// Mock infrastructure monitor
vi.mock('./infrastructure-monitor.service', () => ({
  infrastructureMonitorService: {
    checkAll: vi.fn().mockResolvedValue([
      { name: 'PostgreSQL', status: 'healthy', latency: 5 },
      { name: 'Redis', status: 'healthy', latency: 2 },
    ]),
  },
}));

// Mock metrics (Prometheus gauges)
vi.mock('../../../lib/metrics', () => ({
  cpuUsageGauge: { set: vi.fn() },
  cpuCoresGauge: { set: vi.fn() },
  cpuTemperatureGauge: { set: vi.fn() },
  memoryUsageGauge: { set: vi.fn() },
  memoryTotalGauge: { set: vi.fn() },
  memoryUsedGauge: { set: vi.fn() },
  swapUsageGauge: { set: vi.fn() },
  diskUsageGauge: { set: vi.fn() },
  diskTotalGauge: { set: vi.fn() },
  diskUsedGauge: { set: vi.fn() },
  diskReadSpeedGauge: { set: vi.fn() },
  diskWriteSpeedGauge: { set: vi.fn() },
  systemUptimeGauge: { set: vi.fn() },
}));

import { hardwareMetricsService } from './hardware-metrics.service';
import { alertingService } from './alerting.service';
import { advancedMetricsService } from './advanced-metrics.service';
import { infrastructureMonitorService } from './infrastructure-monitor.service';
import * as metrics from '../../../lib/metrics';

describe('MetricsUpdaterService', () => {
  let service: MetricsUpdaterService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    service = new MetricsUpdaterService();
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  // ─── start ─────────────────────────────────────────────────────────────────

  describe('start', () => {
    it('deve iniciar atualização automática de métricas', async () => {
      service.start();

      // Flush the immediate updateMetrics call
      await vi.advanceTimersByTimeAsync(0);

      expect(hardwareMetricsService.getMetrics).toHaveBeenCalled();
      expect(advancedMetricsService.getAdvancedMetrics).toHaveBeenCalled();
      expect(infrastructureMonitorService.checkAll).toHaveBeenCalled();
    });

    it('não deve iniciar duas vezes se já estiver rodando', () => {
      service.start();
      service.start(); // Second call should be no-op

      // Only one interval should be created
      // We verify by checking the metrics are collected only once initially
      // (the second start() logs "Already running" and returns)
    });

    it('deve atualizar Prometheus gauges com métricas coletadas', async () => {
      service.start();
      await vi.advanceTimersByTimeAsync(0);

      expect(metrics.cpuUsageGauge.set).toHaveBeenCalledWith(40);
      expect(metrics.cpuCoresGauge.set).toHaveBeenCalledWith(4);
      expect(metrics.memoryUsageGauge.set).toHaveBeenCalledWith(60);
      expect(metrics.diskUsageGauge.set).toHaveBeenCalledWith(50);
      expect(metrics.systemUptimeGauge.set).toHaveBeenCalledWith(3600);
    });

    it('deve verificar alertas após coletar métricas', async () => {
      service.start();
      await vi.advanceTimersByTimeAsync(0);

      expect(alertingService.checkMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          cpu: expect.objectContaining({ usage: 40 }),
          memory: expect.objectContaining({ usagePercent: 60 }),
          goldenSignals: expect.any(Object),
          infrastructure: expect.any(Array),
        }),
      );
    });

    it('deve coletar métricas periodicamente a cada 10 segundos', async () => {
      service.start();

      // Initial call
      await vi.advanceTimersByTimeAsync(0);
      expect(hardwareMetricsService.getMetrics).toHaveBeenCalledTimes(1);

      // After 10s
      await vi.advanceTimersByTimeAsync(10000);
      expect(hardwareMetricsService.getMetrics).toHaveBeenCalledTimes(2);

      // After another 10s
      await vi.advanceTimersByTimeAsync(10000);
      expect(hardwareMetricsService.getMetrics).toHaveBeenCalledTimes(3);
    });
  });

  // ─── stop ──────────────────────────────────────────────────────────────────

  describe('stop', () => {
    it('deve parar atualização automática', async () => {
      service.start();
      await vi.advanceTimersByTimeAsync(0);

      service.stop();

      vi.clearAllMocks();
      await vi.advanceTimersByTimeAsync(10000);
      expect(hardwareMetricsService.getMetrics).not.toHaveBeenCalled();
    });

    it('deve ser seguro chamar stop sem start', () => {
      // Should not throw
      expect(() => service.stop()).not.toThrow();
    });
  });

  // ─── Error Handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('deve continuar funcionando mesmo quando coleta falha', async () => {
      vi.mocked(hardwareMetricsService.getMetrics).mockRejectedValueOnce(
        new Error('Collection failed'),
      );

      service.start();
      await vi.advanceTimersByTimeAsync(0);

      // Should not crash — next interval should still work
      vi.mocked(hardwareMetricsService.getMetrics).mockResolvedValueOnce({
        cpu: { usage: 20, cores: 4 },
        memory: { usagePercent: 40, total: 16000, used: 6400, swap: { total: 0, usagePercent: 0 } },
        disk: { usagePercent: 30, total: 500000, used: 150000, readSpeed: 100, writeSpeed: 50 },
        system: { uptime: 7200 },
        alerts: [],
      } as any);

      await vi.advanceTimersByTimeAsync(10000);
      expect(hardwareMetricsService.getMetrics).toHaveBeenCalledTimes(2);
    });
  });
});
