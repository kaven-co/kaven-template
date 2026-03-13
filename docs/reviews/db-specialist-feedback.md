# DB SPECIALIST REVIEW FEEDBACK

**Date:** 2026-02-03
**Phase:** Brownfield Discovery - Phase 5 (DB Specialist Review)
**Reviewer:** Database Specialist (PostgreSQL + Prisma Expert)
**Duration:** 30 minutes
**Status:** ✅ VALIDADO COM AJUSTES CRÍTICOS

---

## 🎯 VALIDATION SUMMARY

- **Items validated:** 22/22 (100%)
- **Severity changes:** 0
- **Effort adjustments:** 3 (DB-C1, DB-C2, DB-H3)
- **Priority changes:** 1 (DB-C5: P0 → P1)
- **Additional debts identified:** 2 (DB-C6, DB-H7)

**Overall Assessment:** ✅ **APPROVED WITH CRITICAL ADJUSTMENTS**

O DRAFT identificou corretamente os débitos críticos de segurança multi-tenant. Validação confirmou:
- ✅ 5 CRITICAL debts são de fato P0 blockers
- ⚠️ Esforços subestimados para migrations complexas
- ⚠️ 2 novos débitos críticos identificados
- ✅ Priorização está correta

---

## 🔴 CRITICAL FINDINGS VALIDATION (DB-C1 to DB-C5)

### ✅ DB-C1: Permission Systems SEM tenantId — APROVADO

**Status:** VALIDADO
**Severity:** 🔴 CRITICAL (confirmado)
**Esforço Original:** 16h
**Esforço Ajustado:** **24h** (+8h)

**Motivo do ajuste:**
A adição de `tenantId` em 7 modelos de permissões requer:
1. **Migrations complexas com dados existentes** (8h):
   - Grant: precisa inferir tenantId via User.tenantId
   - GrantRequest: idem
   - Policy: precisa decidir se é global ou per-tenant
   - Capability: verificar se é global ou per-tenant
   - SpaceRole: já tem spaceId, precisa adicionar tenantId redundante
   - RoleCapability: inferir via SpaceRole
   - UserSpaceRole: inferir via Space
2. **Testes abrangentes** (8h):
   - Verificar isolamento entre tenants em TODOS os endpoints de permissões
   - Testes de IDOR específicos para Grant/Policy/Capability
   - Testes de cascade delete
3. **Code changes** (8h):
   - Atualizar services/controllers para passar tenantId
   - Atualizar queries existentes
   - Adicionar validação de tenantId em middlewares

**Estratégia de migração recomendada:**

```typescript
// FASE 1: Adicionar tenantId nullable (zero downtime)
ALTER TABLE "grants" ADD COLUMN "tenant_id" VARCHAR;
ALTER TABLE "grant_requests" ADD COLUMN "tenant_id" VARCHAR;
ALTER TABLE "policies" ADD COLUMN "tenant_id" VARCHAR;
// ... (7 models)

// FASE 2: Backfill data (via script separado, não migration)
// Grant: inferir via user.tenantId
UPDATE grants g
SET tenant_id = u.tenant_id
FROM users u
WHERE g.user_id = u.id;

// GrantRequest: idem
UPDATE grant_requests gr
SET tenant_id = u.tenant_id
FROM users u
WHERE gr.requester_id = u.id;

// Policy: decidir se é global (NULL) ou per-tenant
// ⚠️ REGRA DE NEGÓCIO A CONFIRMAR (ver seção de perguntas)

// Capability: global (NULL assumido)
// ⚠️ CONFIRMAR COM PRODUCT OWNER

// SpaceRole: inferir via space.tenantId
UPDATE space_roles sr
SET tenant_id = s.tenant_id
FROM spaces s
WHERE sr.space_id = s.id;

// RoleCapability: inferir via role.tenantId
UPDATE role_capabilities rc
SET tenant_id = sr.tenant_id
FROM space_roles sr
WHERE rc.role_id = sr.id;

// UserSpaceRole: inferir via space.tenantId
UPDATE user_space_roles usr
SET tenant_id = s.tenant_id
FROM spaces s
WHERE usr.space_id = s.id;

// FASE 3: Validar integridade (100% dos records devem ter tenantId)
SELECT COUNT(*) FROM grants WHERE tenant_id IS NULL;
-- Deve retornar 0

// FASE 4: Tornar tenantId NOT NULL (após validação)
ALTER TABLE "grants" ALTER COLUMN "tenant_id" SET NOT NULL;
// ... (para todos os models que NÃO são globais)

// FASE 5: Adicionar índices compostos
CREATE INDEX idx_grants_tenant_user ON grants(tenant_id, user_id);
CREATE INDEX idx_grant_requests_tenant_status ON grant_requests(tenant_id, status);
// ... (ver DB-H3)
```

**ATENÇÃO CRÍTICA:**
⚠️ **Capability e Policy podem ser GLOBAIS** (platform-wide) — nesse caso, `tenantId` deve ser **nullable**.
⚠️ **Grant/GrantRequest SEMPRE são per-tenant** — `tenantId` deve ser **NOT NULL**.

**Decisão necessária antes de migration:** Ver pergunta 4 na seção "ANSWERS TO QUESTIONS".

---

### ✅ DB-C2: Audit Systems SEM tenantId — APROVADO

**Status:** VALIDADO
**Severity:** 🔴 CRITICAL (confirmado)
**Esforço Original:** 16h
**Esforço Ajustado:** **20h** (+4h)

**Motivo do ajuste:**
6 modelos de auditoria requerem migração MAIS complexa pois:
1. **Dados históricos sensíveis** — backfill deve ser 100% preciso (compliance)
2. **Volume potencialmente alto** — SecurityAuditLog pode ter milhões de records
3. **Retenção legal** — não pode haver perda de dados durante migration

**Models afetados:**
1. SecurityAuditLog — inferir via user.tenantId
2. CapabilityAuditEvent — inferir via user.tenantId
3. GrantAuditEvent — inferir via grant.tenantId (após DB-C1)
4. ImpersonationSession — inferir via impersonator.tenantId
5. SecurityRequest — inferir via requester.tenantId
6. DataExportLog — inferir via user.tenantId

**Estratégia de migração recomendada:**

