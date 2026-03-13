# DATABASE SECURITY AUDIT - CRITICAL FINDINGS

**Date:** 2026-02-03
**Phase:** Brownfield Discovery - Phase 2
**Analyst:** Data Engineer - Security Specialist
**Severity:** 🔴 CRITICAL ISSUES FOUND

---

## 🚨 EXECUTIVE SUMMARY

A auditoria revelou **GAPS CRÍTICOS de segurança** no schema multi-tenant que podem resultar em **data leaks entre tenants**. Os sistemas de permissões (Grant/Policy/Capability) e audit logs (SecurityAuditLog/ImpersonationSession) **não têm tenantId**, criando risco de vazamento de dados sensíveis.

**Classificação Geral:** 7.2/10 (Bem estruturado com gaps críticos de segurança)

---

## 🔴 CRITICAL FINDINGS (5 items)

### C1: Permission Systems SEM tenantId 🚨

**Models afetados:**
- Grant
- GrantRequest
- Policy
- Capability
- SpaceRole
- RoleCapability
- UserSpaceRole

**Risco:** Vazamento de permissões entre tenants. Um usuário de Tenant A pode ver/modificar grants de Tenant B.

**Exemplo de ataque:**
```sql
-- Sem tenantId, query retorna ALL grants (todos tenants)
SELECT * FROM Grant WHERE userId = 'user-123';

-- CORRETO deveria ser:
SELECT * FROM Grant WHERE userId = 'user-123' AND tenantId = 'tenant-A';
```

**Impacto:** CRÍTICO - Violação de segurança multi-tenant
**Esforço:** HIGH (3-4 migrations + code changes)
**Prioridade:** P0 (blocker para produção)

---

### C2: Audit Systems SEM tenantId 🚨

**Models afetados:**
- SecurityAuditLog
- CapabilityAuditEvent
- GrantAuditEvent
- ImpersonationSession
- SecurityRequest
- DataExportLog

**Risco:** Logs de auditoria podem vazar entre tenants. Admin de Tenant A pode ver logs de segurança de Tenant B.

**Impacto:** CRÍTICO - Compliance risk (GDPR, SOC2)
**Esforço:** HIGH (6 migrations + middleware updates)
**Prioridade:** P0 (blocker para compliance)

---

### C3: RLS Middleware Incompleto 🚨

**Localização:** `/apps/api/src/lib/prisma.ts`

**Problema:**
```typescript
const TENANT_SCOPED_MODELS = [
  'User', 'Subscription', 'Invoice', 'Order', 'AuditLog',
  'EmailQueue', 'EmailEvent'
  // INCOMPLETO - apenas 7 models quando deveria ter 30+
];
```

**Models faltando no middleware:**
- Grant, GrantRequest, Policy, Capability
- SecurityAuditLog, SecurityRequest
- DataExportLog, ImpersonationSession
- CapabilityAuditEvent, GrantAuditEvent
- Feature, PlanFeature, ProductEffect (se multi-tenant)
- RoleCapability, UserSpaceRole
- Payment (tem tenantId via cascade mas sem filtro automático)

**Risco:** Se um endpoint não passa `tenantId` corretamente no request context, o middleware não injeta filtro e dados podem vazar.

**Impacto:** CRÍTICO - Bypass de RLS em 23+ models
**Esforço:** MEDIUM (expandir array + testes)
**Prioridade:** P0

---

### C4: Soft Delete NÃO Filtrado Automaticamente 🚨

**Problema:** Middleware Prisma não filtra `deletedAt: null` automaticamente.

**Risco:** Queries retornam records deletados (soft-deleted).

**Exemplo:**
```typescript
// Query atual (ERRADO):
const users = await prisma.user.findMany({ where: { tenantId } });
// Retorna users com deletedAt != null (deletados)

// Query correta (MANUAL):
const users = await prisma.user.findMany({
  where: { tenantId, deletedAt: null }
});
```

**Impacto:** HIGH - Dados "deletados" aparecem em listagens
**Esforço:** MEDIUM (middleware update)
**Prioridade:** P0

---

### C5: Payment SEM tenantId Direto ⚠️

**Problema:** Payment tem `invoiceId` e `orderId` mas não `tenantId` direto.

**Risco:** Se invoice/order forem deletados (cascade), Payment perde contexto de tenant.

**Performance:** JOIN necessário para filtrar por tenant:
```sql
SELECT * FROM Payment p
JOIN Invoice i ON p.invoiceId = i.id
WHERE i.tenantId = 'tenant-A';
```

