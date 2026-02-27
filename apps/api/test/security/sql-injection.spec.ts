/**
 * SQL Injection Security Tests
 * 
 * Valida que inputs da API (query params, body) são devidamente sanitizados
 * e protegidos contra injeção de SQL.
 * Utiliza o helper testSQLInjection para padronização.
 * 
 * STORY-001: Security Test Suite
 * Priority: P0 (Critical)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateAccessToken } from '../../src/lib/jwt';
import { createTenantIsolationTestData, cleanupSecurityTestData } from './fixtures/security.fixtures';
import { testSQLInjection, SECURITY_PAYLOADS } from '../security/helpers/security.helpers'; // Importação corrigida

describe('SQL Injection Security Tests', () => {
  let fixtures: Awaited<ReturnType<typeof createTenantIsolationTestData>>;
  let accessToken: string;

  beforeAll(async () => {
    await app.ready();
    fixtures = await createTenantIsolationTestData(prisma, 'sqli');
    const user = fixtures.tenantA.user;
    accessToken = await generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined
    });
  });

  afterAll(async () => {
    await cleanupSecurityTestData(prisma, 'sqli');
    await app.close();
  });

  describe('Query Parameter Injection', () => {
    it('SQLI: Deve estar protegido contra múltiplas variantes de injection no parametro "search"', async () => {
      // Testar uma lista de payloads clássicos
      const payloads = SECURITY_PAYLOADS.SQL_INJECTION;

      for (const payload of payloads) {
        await testSQLInjection(
          '/api/users',
          'search',
          payload,
          async (endpoint, param, value) => {
            return app.inject({
              method: 'GET',
              url: endpoint,
              query: {
                [param]: value
              },
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
          }
        );
      }
    });

    it('SQLI: Injection no parametro Status não deve causar erro 500', async () => {
       const payload = "ACTIVE' UNION SELECT * FROM users --";
       
       const response = await app.inject({
        method: 'GET',
        url: '/api/users',
        query: {
          status: payload
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      expect(response.statusCode).not.toBe(500);
    });
  });
});