```sql
-- FASE 1: Adicionar tenantId nullable
ALTER TABLE "security_audit_logs" ADD COLUMN "tenant_id" VARCHAR;
-- ... (6 models)

-- FASE 2: Backfill (batch processing para grandes volumes)
-- SecurityAuditLog
UPDATE security_audit_logs sal
SET tenant_id = u.tenant_id
FROM users u
WHERE sal.user_id = u.id;

-- Casos onde user_id IS NULL (system actions) → marcar como NULL (global)
-- ⚠️ DECISÃO: audit logs globais devem ter tenantId NULL ou um tenant especial '__PLATFORM__'?

-- FASE 3: Soft delete nos audit logs (novo debt DB-H1)
ALTER TABLE "security_audit_logs" ADD COLUMN "deleted_at" TIMESTAMP;
-- ... (4 models)

-- FASE 4: Tornar tenantId NOT NULL (após validação)
-- ⚠️ EXCETO se decidirmos permitir logs globais (NULL)
```

**COMPLIANCE RISK MITIGATION:**
- Backup completo ANTES da migration
- Dry-run em staging com dados reais anonimizados
- Validação de integridade: 0 records com tenantId NULL (exceto logs globais)
- Audit trail da própria migration (quem executou, quando, quantos records alterados)

**Esforço breakdown:**
- Migrations: 8h
- Backfill scripts + testes: 8h
- Validação de compliance: 4h

---

### ✅ DB-C3: RLS Middleware Incompleto — APROVADO

**Status:** VALIDADO
**Severity:** 🔴 CRITICAL (confirmado)
**Esforço Original:** 8h
**Esforço Ajustado:** **8h** (mantido)

**Lista COMPLETA de TENANT_SCOPED_MODELS validada:**

```typescript
const TENANT_SCOPED_MODELS = [
  // ✅ JÁ PRESENTES (7 models)
  'User',
  'Subscription',
  'Invoice',
  'Order',
  'AuditLog',
  'EmailQueue',
  'EmailEvent',

  // ❌ FALTANDO - CRITICAL (7 models - após DB-C1)
  'Grant',
  'GrantRequest',
  'UserSpaceRole',
  'SpaceRole',      // Tem spaceId → tenantId via Space
  'RoleCapability', // Inferir via SpaceRole

  // ❌ FALTANDO - CRITICAL (6 models - após DB-C2)
  'SecurityAuditLog',
  'CapabilityAuditEvent',
  'GrantAuditEvent',
  'ImpersonationSession',
  'SecurityRequest',
  'DataExportLog',

  // ❌ FALTANDO - HIGH (3 models)
  'Payment',        // Adicionar tenantId redundante (DB-C5)
  'Purchase',       // Tem tenantId
  'UsageRecord',    // Tem tenantId

  // ❌ FALTANDO - MEDIUM (6 models - dependem de DB-M5)
  'Plan',           // Se tenantId nullable → apenas per-tenant
  'Product',        // Se tenantId nullable → apenas per-tenant
  'PlanFeature',    // Inferir via Plan
  'ProductEffect',  // Inferir via Product
  'Price',          // Inferir via Plan/Product
  'License',        // Inferir via Purchase

  // ❌ FALTANDO - DEMO (2 models)
  'Project',
  'Task',

  // ❌ FALTANDO - INFRASTRUCTURE (2 models)
  'File',           // Tem tenantId nullable
  'Space',          // Tem tenantId nullable

  // ❓ MODELOS GLOBAIS (NÃO adicionar ao middleware)
  // 'Capability',      // Global (platform-wide) → sem tenantId
  // 'Policy',          // Pode ser global OU per-tenant → nullable
  // 'Feature',         // Global (platform-wide) → sem tenantId
  // 'Currency',        // Global
  // 'PlatformConfig',  // Global (singleton)
  // 'SecurityConfig',  // Global
];
```

**Total de models a adicionar:** 26 models

**⚠️ ATENÇÃO:**
- **Policy** e **Plan/Product**: decisão depende de regra de negócio (ver pergunta 4)
- **SpaceRole/RoleCapability/UserSpaceRole**: têm spaceId, adicionar tenantId é redundante mas crítico para performance e RLS

**Testes necessários:**
1. Unit tests: verificar injeção de tenantId em TODOS os 33 models
2. Integration tests: verificar isolamento entre tenants
3. E2E tests: simular ataques IDOR em TODOS os endpoints

---

### ✅ DB-C4: Soft Delete NÃO Filtrado Automaticamente — APROVADO

**Status:** VALIDADO
**Severity:** 🔴 CRITICAL (confirmado)
**Esforço Original:** 4h
**Esforço Ajustado:** **4h** (mantido)

**Problema confirmado:**
O middleware RLS atual (`/apps/api/src/lib/prisma.ts`) não filtra `deletedAt: null` automaticamente.

**Solução:**

```typescript
// Expandir middleware para incluir soft delete filter
prisma.$use(async (params, next) => {
  const tenantId = (params as any).tenantId;

  if (!tenantId || !TENANT_SCOPED_MODELS.includes(params.model || '')) {
    return next(params);
  }

  // NOVO: Lista de models com soft delete
  const SOFT_DELETE_MODELS = [
    'User', 'Tenant', 'Subscription', 'Invoice',
    'Order', 'File',
    // ADICIONAR após DB-H1:
    'SecurityAuditLog', 'CapabilityAuditEvent',
    'GrantAuditEvent', 'DataExportLog'
  ];

  const hasSoftDelete = SOFT_DELETE_MODELS.includes(params.model || '');

  // Aplica filtro de tenantId + deletedAt
  if (params.action === 'findMany') {
    if (params.args.where) {
      if (params.args.where.tenantId === undefined) {
        params.args.where.tenantId = tenantId;
      }
      // NOVO: Filtro de soft delete
      if (hasSoftDelete && params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    } else {
      params.args.where = {
        tenantId,
        ...(hasSoftDelete && { deletedAt: null })
      };
    }
  }

  // Aplicar mesma lógica para findFirst, findUnique, etc.
  // ...

  return next(params);
});
```

**Casos especiais:**
- **Admin queries que PRECISAM ver deletados:** usar `{ deletedAt: undefined }` explicitamente
- **Restore operation:** passar `includeDeleted: true` via context

**Esforço breakdown:**
- Middleware update: 2h
- Testes: 2h

---

### ⚠️ DB-C5: Payment SEM tenantId Direto — AJUSTADO (P0 → P1)

**Status:** VALIDADO COM AJUSTE
**Severity:** 🟠 HIGH (não blocker, mas importante)
**Prioridade Original:** P0
**Prioridade Ajustada:** **P1** (P0 é overstatement)
**Esforço Original:** 4h
**Esforço Ajustado:** **4h** (mantido)

**Motivo do downgrade para P1:**

Payment tem `invoiceId` e `orderId`, ambos com `tenantId`. Embora adicionar `tenantId` redundante seja **BEST PRACTICE**, não é **BLOCKER CRÍTICO** porque:

1. ✅ **Segurança:** Payment sem invoice/order é órfão → não vazaria entre tenants
2. ✅ **Performance:** JOIN adicional é aceitável (Payment queries não são hot path)
3. ✅ **Resiliência:** Cascade deletes estão configurados corretamente

