/**
 * Security Test Helpers
 * 
 * Funções reusáveis para testes de segurança (IDOR, CSRF, SQL Injection, XSS).
 * Estas helpers garantem consistência nos testes e reduzem duplicação de código.
 */

import { it, expect } from 'vitest';

/**
 * Testa IDOR (Insecure Direct Object Reference)
 * 
 * Valida que um usuário de Tenant A não pode acessar recursos de Tenant B.
 * 
 * @param model - Nome do model sendo testado (ex: 'Grant', 'Invoice')
 * @param endpoint - Endpoint da API (ex: '/api/grants')
 * @param tenantAUserId - ID do usuário de Tenant A
 * @param tenantBResourceId - ID do recurso de Tenant B
 * @param requestFn - Função que faz a request (deve retornar response)
 */
export async function testIDOR(
  model: string,
  endpoint: string,
  tenantAUserId: string,
  tenantBResourceId: string,
  requestFn: (endpoint: string, resourceId: string, userId: string) => Promise<{ statusCode: number; json: () => any }>
): Promise<void> {
  const response = await requestFn(endpoint, tenantBResourceId, tenantAUserId);
  
  if (response.statusCode === 500) {
      console.error('IDOR Test failed with 500:', response.json());
  }

  // Deve retornar 403 Forbidden ou 404 Not Found (Isolation)
  // Aceitamos 400 Bad Request se a validação falhar antes da auth (seguro)
  expect([403, 404, 400]).toContain(response.statusCode);
  
  if (response.statusCode === 403) {
      const body = response.json();
      expect(body.error).toMatch(/forbidden|access denied|unauthorized|não autorizado|permissão negada/i);
  }
}

/**
 * Testa CSRF (Cross-Site Request Forgery)
 * 
 * Valida que mutations (POST/PUT/DELETE) exigem CSRF token válido.
 * 
 * @param method - Método HTTP (POST, PUT, DELETE)
 * @param endpoint - Endpoint da API
 * @param data - Dados a serem enviados
 * @param requestFn - Função que faz a request
 */
export async function testCSRF(
  method: 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data: unknown,
  requestFn: (method: string, endpoint: string, data: unknown, headers?: Record<string, string>) => Promise<{ statusCode: number; json: () => any }>
): Promise<void> {
  // Test 1: Request com Origin permitido (Safe) -> 200/201/204
  // Assumindo que o ambiente de teste tem CORS_ORIGIN ou FRONTEND_URL configurado
  const validOrigin = 'http://localhost:3000'; // Exemplo padrão
  const responseSafeOrigin = await requestFn(method, endpoint, data, { 'Origin': validOrigin });
  expect([200, 201, 204]).toContain(responseSafeOrigin.statusCode);

  // Test 2: Request com Origin não permitido (Evil) -> 403 Forbidden
  const evilOrigin = 'http://evil-hacker.com';
  const responseEvilOrigin = await requestFn(method, endpoint, data, { 'Origin': evilOrigin });
  expect(responseEvilOrigin.statusCode).toBe(403);
  
  const bodyEvil = responseEvilOrigin.json();
  expect(bodyEvil.error).toMatch(/csrf|not allowed|origin|origem|não permitida/i);
  
  // Test 3: Request com Referer não permitido -> 403 Forbidden
  const responseEvilReferer = await requestFn(method, endpoint, data, { 'Referer': 'http://evil-hacker.com/page' });
  expect(responseEvilReferer.statusCode).toBe(403);
}

/**
 * Testa SQL Injection
 * 
 * Valida que queries com user input não executam SQL malicioso.
 * 
 * @param endpoint - Endpoint da API
 * @param queryParam - Nome do query param (ex: 'search', 'filter')
 * @param injectionPayload - Payload SQL malicioso
 * @param requestFn - Função que faz a request
 */
export async function testSQLInjection(
  endpoint: string,
  queryParam: string,
  injectionPayload: string,
  requestFn: (endpoint: string, param: string, value: string) => Promise<{ statusCode: number; json: () => any }>
): Promise<void> {
  const response = await requestFn(endpoint, queryParam, injectionPayload);
  
  // Deve retornar 400 Bad Request (input inválido, não executar SQL)
  // Ou 200 OK com resultado vazio (sem leak)
  expect(response.statusCode).not.toBe(500); 

  if (response.statusCode === 400) {
      const body = response.json();
      expect(body.error).toMatch(/invalid input|bad request|validation|inválido|requisição inválida/i);
  }
}

/**
 * Testa XSS (Cross-Site Scripting)
 * 
 * Valida que inputs com <script> tags são sanitizados.
 * 
 * @param endpoint - Endpoint da API
 * @param data - Dados com payload XSS
 * @param fieldName - Nome do campo com payload XSS
 * @param requestFn - Função que faz a request
 */
export async function testXSS(
  endpoint: string,
  data: Record<string, string>,
  fieldName: string,
  requestFn: (endpoint: string, data: Record<string, string>) => Promise<{ statusCode: number; json: () => any }>
): Promise<void> {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ];
  
  for (const payload of xssPayloads) {
    const testData = { ...data, [fieldName]: payload };
    const response = await requestFn(endpoint, testData);
    
    // Deve aceitar request (201) mas sanitizar output
    expect([200, 201]).toContain(response.statusCode);
    
    const body = response.json();
    const outputValue = body[fieldName];
    
    if (outputValue) {
        // Verificar que HTML foi escapado (não contém tags originais)
        expect(outputValue).not.toContain('<script>');
        expect(outputValue).not.toContain('<img');
        expect(outputValue).not.toContain('<svg');
        expect(outputValue).not.toContain('javascript:');
        expect(outputValue).not.toContain('<iframe');
    }
  }
}

