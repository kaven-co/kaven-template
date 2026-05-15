import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestTenant, createTestUser, cleanupTestData } from '../fixtures/test-data.fixtures';
import { grantConsent, revokeConsent, listConsents } from '../helpers/gdpr.helpers';
import { CONSENT_PURPOSES } from '../../src/modules/users/services/lgpd.service';

describe('LGPD Art. 18, I — Consent Management', () => {
  let tenant: any;
  let user: any;

  beforeEach(async () => {
    tenant = await createTestTenant('Consent Test Tenant');
    user = await createTestUser({
      tenantId: tenant.id,
      email: `consent-${Date.now()}@test.com`,
      name: 'Consent Test User',
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('grant consent', () => {
    it('should register consent and return 201', async () => {
      const { status, body } = await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      expect(status).toBe(201);
      expect(body.consent).toMatchObject({ purpose: 'analytics', version: '2026-01' });
      expect(body.consent.revokedAt).toBeNull();
    });

    it('should be idempotent — re-granting same active consent updates ip/agent only', async () => {
      await grantConsent(user.id, user.accessToken, 'marketing', '2026-01');
      const { status } = await grantConsent(user.id, user.accessToken, 'marketing', '2026-01');
      expect(status).toBe(201);

      const { body } = await listConsents(user.id, user.accessToken);
      const records = body.consents.filter((c: any) => c.purpose === 'marketing');
      expect(records).toHaveLength(1);
    });

    it('should reject invalid purpose with 400 and allowedPurposes list', async () => {
      const { status, body } = await grantConsent(user.id, user.accessToken, 'invalid_xyz', '2026-01');
      expect(status).toBe(400);
      expect(body.error).toBe('INVALID_CONSENT_PURPOSE');
      expect(body.allowedPurposes).toEqual(expect.arrayContaining([...CONSENT_PURPOSES]));
    });

    it('should reject re-grant of previously revoked consent (same version) with 409', async () => {
      await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      await revokeConsent(user.id, user.accessToken, 'analytics');

      const { status, body } = await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      expect(status).toBe(409);
      expect(body.error).toBe('CONSENT_PREVIOUSLY_REVOKED');
    });

    it('should allow re-grant of revoked consent with a new version', async () => {
      await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      await revokeConsent(user.id, user.accessToken, 'analytics');

      const { status } = await grantConsent(user.id, user.accessToken, 'analytics', '2026-02');
      expect(status).toBe(201);
    });

    it('should reject missing purpose or version with 400', async () => {
      const res1 = await grantConsent(user.id, user.accessToken, '', '2026-01');
      expect(res1.status).toBe(400);

      const res2 = await grantConsent(user.id, user.accessToken, 'analytics', '');
      expect(res2.status).toBe(400);
    });
  });

  describe('revoke consent', () => {
    it('should revoke active consents for a purpose and return count', async () => {
      await grantConsent(user.id, user.accessToken, 'marketing', '2026-01');

      const { status, body } = await revokeConsent(user.id, user.accessToken, 'marketing');
      expect(status).toBe(200);
      expect(body.revoked).toBe(1);
    });

    it('should return revoked: 0 when no active consents exist for purpose', async () => {
      const { status, body } = await revokeConsent(user.id, user.accessToken, 'marketing');
      expect(status).toBe(200);
      expect(body.revoked).toBe(0);
    });
  });

  describe('list consents', () => {
    it('should list all consents for the user ordered by consentedAt desc', async () => {
      await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      await grantConsent(user.id, user.accessToken, 'marketing', '2026-01');

      const { status, body } = await listConsents(user.id, user.accessToken);
      expect(status).toBe(200);
      expect(body.consents.length).toBeGreaterThanOrEqual(2);
      expect(body.consents[0]).toHaveProperty('purpose');
      expect(body.consents[0]).toHaveProperty('version');
      expect(body.consents[0]).toHaveProperty('consentedAt');
      expect(body.consents[0]).toHaveProperty('revokedAt');
    });

    it('should reflect revoked status after revocation', async () => {
      await grantConsent(user.id, user.accessToken, 'analytics', '2026-01');
      await revokeConsent(user.id, user.accessToken, 'analytics');

      const { body } = await listConsents(user.id, user.accessToken);
      const record = body.consents.find((c: any) => c.purpose === 'analytics');
      expect(record.revokedAt).not.toBeNull();
    });
  });

  describe('IDOR protection', () => {
    it('should return 403 when user A accesses user B consents', async () => {
      const userB = await createTestUser({
        tenantId: tenant.id,
        email: `consent-b-${Date.now()}@test.com`,
        name: 'User B',
      });

      const { status } = await listConsents(userB.id, user.accessToken);
      expect(status).toBe(403);
    });
  });
});