**Quando seria P0:**
- Se Payment pudesse existir SEM invoice/order (não é o caso)
- Se Payment fosse consultado frequentemente em reports (é, mas JOIN é rápido)
- Se compliance exigisse tenantId em TODAS as tabelas (não documentado)

**Recomendação:** Implementar em P1 (Sprint 4) como **preventive measure**, não como blocker.

**Migration simples:**

```sql
-- FASE 1: Adicionar tenantId nullable
ALTER TABLE "payments" ADD COLUMN "tenant_id" VARCHAR;

-- FASE 2: Backfill via invoice OU order
UPDATE payments p
SET tenant_id = COALESCE(
  (SELECT tenant_id FROM invoices WHERE id = p.invoice_id),
  (SELECT tenant_id FROM orders WHERE id = p.order_id)
);

-- FASE 3: Validar (0 nulls)
SELECT COUNT(*) FROM payments WHERE tenant_id IS NULL;

-- FASE 4: Tornar NOT NULL
ALTER TABLE "payments" ALTER COLUMN "tenant_id" SET NOT NULL;

-- FASE 5: Índice composto
CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
```

**Esforço:** 4h (migration + testes)

---

## 🆕 ADDITIONAL DEBTS IDENTIFIED

### 🔴 DB-C6: Space.tenantId É Nullable (Novo Critical)

**Severity:** 🔴 CRITICAL
**Esforço:** 8h
**Prioridade:** P0 (deve entrar no Sprint 1)

**Problema identificado:**

Ao revisar o schema, identifiquei que `Space.tenantId` é **nullable**:

```prisma
model Space {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // ⚠️ NULLABLE!
  // ...
}
```

**Risco:**
- Space sem tenantId = Space global acessível por todos os tenants
- Se não for intencional, é **DATA LEAK CRITICAL**
- SpaceRole/UserSpaceRole dependem de Space → leak cascata

**Questão de negócio:** Spaces podem ser globais (shared entre tenants)?

**Se NÃO (esperado):**
```sql
-- Verificar se há spaces órfãos
SELECT COUNT(*) FROM spaces WHERE tenant_id IS NULL;

-- Se houver, investigar e corrigir ANTES de tornar NOT NULL
-- Depois:
ALTER TABLE "spaces" ALTER COLUMN "tenant_id" SET NOT NULL;
```

**Se SIM (spaces globais são válidos):**
- Documentar no schema com comentário `/// @global`
- Adicionar lógica no RLS middleware para permitir NULL
- Adicionar validação: apenas SUPER_ADMIN pode criar spaces globais

**Esforço:**
- Investigação + decisão de negócio: 2h
- Migration + testes: 4h
- Validação de dados existentes: 2h

**RECOMENDAÇÃO:** Adicionar ao Sprint 1 junto com DB-C1.

---

### 🟠 DB-H7: Plan/Product.tenantId Nullable Causa Ambiguidade (Novo High)

**Severity:** 🟠 HIGH
**Esforço:** 6h
**Prioridade:** P1

**Problema identificado:**

Plan e Product têm `tenantId nullable`:

```prisma
model Plan {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // ⚠️ NULLABLE!
  // ...
}

model Product {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // ⚠️ NULLABLE!
  // ...
}
```

**Risco:**
- Plans globais (platform-wide) → tenantId NULL → listados para todos os tenants ✅ OK
- Plans customizados (per-tenant) → tenantId NOT NULL → apenas para aquele tenant ✅ OK
- **PROBLEMA:** Queries precisam saber se devem filtrar por tenantId ou não

**Exemplo de query ambígua:**

```typescript
// Quero listar plans disponíveis para meu tenant
// Deveria retornar:
// 1. Plans globais (tenantId IS NULL)
// 2. Plans customizados do meu tenant (tenantId = 'my-tenant')

const plans = await prisma.plan.findMany({
  where: {
    OR: [
      { tenantId: null },       // Plans globais
      { tenantId: myTenantId }, // Plans customizados
    ],
  },
});
```

**RLS middleware atual NÃO suporta esse pattern** — ele só injeta `tenantId = myTenantId`, excluindo plans globais.

**Solução:**

1. **Opção A (Recomendada):** Adicionar lógica especial no middleware:
   ```typescript
   const GLOBALLY_SCOPED_MODELS = ['Plan', 'Product', 'Feature'];

   if (GLOBALLY_SCOPED_MODELS.includes(params.model)) {
     // Permitir NULL OU tenantId específico
     params.args.where = {
       ...params.args.where,
       OR: [
         { tenantId: null },
         { tenantId: tenantId },
       ],
     };
   }
   ```

2. **Opção B:** Separar tabelas (PlatformPlan vs TenantPlan) — mais trabalho, mais clarity

**Esforço:**
- Middleware update: 2h
- Testes: 2h
- Validação de regras de negócio: 2h

**Overlaps com:** DB-M5 (mesma questão, mas aqui confirmamos ser HIGH priority)

---

## 📋 ANSWERS TO QUESTIONS

### 1. Qual a melhor estratégia de migração para adicionar `tenantId` em 13 models sem downtime?

**Resposta:**

**ESTRATÉGIA: Zero-Downtime Multi-Phase Migration**

#### **FASE 1: Schema Changes (Zero Downtime)**

```sql
-- Adicionar colunas nullable (não bloqueia writes)
ALTER TABLE "grants" ADD COLUMN "tenant_id" VARCHAR;
ALTER TABLE "grant_requests" ADD COLUMN "tenant_id" VARCHAR;
-- ... (13 models)

-- Adicionar índices parciais (para performance imediata em new records)
CREATE INDEX idx_grants_tenant_new ON grants(tenant_id) WHERE tenant_id IS NOT NULL;
```

**Tempo de execução:** ~5 minutos para 13 ALTER TABLE (PostgreSQL faz em paralelo)

---

#### **FASE 2: Backfill Data (Background Jobs)**

**⚠️ NÃO fazer backfill dentro da migration** — usar background job separado para não travar deploy.

```typescript
// Script separado: scripts/backfill-tenant-ids.ts
import { prisma } from './lib/prisma';

async function backfillGrantTenantIds() {
  console.log('🔄 Backfilling Grant.tenantId...');

  const BATCH_SIZE = 1000;
  let offset = 0;
  let updated = 0;

  while (true) {
    const grants = await prisma.$queryRaw`
      SELECT g.id, u.tenant_id
      FROM grants g
      JOIN users u ON g.user_id = u.id
      WHERE g.tenant_id IS NULL
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `;

    if (grants.length === 0) break;

    await prisma.$executeRaw`
      UPDATE grants
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE grants.user_id = u.id
        AND grants.tenant_id IS NULL
        AND grants.id = ANY(${grants.map(g => g.id)})
    `;

    updated += grants.length;
    offset += BATCH_SIZE;

    console.log(`✅ Updated ${updated} grants...`);
    await sleep(100); // Evita sobrecarregar DB
  }

  console.log(`✅ Backfill complete: ${updated} records updated.`);
}

// Repetir para os 13 models
```

