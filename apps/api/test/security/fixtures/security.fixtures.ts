/**
 * Security Test Fixtures
 * 
 * Setup de dados para testes de isolamento multi-tenant e segurança.
 * Cria tenants, users e resources isolados para validar IDOR protection.
 */

import type { PrismaClient, Tenant, User } from '@prisma/client';

/**
 * Dados de teste para isolamento de tenants
 */
export interface SecurityTestData {
  tenantA: {
    tenant: Tenant;
    user: User;
    // Adicionar outros resources conforme necessário
  };
  tenantB: {
    tenant: Tenant;
    user: User;
    // Adicionar outros resources conforme necessário
  };
}

/**
 * Cria dados de teste para validação de isolamento multi-tenant
 * 
 * Cria 2 tenants (A e B) com users e resources isolados.
 * Usado para testar que User de Tenant A não acessa recursos de Tenant B.
 * 
 * @param prisma - PrismaClient instance
 * @returns SecurityTestData com tenants, users e resources
 * 
 * @example
 * const testData = await createTenantIsolationTestData(prisma);
 * 
 * // Tentar acessar recurso de Tenant B com User de Tenant A
 * const response = await fetch(`/api/grants/${testData.tenantB.grant.id}`, {
 *   headers: { 'X-User-Id': testData.tenantA.user.id }
 * });
 * 
 * expect(response.status).toBe(403); // Forbidden
 */
export async function createTenantIsolationTestData(
  prisma: PrismaClient,
  suffix: string = ''
): Promise<SecurityTestData> {
  const uniqueSuffix = suffix ? `-${suffix}` : '';
  const timestamp = Date.now();

  // Tenant A
  const tenantA = await prisma.tenant.create({
    data: {
      name: `Security Test Tenant A${uniqueSuffix}`,
      slug: `test-tenant-a${uniqueSuffix}-${timestamp}`
    }
  });
  
  const userA = await prisma.user.create({
    data: {
      email: `user-a${uniqueSuffix}-${timestamp}@test.com`,
      name: 'User A',
      password: 'hashed-password-placeholder',
      tenantId: tenantA.id,
      role: 'TENANT_ADMIN'
    }
  });
  
  // Tenant B
  const tenantB = await prisma.tenant.create({
    data: {
      name: `Security Test Tenant B${uniqueSuffix}`,
      slug: `test-tenant-b${uniqueSuffix}-${timestamp}`
    }
  });
  
  const userB = await prisma.user.create({
    data: {
      email: `user-b${uniqueSuffix}-${timestamp}@test.com`,
      name: 'User B',
      password: 'hashed-password-placeholder',
      tenantId: tenantB.id,
      role: 'TENANT_ADMIN'
    }
  });
  
  return {
    tenantA: {
      tenant: tenantA,
      user: userA
    },
    tenantB: {
      tenant: tenantB,
      user: userB
    }
  };
}

/**
 * Cleanup de dados de teste de segurança
 * 
 * @param prisma - PrismaClient instance
 * @param suffix - Sufixo único usado na criação (opcional)
 */
export async function cleanupSecurityTestData(
  prisma: PrismaClient, 
  suffix: string = ''
): Promise<void> {
  const uniqueSuffix = suffix ? `-${suffix}` : '';

  try {
    // 1. Deletar Tenants (deve propagar cascade para Users)
    await prisma.tenant.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: `test-tenant-a${uniqueSuffix}-` } },
          { slug: { startsWith: `test-tenant-b${uniqueSuffix}-` } }
        ]
      }
    });

    // 2. Deletar Users remanescentes
    const emailFilter = suffix 
      ? { contains: `-${suffix}-` } // Ex: user-a-idor-123...
      : { contains: '@test.com' }; 

    await prisma.user.deleteMany({
      where: {
        email: emailFilter
      }
    });
  } catch (error) {
    console.warn('Warning: Failed to cleanup security test data:', error);
  }
}

/**
 * Cria resource específico para Tenant (helper genérico)
 * 
 * @param prisma - PrismaClient instance
 * @param model - Nome do model (ex: 'grant', 'invoice')
 * @param tenantId - ID do tenant
 * @param data - Dados adicionais do resource
 * @returns Resource criado
 */