/**
 * Payloads conhecidos para testes de segurança
 * Baseado em OWASP Top 10 e CVE database
 */
export const SECURITY_PAYLOADS = {
  SQL_INJECTION: [
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "' OR 1=1--",
    "1' AND '1'='1",
    "'; DELETE FROM users WHERE '1'='1",
    "1; UPDATE users SET admin=true--"
  ],
  
  XSS: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<keygen onfocus=alert("XSS") autofocus>'
  ],
  
  COMMAND_INJECTION: [
    '; ls -la',
    '| cat /etc/passwd',
    '`whoami`',
    '$(whoami)',
    '& ping -c 10 127.0.0.1 &'
  ],
  
  PATH_TRAVERSAL: [
    String.raw`../../../etc/passwd`,
    String.raw`..\..\..\windows\system32\config\sam`,
    '/etc/passwd',
    String.raw`C:\windows\system32\config\sam`
  ]
} as const;

/**
 * Helper para criar descrição de teste IDOR
 */
export function describeIDORTest(model: string): string {
  return `IDOR: User de Tenant A não pode acessar ${model} de Tenant B`;
}

/**
 * Helper para criar descrição de teste CSRF
 */
export function describeCSRFTest(method: string, endpoint: string): string {
  return `CSRF: ${method} ${endpoint} exige CSRF token válido`;
}

/**
 * Helper para criar descrição de teste SQL Injection
 */
export function describeSQLInjectionTest(endpoint: string, param: string): string {
  return `SQL Injection: ${endpoint}?${param}=<payload> não executa SQL malicioso`;
}

/**
 * Helper para criar descrição de teste XSS
 */
export function describeXSSTest(endpoint: string, field: string): string {
  return `XSS: ${endpoint} sanitiza campo ${field}`;
}

/**
 * Helper para criar recurso, testar IDOR e fazer cleanup
 * 
 * Pattern comum nos testes: criar recurso em Tenant B → testar acesso de Tenant A → deletar
 * Este helper encapsula esse pattern e garante cleanup mesmo se o teste falhar.
 * 
 * @param model - Nome do model sendo testado (ex: 'Order', 'File')
 * @param endpoint - Endpoint da API (ex: '/api/orders')
 * @param tenantAUserId - ID do usuário de Tenant A (que não deve ter acesso)
 * @param createResourceFn - Função que cria o recurso em Tenant B
 * @param deleteResourceFn - Função que deleta o recurso (cleanup)
 * @param requestFn - Função que faz a request HTTP
 * 
 * @example
 * await createAndTestIDOR(
 *   'Order',
 *   '/api/orders',
 *   userA.id,
 *   async () => prisma.order.create({ data: { tenantId: tenantB.id, ... } }),
 *   async (id) => prisma.order.delete({ where: { id } }),
 *   async (endpoint, resourceId) => app.inject({ method: 'GET', url: `${endpoint}/${resourceId}` })
 * );
 */
export async function createAndTestIDOR<T extends Record<string, any> & { id: string }>(
  model: string,
  endpoint: string,
  tenantAUserId: string,
  createResourceFn: () => Promise<T>,
  deleteResourceFn: (id: string) => Promise<void>,
  requestFn: (endpoint: string, resourceId: string, userId: string) => Promise<{ statusCode: number; json: () => any }>
): Promise<void> {
  const resource = await createResourceFn();
  
  try {
    await testIDOR(model, endpoint, tenantAUserId, resource.id, requestFn);
  } finally {
    // Garantir cleanup mesmo se teste falhar
    try {
      await deleteResourceFn(resource.id);
    } catch (error) {
      console.warn(`Warning: Failed to cleanup ${model} ${resource.id}:`, error);
    }
  }
}

/**
 * Wrapper genérico para garantir cleanup de recursos
 * 
 * Útil para qualquer teste que precise criar dados, testar e fazer cleanup.
 * Usa try/finally para garantir que cleanup sempre execute.
 * 
 * @param setupFn - Função que cria/prepara os dados de teste
 * @param testFn - Função que executa o teste
 * @param cleanupFn - Função que limpa os dados criados
 * 
 * @example
 * await withCleanup(
 *   async () => ({ user: await createUser(), invoice: await createInvoice() }),
 *   async (data) => { expect(data.invoice.userId).toBe(data.user.id) },
 *   async (data) => { await deleteInvoice(data.invoice.id); await deleteUser(data.user.id) }
 * );
 */
export async function withCleanup<T>(
  setupFn: () => Promise<T>,
  testFn: (data: T) => Promise<void>,
  cleanupFn: (data: T) => Promise<void>
): Promise<void> {
  const data = await setupFn();
  
  try {
    await testFn(data);
  } finally {
    try {
      await cleanupFn(data);
    } catch (error) {
      console.warn('Warning: Failed to cleanup test data:', error);
    }
  }
}