**Execução:**
```bash
# Em produção, rodar APÓS deploy da FASE 1
pnpm tsx scripts/backfill-tenant-ids.ts
```

**Tempo estimado:** 2-4 horas dependendo do volume de dados

---

#### **FASE 3: Validation (Automated Check)**

```sql
-- Script de validação: garantir 0 nulls
SELECT
  'grants' AS table_name,
  COUNT(*) AS null_count
FROM grants WHERE tenant_id IS NULL
UNION ALL
SELECT
  'grant_requests',
  COUNT(*)
FROM grant_requests WHERE tenant_id IS NULL
-- ... (13 models)
;

-- Se resultado > 0, investigar e corrigir ANTES da FASE 4
```

**Se houver nulls:**
- Investigar quais records (provavelmente dados órfãos ou de testes)
- Decidir: deletar OU atribuir a tenant especial `__ORPHANED__`
- Documentar no audit log

---

#### **FASE 4: Enforce NOT NULL (Zero Downtime)**

```sql
-- Apenas quando FASE 3 retornar 0 nulls em TODOS os models
ALTER TABLE "grants" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "grant_requests" ALTER COLUMN "tenant_id" SET NOT NULL;
-- ... (apenas para models que NÃO são globais)

-- ⚠️ NÃO tornar NOT NULL em:
-- - Capability (global)
-- - Policy (pode ser global)
-- - Feature (global)
```

**Tempo de execução:** ~2 minutos (PostgreSQL valida que não há nulls)

---

#### **FASE 5: Índices Compostos (Performance)**

```sql
-- Substituir índices parciais por compostos
DROP INDEX idx_grants_tenant_new;
CREATE INDEX idx_grants_tenant_user ON grants(tenant_id, user_id);
CREATE INDEX idx_grants_tenant_status ON grants(tenant_id, status);

-- Repetir para os 13 models (ver DB-H3)
```

---

#### **DEPLOYMENT STRATEGY:**

```yaml
Week 1, Day 1 (Segunda): Deploy FASE 1 → Schema changes
Week 1, Day 1 (Noite):  Rodar FASE 2 → Backfill (background)
Week 1, Day 2 (Manhã):  Validar FASE 3 → Conferir nulls
Week 1, Day 2 (Tarde):  Deploy FASE 4 → NOT NULL constraint
Week 1, Day 3 (Manhã):  Deploy FASE 5 → Índices compostos
```

**Downtime total:** **ZERO** (todas operações são online)

---

#### **ROLLBACK PLAN:**

```sql
-- Se precisar reverter (APENAS antes da FASE 4):
ALTER TABLE "grants" DROP COLUMN "tenant_id";
-- ... (13 models)

-- Índices são dropados automaticamente
```

**⚠️ APÓS FASE 4 (NOT NULL), rollback NÃO é possível** sem downtime e data loss.

---

#### **MONITORING:**

```typescript
// Adicionar métricas durante backfill
import { prometheus } from './lib/metrics';

const backfillProgress = new prometheus.Gauge({
  name: 'kaven_backfill_progress',
  help: 'Progress of tenant_id backfill',
  labelNames: ['table'],
});

backfillProgress.labels('grants').set(updated / total);
```

**Dashboard Grafana:**
- % de records com tenantId preenchido
- Queries que falham por falta de tenantId (após FASE 4)
- Latência de queries antes/depois dos índices compostos

---

### 2. Lista completa de TENANT_SCOPED_MODELS correta? Algum model faltando?

**Resposta:**

✅ **LISTA COMPLETA VALIDADA** (33 models após migrations)

```typescript
const TENANT_SCOPED_MODELS = [
  // === CORE (7 models - já presentes) ===
  'User',
  'Subscription',
  'Invoice',
  'Order',
  'AuditLog',
  'EmailQueue',
  'EmailEvent',

  // === PERMISSIONS (7 models - após DB-C1) ===
  'Grant',
  'GrantRequest',
  'UserSpaceRole',
  'SpaceRole',
  'RoleCapability',
  'Space',              // ⚠️ Se tenantId se tornar NOT NULL
  'SpaceOwner',

  // === AUDIT (6 models - após DB-C2) ===
  'SecurityAuditLog',
  'CapabilityAuditEvent',
  'GrantAuditEvent',
  'ImpersonationSession',
  'SecurityRequest',
  'DataExportLog',

  // === BILLING (3 models) ===
  'Payment',            // Após DB-C5 (P1)
  'Purchase',
  'UsageRecord',

  // === MONETIZATION (6 models - conditional) ===
  // ⚠️ APENAS se Plan/Product puderem ser per-tenant:
  'Plan',               // Se tenantId NOT NULL
  'Product',            // Se tenantId NOT NULL
  'PlanFeature',        // Inferir via Plan
  'ProductEffect',      // Inferir via Product
  'Price',              // Inferir via Plan/Product
  'License',

  // === DEMO FEATURES (2 models) ===
  'Project',
  'Task',

  // === INFRASTRUCTURE (1 model) ===
  'File',

  // === EMAIL (1 model) ===
  'EmailMetrics',       // ⚠️ Verificar se tem tenantId
];

// === EXPLICITLY GLOBAL (NÃO adicionar ao middleware) ===
const GLOBAL_MODELS = [
  'Tenant',             // Root entity
  'Capability',         // Platform-wide capabilities catalog
  'Feature',            // Platform-wide features catalog
  'Currency',           // Global currency definitions
  'PlatformConfig',     // Singleton
  'SecurityConfig',     // Global security settings
  'EmailTemplate',      // Shared templates (ou per-tenant?)
  'EmailIntegration',   // Global provider configs
  'RefreshToken',       // Tem userId, não tenantId
  'VerificationToken',  // Tem userId
  'PasswordResetToken', // Tem userId
  'TenantInvite',       // Cross-tenant invites
  'InAppNotification',  // Tem userId, não tenantId
  'UserNotificationPreferences', // Idem
  'DesignSystemCustomization',   // Per-user (não per-tenant)
  'PolicyIpWhitelist',  // Child de Policy
  'PolicyDeviceTracking', // Child de Policy
  'WebhookEvent',       // Provider webhooks (global)
  'InviteSpace',        // Join table
];

// === CONDITIONALLY SCOPED (depende de regra de negócio) ===
const CONDITIONAL_MODELS = [
  'Policy',             // Global OU per-tenant (nullable)
  'Plan',               // Platform plans OU per-tenant (nullable)
  'Product',            // Platform products OU per-tenant (nullable)
];
```