**Recomendação:** Adicionar `tenantId` redundante para:
- Melhor performance (índice direto)
- Segurança (double-check)
- Resiliência (mesmo se invoice deletado)

**Impacto:** MEDIUM - Performance + Resiliência
**Esforço:** MEDIUM (migration + code update)
**Prioridade:** P1

---

## 🟠 HIGH PRIORITY (6 items)

### H1: Audit Logs SEM Soft Delete

**Models afetados:**
- SecurityAuditLog
- CapabilityAuditEvent
- GrantAuditEvent
- DataExportLog

**Problema:** Não têm `deletedAt`, podem ser deletados acidentalmente.

**Risco:** Perda de histórico de auditoria (compliance violation).

**Impacto:** HIGH - GDPR/SOC2 compliance risk
**Esforço:** MEDIUM (4 migrations)
**Prioridade:** P1

---

### H2: Senhas SEM Marcação de Encryption

**Campos críticos:**
- User.password
- User.backupCodes
- User.twoFactorSecret
- EmailIntegration.apiKey
- EmailIntegration.smtpPassword

**Problema:** Schema não documenta que são hasheados/criptografados.

**Risco:** Pode ser exposto em logs/monitoring acidentalmente.

**Recomendação:**
```prisma
password String /// @encrypted Hasheado com bcrypt, nunca plain text
```

**Impacto:** MEDIUM - Documentation gap
**Esforço:** LOW (comentários no schema)
**Prioridade:** P1

---

### H3: Índices Compostos Faltando

**Queries afetadas:**
```sql
-- Comum em billing reports:
SELECT * FROM Invoice WHERE tenantId = ? AND status = ?;
SELECT * FROM Payment WHERE tenantId = ? AND method = ? AND status = ?;

-- Faltam índices compostos:
@@index([tenantId, status]) -- Invoice, Order, Subscription
@@index([tenantId, method, status]) -- Payment
```

**Impacto:** HIGH - N+1 queries em reports
**Esforço:** HIGH (múltiplos índices)
**Prioridade:** P1

---

### H4: RLS Middleware NÃO Filtra deletedAt

**Problema:** Mesmo com RLS funcionando, soft-deleted records aparecem.

**Solução:**
```typescript
// Expandir middleware para:
if (model in TENANT_SCOPED_MODELS) {
  params.args.where = {
    ...params.args.where,
    tenantId: context.tenantId,
    deletedAt: null // ADICIONAR
  };
}
```

**Impacto:** HIGH - UX degradada (ver deletados)
**Esforço:** MEDIUM
**Prioridade:** P1

---

### H5: Grant.spaceId/capabilityId Optional - Ambiguidade

**Problema:**
```prisma
model Grant {
  spaceId      String?  // Nullable
  capabilityId String?  // Nullable
}
```

**Questão:** Grant sem space OU capability é válido? Business rule unclear.

**Risco:** Dados inválidos no banco.

**Recomendação:** Validar regra de negócio e documentar.

**Impacto:** MEDIUM - Data integrity
**Esforço:** LOW (validation + docs)
**Prioridade:** P1

---

### H6: IDOR Middleware Incompleto

**Localização:** `/apps/api/src/middleware/idor.middleware.ts`

**Problema:** Middleware previne IDOR em alguns models mas não cobre Grant/Policy/Capability.

**Risco:** Usuário pode acessar permissions de outro tenant via IDOR.

**Exemplo:**
```
GET /api/grants/grant-uuid-of-tenant-B
// Se grant não tem tenantId check, retorna dado de outro tenant
```

**Impacto:** HIGH - IDOR vulnerability
**Esforço:** MEDIUM (expandir middleware)
**Prioridade:** P1

---

## 🟡 MEDIUM PRIORITY (6 items)

### M1: Empty Migrations

**Migrations vazias:**
- `20260114033028_add_datetime_format_fields` - vazia
- `20260115011931_add_icon_svg_viewbox` - vazia

**Impacto:** LOW - Confusão no histórico
**Esforço:** LOW
**Prioridade:** P2

---

### M2: Migration Duplicada

**Migration:**
- `20260114201400_add_icon_color_mode`
- `20260114231504_add_icon_color_mode` (duplica parcialmente)

**Impacto:** LOW - Histórico confuso
**Esforço:** LOW
**Prioridade:** P2

---

### M3: Índices Compostos em Analytics

**Queries de analytics precisam:**
```sql
SELECT * FROM Invoice WHERE tenantId = ? AND createdAt BETWEEN ? AND ?;
SELECT * FROM AuditLog WHERE tenantId = ? AND createdAt BETWEEN ? AND ?;

-- Faltam:
@@index([tenantId, createdAt])
```

