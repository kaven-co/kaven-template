/**
 * XSS (Cross-Site Scripting) Security Tests
 * 
 * Valida que inputs maliciosos (scripts) são sanitizados ou rejeitados.
 * Utiliza o helper testXSS para validar múltiplos payloads.
 * 
 * STORY-001: Security Test Suite
 * Priority: P0 (Critical)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateAccessToken } from '../../src/lib/jwt';
import { createTenantIsolationTestData, cleanupSecurityTestData } from './fixtures/security.fixtures';
import { testXSS } from './helpers/security.helpers';

describe('XSS Security Tests', () => {
  let fixtures: Awaited<ReturnType<typeof createTenantIsolationTestData>>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();
    fixtures = await createTenantIsolationTestData(prisma, 'xss');
    
    // Usar User A (Tenant Admin)
    const user = fixtures.tenantA.user;
    userId = user.id;
    
    accessToken = await generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined
    });
  });

  afterAll(async () => {
    await cleanupSecurityTestData(prisma, 'xss');
    await app.close();
  });

  describe('Stored XSS (Persistent)', () => {
    it('XSS: Deve sanitizar campos de texto em updates', async () => {
      await testXSS(
        `/api/users/${userId}`,
        { name: 'Updated Name' }, // Dados base
        'name', // Campo para injetar payload
        async (endpoint, data) => {
          return app.inject({
            method: 'PUT',
            url: endpoint,
            body: data,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
        }
      );
    });
  });

  describe('Reflected XSS', () => {
      it('XSS: Search param refletido deve ser sanitizado', async () => {
          // Teste direto de reflection (menos comum em APIS JSON, mas validamos o retorno)
          const payload = '<script>alert(1)</script>';
          
          const response = await app.inject({
            method: 'GET',
            url: '/api/users',
            query: {
                search: payload
            },
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          expect(response.statusCode).toBe(200);
          const bodyString = response.body;
          expect(bodyString).not.toContain('<script>');
      });
  });
});