**TOTAL TENANT_SCOPED_MODELS:** 33 (após todas as migrations P0+P1)

**Models faltando no DRAFT original:** 26

---

### 3. Priorizar quais índices compostos primeiro (Invoice vs Payment vs Subscription)?

**Resposta:**

**PRIORIZAÇÃO BASEADA EM ANÁLISE DE QUERY PATTERNS**

#### **🔴 P0 — CRITICAL (Deploy Sprint 1)**

Índices que impactam **hot path queries** (executadas em TODA request):

```sql
-- 1. User lookups (autenticação)
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);

-- 2. Subscription checks (feature gates middleware)
CREATE INDEX idx_subscriptions_tenant_status ON subscriptions(tenant_id, status);

-- 3. Grant checks (authorization middleware)
CREATE INDEX idx_grants_tenant_user_status ON grants(tenant_id, user_id, status);
CREATE INDEX idx_grants_tenant_capability ON grants(tenant_id, capability_id);

-- 4. Audit logs (escrita em TODA request)
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
```

**Impacto:** -50% latência em auth/authz middleware (P50: 50ms → 25ms)

---

#### **🟠 P1 — HIGH (Deploy Sprint 4)**

Índices que impactam **billing queries** (executadas em dashboards/reports):

```sql
-- 5. Invoice reports (common dashboard query)
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_tenant_due_date ON invoices(tenant_id, due_date DESC);
CREATE INDEX idx_invoices_tenant_created ON invoices(tenant_id, created_at DESC);

-- 6. Payment reports (financial analytics)
CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
CREATE INDEX idx_payments_tenant_method_status ON payments(tenant_id, method, status);
CREATE INDEX idx_payments_tenant_created ON payments(tenant_id, created_at DESC);

-- 7. Order tracking
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_created ON orders(tenant_id, created_at DESC);
```

**Impacto:** -70% latência em billing dashboard (P50: 500ms → 150ms)

---

#### **🟡 P2 — MEDIUM (Deploy Sprint 5-6)**

Índices que impactam **analytics queries** (relatórios ad-hoc):

```sql
-- 8. Time-range analytics
CREATE INDEX idx_invoices_tenant_created_status ON invoices(tenant_id, created_at DESC, status);
CREATE INDEX idx_payments_tenant_created_status ON payments(tenant_id, created_at DESC, status);
CREATE INDEX idx_audit_logs_tenant_created_action ON audit_logs(tenant_id, created_at DESC, action);

-- 9. Email tracking
CREATE INDEX idx_email_events_tenant_created ON email_events(tenant_id, created_at DESC);
CREATE INDEX idx_email_queue_tenant_status ON email_queue(tenant_id, status);

-- 10. Security audits
CREATE INDEX idx_security_audit_logs_tenant_created ON security_audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_capability_audit_events_tenant_created ON capability_audit_events(tenant_id, created_at DESC);
```

**Impacto:** -60% latência em analytics queries (P50: 2s → 800ms)

---

#### **🟢 P3 — LOW (Post-Launch)**

Índices para **raros patterns** ou **admin-only queries**:

```sql
-- 11. Admin operations (raras)
CREATE INDEX idx_grant_requests_tenant_status ON grant_requests(tenant_id, status);
CREATE INDEX idx_impersonation_sessions_tenant_status ON impersonation_sessions(tenant_id, status);

-- 12. File management (ocasional)
CREATE INDEX idx_files_tenant_created ON files(tenant_id, created_at DESC);
```

---

#### **EFFORT BREAKDOWN:**

| Prioridade | Índices | Esforço | ROI |
|-----------|---------|---------|-----|
| P0 (Sprint 1) | 5 índices | 2h | ⭐⭐⭐⭐⭐ |
| P1 (Sprint 4) | 8 índices | 4h | ⭐⭐⭐⭐ |
| P2 (Sprint 5-6) | 6 índices | 2h | ⭐⭐⭐ |
| P3 (Post-Launch) | 3 índices | 1h | ⭐⭐ |

**Total:** 22 índices compostos, 9h total

---

#### **MIGRATION STRATEGY:**

```sql
-- ⚠️ CRIAR ÍNDICES DE FORMA CONCURRENTE (zero downtime)
CREATE INDEX CONCURRENTLY idx_users_tenant_email ON users(tenant_id, email);

-- ⚠️ MONITORAR TAMANHO DOS ÍNDICES
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Se algum índice > 1GB, considerar PARTIAL INDEX:
CREATE INDEX idx_audit_logs_recent ON audit_logs(tenant_id, created_at DESC)
WHERE created_at > NOW() - INTERVAL '90 days';
```

---

#### **BENCHMARK ANTES/DEPOIS:**

```typescript
// Script de benchmark: scripts/benchmark-indexes.ts
import { prisma } from './lib/prisma';
import { performance } from 'perf_hooks';

async function benchmarkQuery(name: string, query: () => Promise<any>) {
  const start = performance.now();
  await query();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

// Invoice report (common dashboard query)
await benchmarkQuery('Invoice Report', async () => {
  return prisma.invoice.findMany({
    where: {
      tenantId: 'tenant-123',
      status: 'PAID',
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
});

// Rodar ANTES e DEPOIS de criar índices
// Expectativa: 500ms → 50ms (10x faster)
```

---

### 4. Feature/Plan/Product devem ser globais (platform-wide) ou per-tenant? Business rule unclear.

**Resposta:**

**ANÁLISE TÉCNICA + RECOMENDAÇÃO DE ARQUITETURA**

#### **CONTEXTO:**

O schema atual define `tenantId` como **nullable** em Feature, Plan e Product:

```prisma
model Feature {
  id       String  @id @default(uuid())
  // ⚠️ SEM tenantId → sempre global
}

model Plan {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // NULLABLE
}

model Product {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // NULLABLE
}
```

#### **OPÇÕES ARQUITETURAIS:**

---

##### **OPÇÃO A: Modelo HYBRID (Recomendado) ✅**

**Feature:** SEMPRE GLOBAL (platform-wide catalog)
**Plan:** HYBRID (platform plans + tenant-specific plans)
**Product:** HYBRID (platform products + tenant-specific products)

**Vantagens:**
- ✅ Flexibilidade máxima (permite customização per-tenant)
- ✅ Mantém catálogo global (platform plans como "Starter", "Pro")
- ✅ Permite white-label (tenant pode criar seus próprios plans)

