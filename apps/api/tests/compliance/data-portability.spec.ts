import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestTenant, createTestUser, cleanupTestData } from '../fixtures/test-data.fixtures';
import { exportData, grantConsent } from '../helpers/gdpr.helpers';

describe('LGPD Art. 18, V — Data Portability', () => {
  let tenant: any;
  let user: any;

  beforeEach(async () => {
    tenant = await createTestTenant('Portability Test Tenant');
    user = await createTestUser({
      tenantId: tenant.id,
      email: `portability-${Date.now()}@test.com`,
      name: 'Portability Test User',
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('export completeness', () => {
    it('should include consent records in export', async () => {
      await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      await grantConsent(user.id, user.accessToken, 'marketing', '2026-01');

      const { body } = await exportData(user.id, user.accessToken);
      expect(body.consents.length).toBeGreaterThanOrEqual(2);
      expect(body.consents[0]).toHaveProperty('purpose');
      expect(body.consents[0]).toHaveProperty('version');
      expect(body.consents[0]).toHaveProperty('consentedAt');
    });

    it('should include audit log entries (capped at 100)', async () => {
      const { body } = await exportData(user.id, user.accessToken);
      expect(Array.isArray(body.auditLogs)).toBe(true);
      expect(body.auditLogs.length).toBeLessThanOrEqual(100);
    });

    it('should include previous export history (capped at 20)', async () => {
      const { body } = await exportData(user.id, user.accessToken);
      expect(Array.isArray(body.previousExports)).toBe(true);
      expect(body.previousExports.length).toBeLessThanOrEqual(20);
    });

    it('should be machine-readable JSON (exportedAt ISO string, version field)', async () => {
      const { body } = await exportData(user.id, user.accessToken);
      expect(body.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(body.version).toBe('1.0');
    });
  });

  describe('repeated exports', () => {
    it('should allow multiple exports and log each one', async () => {
      const prisma = (await import('../../src/lib/prisma')).default;

      await exportData(user.id, user.accessToken);
      await exportData(user.id, user.accessToken);

      const count = await prisma.dataExportLog.count({ where: { userId: user.id } });
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
