import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BusinessMetricsService } from './business-metrics.service';

const metricsMock = vi.hoisted(() => ({
  userRegistrations: { inc: vi.fn() },
  loginAttempts: { inc: vi.fn() },
  activeUsers: { set: vi.fn() },
  paymentCounter: { inc: vi.fn() },
  paymentAmount: { observe: vi.fn() },
  apiUsageCounter: { inc: vi.fn() },
  emailSentTotal: { inc: vi.fn() },
  emailBouncedTotal: { inc: vi.fn() },
  emailComplaintsTotal: { inc: vi.fn() },
  emailDeliveryDuration: { observe: vi.fn() },
}));

vi.mock('../../../lib/metrics', () => metricsMock);

describe('BusinessMetricsService', () => {
  let service: BusinessMetricsService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    service = new BusinessMetricsService();
  });

  // ─── trackUserRegistration ────────────────────────────────────────────────

  describe('trackUserRegistration', () => {
    it('should track email registration by default', () => {
      service.trackUserRegistration('user-1');

      expect(metricsMock.userRegistrations.inc).toHaveBeenCalledWith({ method: 'email' });
    });

    it('should track google registration', () => {
      service.trackUserRegistration('user-1', 'google');

      expect(metricsMock.userRegistrations.inc).toHaveBeenCalledWith({ method: 'google' });
    });

    it('should track github registration', () => {
      service.trackUserRegistration('user-1', 'github');

      expect(metricsMock.userRegistrations.inc).toHaveBeenCalledWith({ method: 'github' });
    });
  });

  // ─── trackLogin ───────────────────────────────────────────────────────────

  describe('trackLogin', () => {
    it('should track successful login', () => {
      service.trackLogin(true, 'email');

      expect(metricsMock.loginAttempts.inc).toHaveBeenCalledWith({
        status: 'success',
        method: 'email',
      });
    });

    it('should track failed login', () => {
      service.trackLogin(false, 'google');

      expect(metricsMock.loginAttempts.inc).toHaveBeenCalledWith({
        status: 'failure',
        method: 'google',
      });
    });

    it('should default method to email', () => {
      service.trackLogin(true);

      expect(metricsMock.loginAttempts.inc).toHaveBeenCalledWith({
        status: 'success',
        method: 'email',
      });
    });
  });

  // ─── trackPayment ─────────────────────────────────────────────────────────

  describe('trackPayment', () => {
    it('should track successful payment with amount', () => {
      service.trackPayment(100, 'USD', 'success', 'stripe');

      expect(metricsMock.paymentCounter.inc).toHaveBeenCalledWith({
        currency: 'USD',
        status: 'success',
        provider: 'stripe',
      });
      expect(metricsMock.paymentAmount.observe).toHaveBeenCalledWith(
        { currency: 'USD', provider: 'stripe' },
        100,
      );
    });

    it('should track failed payment without observing amount', () => {
      service.trackPayment(50, 'BRL', 'failed', 'pagubit');

      expect(metricsMock.paymentCounter.inc).toHaveBeenCalledWith({
        currency: 'BRL',
        status: 'failed',
        provider: 'pagubit',
      });
      expect(metricsMock.paymentAmount.observe).not.toHaveBeenCalled();
    });

    it('should handle different currency values', () => {
      service.trackPayment(999.99, 'EUR', 'success', 'paddle');

      expect(metricsMock.paymentAmount.observe).toHaveBeenCalledWith(
        { currency: 'EUR', provider: 'paddle' },
        999.99,
      );
    });
  });

  // ─── trackAPIUsage ────────────────────────────────────────────────────────

  describe('trackAPIUsage', () => {
    it('should track API usage with tenantId', () => {
      service.trackAPIUsage('/api/users', 'tenant-1');

      expect(metricsMock.apiUsageCounter.inc).toHaveBeenCalledWith({
        endpoint: '/api/users',
        tenant: 'tenant-1',
      });
    });

    it('should default tenant to unknown when not provided', () => {
      service.trackAPIUsage('/api/health');

      expect(metricsMock.apiUsageCounter.inc).toHaveBeenCalledWith({
        endpoint: '/api/health',
        tenant: 'unknown',
      });
    });
  });

  // ─── setActiveUsers ───────────────────────────────────────────────────────

  describe('setActiveUsers', () => {
    it('should set active users gauge', () => {
      service.setActiveUsers(50);

      expect(metricsMock.activeUsers.set).toHaveBeenCalledWith(50);
    });

    it('should handle zero active users', () => {
      service.setActiveUsers(0);

      expect(metricsMock.activeUsers.set).toHaveBeenCalledWith(0);
    });
  });

  // ─── trackEmailSent ───────────────────────────────────────────────────────

  describe('trackEmailSent', () => {
    it('should track email sent metrics', () => {
      service.trackEmailSent('ses', 'welcome', 'transactional');

      expect(metricsMock.emailSentTotal.inc).toHaveBeenCalledWith({
        provider: 'ses',
        template: 'welcome',
        type: 'transactional',
      });
    });

    it('should track different email providers', () => {
      service.trackEmailSent('sendgrid', 'reset-password', 'transactional');

      expect(metricsMock.emailSentTotal.inc).toHaveBeenCalledWith({
        provider: 'sendgrid',
        template: 'reset-password',
        type: 'transactional',
      });
    });
  });

  // ─── trackEmailBounce ─────────────────────────────────────────────────────

  describe('trackEmailBounce', () => {
    it('should track email bounce', () => {
      service.trackEmailBounce('ses', 'hard');

      expect(metricsMock.emailBouncedTotal.inc).toHaveBeenCalledWith({
        provider: 'ses',
        type: 'hard',
      });
    });

    it('should track soft bounce', () => {
      service.trackEmailBounce('ses', 'soft');

      expect(metricsMock.emailBouncedTotal.inc).toHaveBeenCalledWith({
        provider: 'ses',
        type: 'soft',
      });
    });
  });

  // ─── trackEmailComplaint ──────────────────────────────────────────────────

  describe('trackEmailComplaint', () => {
    it('should track email spam complaint', () => {
      service.trackEmailComplaint('ses');

      expect(metricsMock.emailComplaintsTotal.inc).toHaveBeenCalledWith({
        provider: 'ses',
      });
    });
  });

  // ─── trackEmailDeliveryDuration ───────────────────────────────────────────

  describe('trackEmailDeliveryDuration', () => {
    it('should track email delivery duration', () => {
      service.trackEmailDeliveryDuration('ses', 2.5);

      expect(metricsMock.emailDeliveryDuration.observe).toHaveBeenCalledWith(
        { provider: 'ses' },
        2.5,
      );
    });

    it('should handle sub-second durations', () => {
      service.trackEmailDeliveryDuration('sendgrid', 0.15);

      expect(metricsMock.emailDeliveryDuration.observe).toHaveBeenCalledWith(
        { provider: 'sendgrid' },
        0.15,
      );
    });
  });
});
