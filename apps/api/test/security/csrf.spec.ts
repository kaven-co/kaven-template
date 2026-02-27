/**
 * CSRF (Cross-Site Request Forgery) Security Tests
 * 
 * Valida que requisições de mutação (POST, PUT, DELETE) verificam a origem.
 * Utiliza o helper testCSRF para padronização.
 * 
 * STORY-001: Security Test Suite
 * Priority: P0 (Critical)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/app';
import { testCSRF } from './helpers/security.helpers';

describe('CSRF Security Tests', () => {
  beforeAll(async () => {
    // Adicionar rota segura para teste antes de iniciar
    app.get('/test-safe-method', async () => ({ status: 'ok' }));
    
    // Rota dummy para POST
    app.post('/test-csrf-post', async (req, reply) => {
       return { success: true };
    });

    // Inicializar o app (middlewares, rotas, db)
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Standard CSRF Protection', () => {
    it('CSRF: Deve validar Origin/Referer corretamente usando helper padronizado', async () => {
      await testCSRF(
        'POST',
        '/test-csrf-post', // Rota dummy para teste isolado de CSRF
        {},
        async (method, endpoint, data, headers) => {
          return app.inject({
             method: method as any,
             url: endpoint,
             payload: data as any,
             headers: headers
          });
        }
      );
    });
  });

  describe('Method Exceptions', () => {
    it('CSRF: Deve permitir GET mesmo com Origin desconhecida (Safe Method)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/test-safe-method',
        headers: {
            'Origin': 'http://random-site.com'
        }
      });

      expect(response.statusCode).toBe(200);
    });
    
    it('CSRF: Deve permitir HEAD mesmo com Origin desconhecida', async () => {
      const response = await app.inject({
        method: 'HEAD',
        url: '/test-safe-method',
         headers: {
            'Origin': 'http://random-site.com'
        }
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Server-to-Server / Mobile App Exceptions', () => {
    it('CSRF: Deve permitir request SEM Origin e SEM Referer (App Nativo/Server)', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/logout'
        });

        expect(response.statusCode).not.toBe(403);
    });
  });

  describe('Route Exceptions', () => {
      it('CSRF: Deve ignorar Webhooks', async () => {
          const response = await app.inject({
              method: 'POST',
              url: '/api/webhooks/stripe',
              headers: {
                  'Origin': 'https://stripe.com'
              }
          });
          
          expect(response.statusCode).not.toBe(403);
      });
  });
});
