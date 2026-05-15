import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestTenant, createTestUser, cleanupTestData } from '../fixtures/test-data.fixtures';
import { exportData } from '../helpers/gdpr.helpers';

describe('LGPD Art. 18, V — Right to Access (Data Export)', () => {
  let tenantA: any;
  let tenantB: any;
  let userA: any;
  let userB: any;

  beforeEach(async () => {
    tenantA = await createTestTenant('Tenant A LGPD Export');
    tenantB = await createTestTenant('Tenant B LGPD Export');

    userA = await createTestUser({
      tenantId: tenantA.id,
      email: `export-a-${Date.now()}@test.com`,
      name: 'User A Export',
    });
    userB = await createTestUser({
      tenantId: tenantB.id,
      email: `export-b-${Date.now()}@test.com`,
      name: 'User B Export',
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('data export structure', () => {
    it('should return 200 with export payload', async () => {
      const { status, body } = await exportData(userA.id, userA.accessToken);
      expect(status).toBe(200);
      expect(body).toHaveProperty('exportedAt');
      expect(body).toHaveProperty('version', '1.0');
    });

    it('should include user profile fields', async () => {
      const { body } = await exportData(userA.id, userA.accessToken);
      expect(body.user).toMatchObject({
        id: userA.id,
        email: userA.email,
        name: userA.name,
      });
    });

    it('should NOT include sensitive fields (password, twoFactorSecret)', async () => {
      const { body } = await exportData(userA.id, userA.accessToken);
      expect(body.user).not.toHaveProperty('password');
      expect(body.user).not.toHaveProperty('twoFactorSecret');
      expect(body.user).not.toHaveProperty('backupCodes');
    });

    it('should include consents and auditLogs arrays', async () => {
      const { body } = await exportData(userA.id, userA.accessToken);
      expect(Array.isArray(body.consents)).toBe(true);
      expect(Array.isArray(body.auditLogs)).toBe(true);
      expect(Array.isArray(body.previousExports)).toBe(true);
    });

    it('should set Content-Disposition header for file download', async () => {
      const res = await (await import('../../src/app')).app.inject({
        method: 'GET',
        url: `/api/users/${userA.id}/export`,
        headers: { Authorization: `Bearer ${userA.accessToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-disposition']).toContain(`user-data-${userA.id}.json`);
    });
  });

  describe('audit trail', () => {
    it('should create a DataExportLog entry on each export (LGPD Art. 37)', async () => {
      const { app: fastify } = await import('../../src/app');
      const prismaLib = await import('../../src/lib/prisma');
      const prisma = prismaLib.default;

      const before = await prisma.dataExportLog.count({ where: { userId: userA.id } });
      await exportData(userA.id, userA.accessToken);
      const after = await prisma.dataExportLog.count({ where: { userId: userA.id } });

      expect(after).toBe(before + 1);
    });
  });

  describe('IDOR protection', () => {
    it('should return 403 when user A tries to export user B data (cross-tenant)', async () => {
      const { status } = await exportData(userB.id, userA.accessToken);
      expect(status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const { status } = await exportData('non-existent-id', userA.accessToken);
      // requireResourceOwnership or USER_NOT_FOUND
      expect([403, 404]).toContain(status);
    });
  });
});