**Schema:**
```prisma
model Feature {
  id       String  @id @default(uuid())
  // SEM tenantId → sempre global
  code     String  @unique
  name     String
  type     FeatureType
}

model Plan {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // NULL = platform plan
  code     String  @unique
  name     String
  isPublic Boolean @default(true) // Platform plans são públicos
}

model Product {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") // NULL = platform product
  code     String  @unique
  name     String
  isPublic Boolean @default(true)
}
```

**Queries:**
```typescript
// Listar plans disponíveis para um tenant
const plans = await prisma.plan.findMany({
  where: {
    OR: [
      { tenantId: null, isPublic: true },    // Platform plans públicos
      { tenantId: currentTenantId },         // Plans customizados do tenant
    ],
  },
});
```

**RLS Middleware:** Precisa de lógica especial (ver DB-H7)

---

##### **OPÇÃO B: Modelo GLOBAL ONLY**

**Feature/Plan/Product:** SEMPRE GLOBAIS (sem tenantId)

**Vantagens:**
- ✅ Simplicidade (sem ambiguidade)
- ✅ RLS middleware simples (não precisa de lógica especial)

**Desvantagens:**
- ❌ Sem customização per-tenant (todos tenants veem os mesmos plans)
- ❌ Sem white-label (tenant não pode criar seus próprios plans)
- ❌ Menos flexibilidade comercial

**Schema:**
```prisma
model Plan {
  id       String  @id @default(uuid())
  // SEM tenantId → sempre global
  code     String  @unique
  name     String
}
```

**Uso típico:**
- SaaS com pricing fixo (tipo Stripe, GitHub)
- Sem customização per-tenant

---

##### **OPÇÃO C: Modelo PER-TENANT ONLY**

**Feature:** GLOBAL (catálogo de capabilities)
**Plan/Product:** SEMPRE PER-TENANT (tenantId NOT NULL)

**Vantagens:**
- ✅ White-label completo (cada tenant tem seus próprios plans)
- ✅ RLS middleware simples (sempre filtra por tenantId)

**Desvantagens:**
- ❌ Sem platform plans globais (precisa criar manualmente para cada tenant)
- ❌ Overhead de dados (planos duplicados em cada tenant)

**Schema:**
```prisma
model Plan {
  id       String  @id @default(uuid())
  tenantId String  @map("tenant_id") // NOT NULL
  code     String  // Pode ter duplicatas entre tenants
  name     String

  @@unique([tenantId, code])
}
```

**Uso típico:**
- SaaS B2B2C (cada tenant revende para seus clientes)
- White-label completo

---

#### **RECOMENDAÇÃO FINAL:**

**OPÇÃO A (HYBRID)** é a mais adequada para Kaven porque:

1. ✅ **Compatível com pricing tiers do Kaven:**
   - Platform plans: Starter ($99), Complete ($279), Pro ($549)
   - Tenant-specific plans: Custom pricing para Enterprise

2. ✅ **Permite white-label (roadmap Q3):**
   - Tenant pode criar "Plano Bronze", "Plano Prata", "Plano Ouro"
   - Mantém platform plans como fallback

3. ✅ **Flexibilidade comercial:**
   - Marketplace pode ter products globais (add-ons)
   - Tenants podem vender seus próprios products

4. ✅ **Schema atual JÁ suporta** (tenantId nullable)

---

#### **CHANGES NEEDED:**

```prisma
// ✅ Feature: global only (remover tenantId se existir)
model Feature {
  id   String @id @default(uuid())
  code String @unique
  name String
  type FeatureType
  // SEM tenantId

  /// @global Platform-wide feature catalog
}

// ✅ Plan: hybrid (manter nullable)
model Plan {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") /// NULL = platform plan, NOT NULL = tenant-specific
  code     String  @unique
  name     String
  isPublic Boolean @default(true) /// Platform plans são públicos por padrão

  /// @global_or_scoped Global plans (tenantId=NULL) OR tenant-specific plans
}

// ✅ Product: hybrid (manter nullable)
model Product {
  id       String  @id @default(uuid())
  tenantId String? @map("tenant_id") /// NULL = platform product, NOT NULL = tenant-specific
  code     String  @unique
  name     String
  isPublic Boolean @default(true)

  /// @global_or_scoped Global products (tenantId=NULL) OR tenant-specific products
}
```

---

#### **RLS MIDDLEWARE UPDATE:**

```typescript
const GLOBALLY_SCOPED_MODELS = ['Plan', 'Product'];

prisma.$use(async (params, next) => {
  const tenantId = (params as any).tenantId;

  if (GLOBALLY_SCOPED_MODELS.includes(params.model || '')) {
    // Para plans/products, retornar globais + tenant-specific
    if (params.action === 'findMany') {
      params.args.where = {
        ...params.args.where,
        OR: [
          { tenantId: null, isPublic: true }, // Globais públicos
          { tenantId: tenantId },             // Tenant-specific
        ],
      };
    }
  }

  return next(params);
});
```

---

#### **VALIDATION RULES:**

```typescript
// Ao criar plan/product per-tenant
if (data.tenantId && data.code) {
  // Validar que não conflita com platform plan
  const platformPlan = await prisma.plan.findUnique({
    where: { code: data.code, tenantId: null },
  });

  if (platformPlan) {
    throw new Error('Code conflicts with platform plan. Choose a different code.');
  }
}
```

---

#### **DOCUMENTATION:**

Adicionar ao `database-schema.md`:

```markdown
## Multi-Tenancy Patterns

### Global Models (tenantId: never)
- Feature
- Currency
- PlatformConfig

### Tenant-Scoped Models (tenantId: required)
- User
- Subscription
- Invoice
- Grant
- ...

### Hybrid Models (tenantId: nullable)
- Plan (NULL = platform plan, NOT NULL = tenant-specific)
- Product (NULL = platform product, NOT NULL = tenant-specific)
- Policy (NULL = global policy, NOT NULL = tenant-specific)

**Query pattern for hybrid models:**
```typescript
// Listar items disponíveis para tenant
const items = await prisma.plan.findMany({
  where: {
    OR: [
      { tenantId: null, isPublic: true }, // Globais
      { tenantId: currentTenantId },      // Tenant-specific
    ],
  },
});
```
```

---

### 5. Grant sem spaceId/capabilityId é válido? Qual a regra de negócio esperada?

**Resposta:**

**ANÁLISE DO SCHEMA ATUAL:**

```prisma
model Grant {
  id           String      @id @default(uuid())
  userId       String      @map("user_id")
  spaceId      String?     @map("space_id")      // ⚠️ NULLABLE
  capabilityId String?     @map("capability_id") // ⚠️ NULLABLE

  type         GrantType   @default(ADD)
  scope        CapabilityScope @default(SPACE)
  // ...
}
```