**Impacto:** MEDIUM - Slow analytics queries
**Esforço:** MEDIUM
**Prioridade:** P2

---

### M4: PlatformConfig Hardcoded pt-BR

**Problema:**
```prisma
language     String  @default("pt-BR")
numberFormat String  @default("1.000,00")
```

**Impacto:** LOW - I18n frágil
**Esforço:** LOW (ENV var)
**Prioridade:** P2

---

### M5: Feature/Plan Multi-Tenant Ambiguity

**Models:**
- Feature (tenantId faltando - são globais?)
- Plan (tenantId nullable - platform plans OU tenant-specific?)
- Product (tenantId nullable - idem)

**Questão:** Se features/plans podem ser customizados por tenant, precisam tenantId obrigatório.

**Impacto:** MEDIUM - Business rule unclear
**Esforço:** MEDIUM (validar + migration se necessário)
**Prioridade:** P2

---

### M6: Purchase.externalPaymentId SEM @unique

**Problema:** Campo não tem constraint unique.

**Risco:** Pode ter duplicatas de mesmo payment externo.

**Impacto:** MEDIUM - Data integrity
**Esforço:** LOW (migration)
**Prioridade:** P2

---

## 🟢 LOW PRIORITY (5 items)

### L1: Schema SEM Comentários

**Models complexos sem /// comentários:**
- Grant
- Policy
- Capability
- CapabilityAuditEvent

**Impacto:** LOW - Documentation gap
**Esforço:** LOW
**Prioridade:** P3

---

### L2: @unique Constraints SEM Descrição

**Impacto:** LOW
**Esforço:** LOW
**Prioridade:** P3

---

### L3: GrantRequest.metadata Não Existe

**Utilidade:** Guardar extra data sobre request.

**Impacto:** LOW - Feature gap
**Esforço:** LOW
**Prioridade:** P3

---

### L4: Timestamp createdAt SEM Índice

**Models:**
- AuditLog.createdAt
- EmailQueue.createdAt

**Impacto:** LOW - Analytics subótimas
**Esforço:** LOW
**Prioridade:** P3

---

### L5: Naming Conventions Inconsistentes

**Exemplos:** Alguns models usam `code`, outros `slug`, sem convenção clara.

**Impacto:** LOW
**Esforço:** LOW
**Prioridade:** P3

---

## 📊 RESUMO DE DÉBITOS TÉCNICOS

| Severidade | Quantidade | Horas | Custo (R$150/h) |
|-----------|------------|-------|-----------------|
| CRITICAL | 5 | 48h | R$ 7,200 |
| HIGH | 6 | 32h | R$ 4,800 |
| MEDIUM | 6 | 24h | R$ 3,600 |
| LOW | 5 | 8h | R$ 1,200 |
| **TOTAL** | **22** | **112h** | **R$ 16,800** |

---

## 🎯 AÇÕES IMEDIATAS (P0 - Próximos 2 sprints)

### Sprint 1 (Week atual)
1. ✅ Adicionar `tenantId` a Grant, GrantRequest, Policy, Capability, SecurityAuditLog
2. ✅ Expandir RLS middleware para cobrir 30+ models
3. ✅ Adicionar filtro `deletedAt: null` ao middleware

### Sprint 2 (Próxima week)
4. ✅ Adicionar `tenantId` a audit models (CapabilityAuditEvent, GrantAuditEvent, etc)
5. ✅ Implementar soft delete em audit models
6. ✅ Adicionar índices compostos críticos

**Total P0:** 48 horas (6 dias)

---

## ✅ STRENGTHS (Não mudar)

✓ Multi-tenancy bem arquitetado em core models (User, Tenant, Subscription)
✓ Soft delete implementado em models críticos
✓ Cascade deletes configurados sensatamente
✓ Índices em campos de busca comum
✓ Schema modular (base + extended)
✓ JSONB usado estrategicamente
✓ 38 enums bem estruturados

---

## 🔐 SECURITY BEST PRACTICES IMPLEMENTADAS

✓ IDOR prevention middleware exists
✓ CSRF protection configured
✓ Rate limiting implemented
✓ Prisma uses parameterized queries (SQL injection safe)
✓ Password hashing (bcrypt in app-level)
✓ JWT + Refresh token rotation

---

**Audit Completed:** 2026-02-03
**Specialist:** Data Engineer - PostgreSQL + Prisma Security
**Classification:** 7.2/10 (Good structure with critical security gaps)
**Recommendation:** Fix P0 items before production launch
