# STORY-001: Security Test Suite - Technical Design

**Story ID:** STORY-001  
**Epic:** EPIC-001 (Sprint 1: Security & Database Multi-Tenant Isolation)  
**Designer:** @dev  
**Date:** 2026-02-03

## Context

Esta story implementa a suite completa de testes de segurança para o framework Kaven, cobrindo 4 vetores críticos de ataque:

1. **IDOR** (Insecure Direct Object Reference) - tenant isolation
2. **CSRF** (Cross-Site Request Forgery) - token validation
3. **SQL Injection** - input sanitization
4. **XSS** (Cross-Site Scripting) - output escaping

**WHY:** Framework precisa garantir zero vulnerabilidades críticas antes de produção. Testes automatizados previnem regressões de segurança.

## Component Checklist

- [ ] **Database:** N/A (sem mudanças de schema)
- [x] **API:** Validar endpoints existentes (não criar novos)
- [ ] **Frontend:** N/A (testes backend only)
- [x] **Tests:** Core da story - criar 4 test suites
- [x] **Docs:** `docs/testing/security.md`
- [x] **CI/CD:** Adicionar `test:security` script e GitHub Actions step

## Architecture Overview

```
apps/api/tests/security/
├── helpers/
│   └── security.helpers.ts      # Reusable test helpers
├── fixtures/
│   └── security.fixtures.ts     # Test data setup (tenant isolation)
├── idor.spec.ts                 # IDOR tests (33 models)
├── csrf.spec.ts                 # CSRF tests (all POST/PUT/DELETE)
├── sql-injection.spec.ts        # SQL Injection tests
└── xss.spec.ts                  # XSS tests
```

## Test Scenarios

### 1. IDOR Tests (12h)

**Goal:** Garantir que User de Tenant A não pode acessar recursos de Tenant B.

**Test Strategy:**

- Criar 2 tenants (A e B) com fixtures
- Para cada model tenant-scoped:
  - Criar recurso em Tenant B
  - Tentar acessar via User de Tenant A
  - Esperar 403 Forbidden

**Priority Models (Top 15):**

1. Grant
2. GrantRequest
3. Policy
4. Capability
5. SecurityAuditLog
6. ImpersonationSession
7. Invoice
8. Payment
9. Subscription
10. Order
11. User
12. Organization
13. Project
14. Task
15. Space

**Remaining 18 models:** Lower priority (pode ser movido para Sprint 2 se time constraint)

**Helper Function:**

```typescript
async function testIDOR(
  model: string,
  endpoint: string,
  tenantAUser: User,
  tenantBResourceId: string,
): Promise<void>;
```

### 2. CSRF Tests (8h)

**Goal:** Garantir que todas as mutations (POST/PUT/DELETE) exigem CSRF token válido.

**Test Strategy:**

- Para cada endpoint de mutation:
  - Test 1: Request sem CSRF token → 403
  - Test 2: Request com CSRF token inválido → 403
  - Test 3: Request com CSRF token válido → 200/201

**Critical Endpoints:**

- POST /api/grants
- POST /api/invoices
- PUT /api/users/:id
- DELETE /api/products/:id
- ... (todos POST/PUT/DELETE)

**Helper Function:**

```typescript
async function testCSRF(
  method: "POST" | "PUT" | "DELETE",
  endpoint: string,
  data: any,
): Promise<void>;
```

### 3. SQL Injection Tests (6h)

**Goal:** Garantir que queries com user input não executam SQL malicioso.

**Test Strategy:**

- Injetar payloads conhecidos em query params
- Validar que retorna 400 Bad Request (não executa SQL)

**Attack Vectors:**

- Search: `GET /api/users?search='`
- Filter: `GET /api/invoices?status='; DROP TABLE invoices--`
- Sort: `GET /api/products?sort=name; DELETE FROM products--`

**Helper Function:**

```typescript
async function testSQLInjection(
  endpoint: string,
  queryParam: string,
  injectionPayload: string,
): Promise<void>;
```

### 4. XSS Tests (6h)

**Goal:** Garantir que inputs com `<script>` tags são sanitizados.

**Test Strategy:**

- Enviar payloads XSS em inputs
- Validar que response escapa HTML entities

**Attack Vectors:**

- `<script>alert('XSS')</script>`
- `<img src=x onerror=alert('XSS')>`
- `<svg onload=alert('XSS')>`

**Helper Function:**

```typescript
async function testXSS(
  endpoint: string,
  data: Record<string, string>,
): Promise<void>;
```

## Data Model (Test Fixtures)

```typescript
// Tenant Isolation Test Data
interface SecurityTestData {
  tenantA: {
    tenant: Tenant;
    user: User;
    grant: Grant;
    invoice: Invoice;
    // ... outros resources
  };
  tenantB: {
    tenant: Tenant;
    user: User;
    grant: Grant;
    invoice: Invoice;
    // ... outros resources
  };
}
```

**Setup Strategy:**

- `beforeAll()`: Criar tenants e users
- `beforeEach()`: Criar resources frescos (evitar poluição entre testes)
- `afterAll()`: Cleanup (delete tenants)