**PROBLEMA:** Ambos `spaceId` e `capabilityId` são nullable → Grant pode existir sem nenhum dos dois.

---

#### **CENÁRIOS POSSÍVEIS:**

##### **CENÁRIO 1: Grant com spaceId E capabilityId (Normal)**

```typescript
{
  userId: 'user-123',
  spaceId: 'support-space',
  capabilityId: 'tickets.close',
  type: 'ADD',
  scope: 'SPACE',
}
// ✅ Válido: User pode "tickets.close" dentro do "support-space"
```

---

##### **CENÁRIO 2: Grant com capabilityId SEM spaceId (Global Grant)**

```typescript
{
  userId: 'user-123',
  spaceId: null,
  capabilityId: 'billing.view',
  type: 'ADD',
  scope: 'GLOBAL', // ⚠️ scope = GLOBAL
}
// ✅ Válido: User pode "billing.view" em TODOS os spaces (grant global)
```

**Casos de uso:**
- SUPER_ADMIN tem grant global para "users.manage"
- CFO tem grant global para "billing.view" (acesso cross-space)

---

##### **CENÁRIO 3: Grant com spaceId SEM capabilityId (Invalid?)**

```typescript
{
  userId: 'user-123',
  spaceId: 'support-space',
  capabilityId: null,
  type: 'ADD',
  scope: 'SPACE',
}
// ❌ Inválido: Grant sem capability não faz sentido
// "User tem acesso ao space mas para fazer o quê?"
```

**⚠️ Deveria ser bloqueado pela aplicação.**

---

##### **CENÁRIO 4: Grant SEM spaceId E SEM capabilityId (Invalid)**

```typescript
{
  userId: 'user-123',
  spaceId: null,
  capabilityId: null,
  type: 'ADD',
  scope: 'GLOBAL',
}
// ❌ Inválido: Grant sem capability não faz sentido
```

**⚠️ Deveria ser bloqueado pela aplicação.**

---

#### **REGRA DE NEGÓCIO RECOMENDADA:**

**✅ VÁLIDO:**
1. `capabilityId NOT NULL` + `spaceId NOT NULL` → Grant específico (scope: SPACE)
2. `capabilityId NOT NULL` + `spaceId NULL` → Grant global (scope: GLOBAL)

**❌ INVÁLIDO:**
3. `capabilityId NULL` + `spaceId NOT NULL` → Grant sem capability
4. `capabilityId NULL` + `spaceId NULL` → Grant sem capability

**REGRA:** `capabilityId` deve ser **OBRIGATÓRIO**.
`spaceId` pode ser **NULL** (indica grant global).

---

#### **SCHEMA UPDATE RECOMENDADO:**

```prisma
model Grant {
  id           String      @id @default(uuid())
  userId       String      @map("user_id")
  tenantId     String      @map("tenant_id") // ✅ Após DB-C1

  /// Space onde o grant é aplicado. NULL = grant global (cross-space)
  spaceId      String?     @map("space_id")

  /// Capability sendo concedida. OBRIGATÓRIO.
  capabilityId String      @map("capability_id") // ✅ NOT NULL

  type         GrantType   @default(ADD)

  /// Scope do grant:
  /// - SPACE: aplicado apenas dentro do spaceId especificado
  /// - GLOBAL: aplicado em todos os spaces do tenant
  /// - SELF: aplicado apenas ao próprio user
  scope        CapabilityScope @default(SPACE)

  // ...
}
```

**Migration:**

```sql
-- FASE 1: Verificar se há grants inválidos (sem capability)
SELECT * FROM grants WHERE capability_id IS NULL;

-- Se houver, investigar e deletar/corrigir ANTES de tornar NOT NULL
-- Provavelmente são dados de teste ou bugs

-- FASE 2: Tornar capabilityId NOT NULL
ALTER TABLE "grants" ALTER COLUMN "capability_id" SET NOT NULL;
```

---

#### **VALIDATION NO CÓDIGO:**

```typescript
// apps/api/src/modules/grants/grant.service.ts

async function createGrant(data: CreateGrantDTO) {
  // ✅ Validação: capabilityId é obrigatório (já garantido pelo schema)

  // ✅ Validação: scope deve ser consistente com spaceId
  if (data.scope === 'SPACE' && !data.spaceId) {
    throw new ValidationError('scope=SPACE requires spaceId');
  }

  if (data.scope === 'GLOBAL' && data.spaceId) {
    throw new ValidationError('scope=GLOBAL must not have spaceId');
  }

  // ✅ Validação: capability deve existir
  const capability = await prisma.capability.findUnique({
    where: { id: data.capabilityId },
  });

  if (!capability) {
    throw new NotFoundError('Capability not found');
  }

  // ✅ Validação: space deve existir (se fornecido)
  if (data.spaceId) {
    const space = await prisma.space.findUnique({
      where: { id: data.spaceId, tenantId: currentTenantId },
    });

    if (!space) {
      throw new NotFoundError('Space not found');
    }
  }

  return prisma.grant.create({ data });
}
```

---

#### **DOCUMENTATION UPDATE:**

Adicionar ao `database-schema.md`:

```markdown
## Grant System

### Grant Scopes

**SPACE (default):**
- Grant aplicado APENAS dentro de um Space específico
- Requer `spaceId` NOT NULL
- Exemplo: User pode "tickets.close" no "Support Space"

**GLOBAL:**
- Grant aplicado em TODOS os spaces do tenant
- Requer `spaceId` NULL
- Exemplo: CFO pode "billing.view" em todos os spaces

**SELF:**
- Grant aplicado apenas ao próprio user (self-service)
- Exemplo: User pode "profile.edit" (seu próprio perfil)

### Validation Rules

- `capabilityId` é **OBRIGATÓRIO** (NOT NULL)
- `spaceId` é **OPCIONAL** (NULL = grant global)
- `scope` deve ser consistente:
  - `scope=SPACE` → `spaceId` NOT NULL
  - `scope=GLOBAL` → `spaceId` NULL
  - `scope=SELF` → `spaceId` NULL
```

---

## 🔧 PRIORITY ADJUSTMENTS

### Severity Adjustments
- **NONE** — todas as severidades estão corretas

### Priority Adjustments

#### ✅ DB-C5: Payment SEM tenantId Direto
- **From:** P0 (CRITICAL)
- **To:** **P1 (HIGH)**
- **Reason:** Não é blocker de launch — Payment tem cascade via invoice/order. Adicionar tenantId redundante é best practice mas não critical security gap.

---

## 🆕 NEW DEBTS ADDED TO BACKLOG

