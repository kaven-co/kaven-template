import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestTenant, createTestUser, cleanupTestDataByTenant } from '../fixtures/test-data.fixtures';
import { requestErasure } from '../helpers/gdpr.helpers';
import prisma from '../../src/lib/prisma';

describe('LGPD Art. 18, VI — Right to Erasure', () => {
  let tenant: any;
  let user: any;

  beforeEach(async () => {
    tenant = await createTestTenant('Erasure Test Tenant');
    user = await createTestUser({
      tenantId: tenant.id,
      email: `erasure-${Date.now()}@test.com`,
      name: 'Erasure Test User',
    });
  });

  afterEach(async () => {
    await cleanupTestDataByTenant(prisma, tenant.id);
  });

  describe('erasure request registration', () => {
    it('should accept erasure request and return 202 with jobId', async () => {
      const { status, body } = await requestErasure(user.id, user.accessToken);
      expect(status).toBe(202);
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('jobId');
      expect(body.jobId).toMatch(/^gdpr-erase-/);
    });

    it('should set gdprDeleteRequestedAt on the user record', async () => {
      await requestErasure(user.id, user.accessToken);

      const updated = await prisma.user.findUnique({
        where: { id: user.id },
        select: { gdprDeleteRequestedAt: true },
      });
      expect(updated?.gdprDeleteRequestedAt).not.toBeNull();
    });

    it('should return 409 if erasure already requested', async () => {
      await requestErasure(user.id, user.accessToken);

      const { status, body } = await requestErasure(user.id, user.accessToken);
      expect(status).toBe(409);
      expect(body.error).toBe('ERASURE_ALREADY_REQUESTED');
    });

    it('should create an audit log entry for the erasure request', async () => {
      await requestErasure(user.id, user.accessToken);

      const log = await prisma.auditLog.findFirst({
        where: { userId: user.id, action: 'GDPR_ERASE_REQUESTED' },
      });
      expect(log).not.toBeNull();
    });
  });

  describe('IDOR protection', () => {
    it('should return 403 when user A requests erasure of user B', async () => {
      const userB = await createTestUser({
        tenantId: tenant.id,
        email: `erasure-b-${Date.now()}@test.com`,
        name: 'User B',
      });

      const { status } = await requestErasure(userB.id, user.accessToken);
      expect(status).toBe(403);
    });
  });
});