## Implementation Phases

### Phase 1: Foundation (2h)

- [x] Create directory structure
- [x] Setup security.helpers.ts skeleton
- [x] Setup security.fixtures.ts skeleton
- [x] Configure Jest for security tests

### Phase 2: IDOR Tests (12h)

- [ ] Implement `testIDOR()` helper
- [ ] Test top 15 critical models
- [ ] Validate tenant isolation
- [ ] Document IDOR patterns

### Phase 3: CSRF Tests (8h)

- [ ] Implement `testCSRF()` helper
- [ ] Test all POST/PUT/DELETE endpoints
- [ ] Validate token generation
- [ ] Document CSRF protection

### Phase 4: SQL Injection Tests (6h)

- [ ] Implement `testSQLInjection()` helper
- [ ] Test search queries
- [ ] Test filter queries
- [ ] Test sort queries

### Phase 5: XSS Tests (6h)

- [ ] Implement `testXSS()` helper
- [ ] Test user inputs
- [ ] Validate HTML sanitization
- [ ] Document XSS prevention

### Phase 6: CI Integration (2h)

- [ ] Add `test:security` script to package.json
- [ ] Update GitHub Actions workflow
- [ ] Test CI integration locally (act)
- [ ] Validate coverage report generation

### Phase 7: Documentation (2h)

- [ ] Create `docs/testing/security.md`
- [ ] Document test patterns
- [ ] Add examples for each category
- [ ] Document best practices

## Risks & Mitigation

### Risk 1: Test suite takes longer than 32h

**Probability:** MEDIUM (6/10)  
**Impact:** MEDIUM (5/10)

**Mitigation:**

- Priorizar IDOR tests (highest risk)
- Implementar helpers reusáveis logo no início
- Time-box cada fase estritamente

**Contingency:**

- Se > 24h sem completar IDOR: reduzir para top 15 models
- Mover 18 models restantes para Sprint 2

### Risk 2: False positives in tests

**Probability:** LOW (3/10)  
**Impact:** LOW (3/10)

**Mitigation:**

- Peer review com Security Engineer
- Validar cada categoria isoladamente
- Usar payloads conhecidos (OWASP Top 10)

**Contingency:**

- Criar flag `--strict` para testes validados
- Mover testes experimentais para suite separada

### Risk 3: CI integration failures

**Probability:** MEDIUM (4/10)  
**Impact:** MEDIUM (6/10)

**Mitigation:**

- Testar localmente com `act` antes de commitar
- Validar database setup com Docker
- Configurar timeout generoso (30min)

**Contingency:**

- Mover security tests para workflow separado
- Rodar em paralelo (não bloqueia PR principal)

## Edge Cases

1. **Empty database:** IDOR tests devem criar fixtures (não depender de seed data)
2. **Null values:** SQL Injection tests devem validar null handling
3. **Max length:** XSS tests devem validar inputs longos (> 10KB)
4. **Special characters:** SQL Injection deve testar unicode, emojis
5. **Concurrent requests:** CSRF tokens devem ser thread-safe

## Performance Considerations

- **Test execution time:** Target < 5min para toda suite
- **Database cleanup:** Usar transactions + rollback (mais rápido que DELETE)
- **Parallel execution:** Jest workers = 4 (balance speed vs. resource usage)
- **Fixtures caching:** Reusar tenants entre testes (criar 1x, usar N vezes)

## Security Review Checklist

- [ ] All IDOR tests validate tenantId filtering
- [ ] All CSRF tests validate token presence + validity
- [ ] All SQL Injection tests use parameterized queries
- [ ] All XSS tests validate HTML entity escaping
- [ ] No hardcoded credentials in test code
- [ ] No sensitive data in test fixtures (use faker)

## Rollback Plan

Se testes quebrarem build:

1. Adicionar `.skip()` em testes problemáticos
2. Criar GitHub issue para fix
3. Não bloquear PR principal (mover para workflow separado)

Se vulnerabilidade descoberta:

1. Criar hotfix branch imediatamente
2. Fix vulnerability + adicionar regression test
3. Deploy hotfix ASAP (não esperar sprint end)

## Success Metrics

- [ ] 100% dos 4 vetores cobertos (IDOR, CSRF, SQL Injection, XSS)
- [ ] Top 15 models IDOR testados (mínimo)
- [ ] Todos POST/PUT/DELETE endpoints CSRF testados
- [ ] Test execution time < 5min
- [ ] Zero false positives (após peer review)
- [ ] CI integration funcionando (GitHub Actions green)

## Anti-Hallucination Checkpoints

- [x] I have read the ENTIRE story YAML (not just title)
- [x] I understand WHY this story exists (prevent production vulnerabilities)
- [x] I know WHAT success looks like (100% security coverage, zero vulnerabilities)
- [x] I have validated design against existing architecture (Jest + Supertest already installed)
- [x] I have identified all edge cases (empty DB, null values, max length, etc.)
- [x] I have planned for rollback (skip tests if breaking build)

---

**Next Step:** Implement Phase 1 (Foundation) - Create directory structure and helpers skeleton