export async function createTenantResource<T>(
  prisma: PrismaClient,
  model: string,
  tenantId: string,
  data: Record<string, unknown>
): Promise<T> {
  // @ts-expect-error - Dynamic model access
  return await prisma[model].create({
    data: {
      ...data,
      tenantId
    }
  }) as T;
}

/**
 * Valida que resource tem tenantId correto
 * 
 * @param resource - Resource a ser validado
 * @param expectedTenantId - TenantId esperado
 * @throws Error se tenantId não corresponder
 */
export function validateTenantId(
  resource: { tenantId?: string | null },
  expectedTenantId: string
): void {
  if (!resource.tenantId) {
    throw new Error('Resource não tem tenantId (violação de multi-tenancy)');
  }
  
  if (resource.tenantId !== expectedTenantId) {
    throw new Error(
      `TenantId mismatch: esperado ${expectedTenantId}, recebido ${resource.tenantId}`
    );
  }
}

/**
 * Lista de models tenant-scoped (33 models conforme STORY-001)
 * 
 * Estes models DEVEM ter tenantId e DEVEM ser protegidos por RLS middleware.
 */
export const TENANT_SCOPED_MODELS = [
  // Permissions & Security (6 models)
  'grant',
  'grantRequest',
  'policy',
  'capability',
  'securityAuditLog',
  'impersonationSession',
  
  // Billing (4 models)
  'invoice',
  'order',
  'payment',
  'subscription',
  
  // Projects & Tasks (3 models)
  'project',
  'task',
  'space',
  
  // Users & Organizations (3 models)
  'user',
  'organization',
  'team',
  
  // Content & Files (4 models)
  'file',
  'folder',
  'document',
  'template',
  
  // Notifications & Messages (3 models)
  'notification',
  'message',
  'comment',
  
  // Integrations (3 models)
  'integration',
  'webhook',
  'apiKey',
  
  // Analytics & Logs (3 models)
  'analyticsEvent',
  'auditLog',
  'activityLog',
  
  // Custom Fields & Metadata (4 models)
  'customField',
  'customFieldValue',
  'tag',
  'category'
] as const;

/**
 * Top 15 models críticos (prioridade para IDOR tests)
 */
export const TOP_15_CRITICAL_MODELS = [
  'grant',
  'grantRequest',
  'policy',
  'capability',
  'securityAuditLog',
  'impersonationSession',
  'invoice',
  'payment',
  'subscription',
  'order',
  'user',
  'organization',
  'project',
  'task',
  'space'
] as const;

/**
 * Endpoints que exigem CSRF protection (POST/PUT/DELETE)
 */
export const CSRF_PROTECTED_ENDPOINTS = [
  // Permissions
  { method: 'POST', path: '/api/grants' },
  { method: 'PUT', path: '/api/grants/:id' },
  { method: 'DELETE', path: '/api/grants/:id' },
  
  // Billing
  { method: 'POST', path: '/api/invoices' },
  { method: 'PUT', path: '/api/invoices/:id' },
  { method: 'DELETE', path: '/api/invoices/:id' },
  
  // Users
  { method: 'POST', path: '/api/users' },
  { method: 'PUT', path: '/api/users/:id' },
  { method: 'DELETE', path: '/api/users/:id' },
  
  // Projects
  { method: 'POST', path: '/api/projects' },
  { method: 'PUT', path: '/api/projects/:id' },
  { method: 'DELETE', path: '/api/projects/:id' }
] as const;

/**
 * Query params vulneráveis a SQL Injection
 */
export const SQL_INJECTION_VULNERABLE_PARAMS = [
  { endpoint: '/api/users', param: 'search' },
  { endpoint: '/api/invoices', param: 'status' },
  { endpoint: '/api/products', param: 'sort' },
  { endpoint: '/api/projects', param: 'filter' },
  { endpoint: '/api/tasks', param: 'assignee' }
] as const;

/**
 * Campos vulneráveis a XSS
 */
export const XSS_VULNERABLE_FIELDS = [
  { endpoint: '/api/users', field: 'name' },
  { endpoint: '/api/invoices', field: 'description' },
  { endpoint: '/api/products', field: 'title' },
  { endpoint: '/api/projects', field: 'description' },
  { endpoint: '/api/comments', field: 'content' }
] as const;