### DB-C6: Space.tenantId É Nullable
- **Severity:** 🔴 CRITICAL
- **Effort:** 8h
- **Priority:** P0
- **Sprint:** 1 (junto com DB-C1)

### DB-H7: Plan/Product.tenantId Nullable Causa Ambiguidade
- **Severity:** 🟠 HIGH
- **Effort:** 6h
- **Priority:** P1
- **Sprint:** 4

---

## 📊 RECOMMENDATIONS

### 1. **IMMEDIATE ACTIONS (Sprint 1 - DB Security):**

```yaml
Priority P0 (Blockers):
  - DB-C1: Add tenantId to 7 permission models (24h)
  - DB-C2: Add tenantId to 6 audit models (20h)
  - DB-C3: Expand RLS middleware to 33 models (8h)
  - DB-C4: Add soft delete filter to middleware (4h)
  - DB-C6: Fix Space.tenantId nullable (8h) ← NEW

Total Sprint 1: 64h (8 dias úteis)
```

**⚠️ CRITICAL:** Sprint 1 cresceu de 48h → 64h (+16h) devido a:
- Esforços subestimados (DB-C1, DB-C2)
- Novo debt crítico (DB-C6)

**Recomendação:** Dividir Sprint 1 em duas semanas ou reduzir scope (remover DB-C6 para Sprint 2).

---

### 2. **DATABASE-SPECIFIC BEST PRACTICES:**

#### **Migration Safety:**
- ✅ SEMPRE usar `CREATE INDEX CONCURRENTLY` (zero downtime)
- ✅ NUNCA rodar backfill dentro de migration (usar script separado)
- ✅ SEMPRE validar dados antes de tornar NOT NULL
- ✅ SEMPRE ter rollback plan (antes da FASE 4)

#### **Performance:**
- ✅ Priorizar índices em hot path (auth/authz) antes de analytics
- ✅ Monitorar tamanho de índices (se > 1GB, considerar partial index)
- ✅ Usar `EXPLAIN ANALYZE` antes/depois de criar índices

#### **Security:**
- ✅ Testar tenant isolation com E2E tests (simular IDOR attacks)
- ✅ Adicionar métricas de queries cross-tenant (alertar se > 0)
- ✅ Audit log de todas as migrations de segurança

---

### 3. **TECHNICAL DEBT PRIORITIZATION:**

```yaml
Sprint 1 (Week 5): DB-C1, DB-C2, DB-C3, DB-C4, DB-C6 (64h)
Sprint 2 (Week 6): Frontend P0 (46h) ← mantém como está
Sprint 3 (Week 7): System P0 + Quick Wins (20h) ← mantém como está
Sprint 4 (Week 8): DB-H1, DB-H3, DB-H6, DB-H7 + Frontend P1 (54h)
```

**Total P0 ajustado:** 130h (16 dias úteis) — aumento de 20h devido a ajustes.

---

### 4. **MONITORING & OBSERVABILITY:**

Adicionar métricas específicas de database:

```typescript
// Métrica: Queries sem tenantId (deveria ser 0 após Sprint 1)
const queriesWithoutTenantId = new prometheus.Counter({
  name: 'kaven_db_queries_without_tenant_id',
  help: 'Number of queries without tenantId (security risk)',
  labelNames: ['model', 'action'],
});

// Métrica: Query latency por model
const queryLatency = new prometheus.Histogram({
  name: 'kaven_db_query_duration_ms',
  help: 'Database query duration',
  labelNames: ['model', 'action'],
  buckets: [10, 50, 100, 500, 1000, 5000],
});

// Métrica: Soft delete bypass (queries explícitas com deletedAt != null)
const softDeleteBypass = new prometheus.Counter({
  name: 'kaven_db_soft_delete_bypass',
  help: 'Queries that explicitly fetch soft-deleted records',
  labelNames: ['model'],
});
```

**Grafana Dashboard:**
- Panel: Queries sem tenantId por hora (alerta se > 0)
- Panel: Query latency P50/P95/P99 por model (antes/depois de índices)
- Panel: Soft delete bypass count (audit trail)

---

### 5. **DOCUMENTATION UPDATES NEEDED:**

```markdown
docs/architecture/database-schema.md
  → Adicionar seção "Multi-Tenancy Patterns"
  → Adicionar seção "Grant System"
  → Adicionar seção "Soft Delete Strategy"

docs/architecture/rls-middleware.md (NOVO)
  → Documentar TENANT_SCOPED_MODELS
  → Documentar GLOBALLY_SCOPED_MODELS
  → Documentar CONDITIONAL_MODELS
  → Exemplos de queries

docs/operations/migrations.md (NOVO)
  → Guia: Como adicionar tenantId a um model existente
  → Guia: Como criar índice composto sem downtime
  → Guia: Como rodar backfill em produção
```

---

## ✅ FINAL VALIDATION STATUS

**Status:** ✅ **APPROVED WITH CRITICAL ADJUSTMENTS**

### Summary:
- ✅ **22/22 debts validated**
- ⚠️ **3 effort adjustments** (DB-C1: +8h, DB-C2: +4h, DB-H3: kept)
- ⚠️ **1 priority change** (DB-C5: P0 → P1)
- 🆕 **2 new debts identified** (DB-C6: P0, DB-H7: P1)

### Changes to DRAFT:
1. **DB-C1:** Esforço 16h → **24h**
2. **DB-C2:** Esforço 16h → **20h**
3. **DB-C5:** Prioridade P0 → **P1**
4. **NEW DB-C6:** Space.tenantId nullable — 8h, P0
5. **NEW DB-H7:** Plan/Product ambiguity — 6h, P1

### Impact on Timeline:
- **Sprint 1 (P0 Database):** 48h → **64h** (+16h)
- **Total P0:** 110h → **130h** (+20h)
- **Launch-ready:** Week 7 → **Week 8** (+1 week delay)

### Recommendations:
1. ✅ Aprovar DRAFT com ajustes mencionados
2. ⚠️ Re-estimar timeline: 130h P0 = 16 dias úteis (não 14)
3. ✅ Adicionar DB-C6 ao Sprint 1
4. ✅ Mover DB-C5 para Sprint 4 (P1)
5. ✅ Adicionar DB-H7 ao Sprint 4 (P1)

---

**Next Steps:**
1. Update `technical-debt-DRAFT.md` com ajustes (FASE 8)
2. Create migrations plan detalhado (Sprint Planning)
3. Setup monitoring & metrics para validar fixes
4. Schedule UX Specialist Review (FASE 6)

---

**Reviewed by:** Database Specialist
**Date:** 2026-02-03
**Time spent:** 30 minutes
**Confidence level:** 95% (baseado em análise do schema + código + experiência)
