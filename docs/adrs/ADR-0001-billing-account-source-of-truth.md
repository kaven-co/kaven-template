# ADR-0001 — BillingAccount como source of truth para stripeCustomerId durante transição F2.4

**Status:** Accepted
**Date:** 2026-04-18
**Context:** F2.4 Multi-Workspace Ownership migration (F2.4.1 → F2.4.5)
**Supersedes:** none
**Related:** F2.4.3.1 hardening story

## Contexto

A migração F2.4 introduz a entidade `BillingAccount` entre `User` e `Tenant`. Historicamente, `stripeCustomerId` morava em duas colunas:

- `Tenant.stripeCustomerId` (adicionado em PR #114 / migration 20260411000000, TD-15)
- `Subscription.stripeCustomerId` (legado ainda mais antigo)

F2.4.1 adicionou uma terceira: `BillingAccount.stripeCustomerId`, com `@unique` constraint.

Durante a transição (F2.4.1 → F2.4.5) as três colunas coexistem, criando risco de **divergência silenciosa**:

- PR #121 (F2.4.3) signup escrevia em **ambos** `Tenant.stripeCustomerId` e `BillingAccount.stripeCustomerId`.
- Checkout escrevia em **um dos dois** dependendo se `Tenant.billingAccountId` estava setado.
- Webhooks e jobs futuros poderiam ler de qualquer uma.

QA sweep de 2026-04-18 (architecture-strategist + data-integrity-guardian + security-sentinel) identificou isso como blocker convergente. Sem uma regra clara, cada consumer escolhe sua própria fonte e diverge-se lentamente em produção.

## Decisão

**Quando `Tenant.billingAccountId IS NOT NULL`, `BillingAccount.stripeCustomerId` é a ÚNICA fonte de escrita autoritativa para o Stripe Customer ID daquele tenant.**

Corolários operacionais:

1. **Signup (novos tenants pós-F2.4.3.1)**: escreve o `stripeCustomerId` **apenas** em `BillingAccount`. Não toca em `Tenant.stripeCustomerId`.

2. **Checkout**:
   - Leitura com fallback tri-camada: `BillingAccount.stripeCustomerId` → `Tenant.stripeCustomerId` (legacy) → `Subscription.stripeCustomerId` (legacy).
   - Escrita sempre na camada mais alta disponível: se `billingAccountId` existe, escreve em BA; senão escreve em Tenant (tenant pré-F2.4).

3. **Tenants legacy (pré-F2.4, sem BA)**: `Tenant.stripeCustomerId` continua funcional até F2.4.5. Não serão rewritados até migração ser completa.

4. **Escritas condicionais (write-once)**: quando uma escrita em `BA.stripeCustomerId` ou `Tenant.stripeCustomerId` ocorre a partir de checkout, deve ser condicional (`WHERE stripeCustomerId IS NULL`) para evitar overwrite em cenários de IDOR ou race.

5. **Readers legados**: qualquer leitura de `Tenant.stripeCustomerId` ou `Subscription.stripeCustomerId` deve ser tratada como **fallback** e tais call-sites devem ser migrados para ler de `BillingAccount` até F2.4.5. Novos readers escritos pós-F2.4.3.1 devem ler **apenas** de `BillingAccount`.

## Consumers cobertos (F2.4.3.2)

Regras explícitas por consumer. Adicione novas entradas aqui sempre que um novo
fluxo tocar Stripe Customer/Subscription IDs.

### 1. Signup (`auth.service.register`)

- **Leitura:** nenhuma (cria do zero).
- **Escrita:** apenas `BillingAccount.stripeCustomerId`. **Nunca** escreve em `Tenant.stripeCustomerId`.
- **Idempotência:** `stripe.customers.create({ ... }, { idempotencyKey: "signup-customer-<newTenantId>" })`. Stripe call acontece **fora** do `$transaction`; falha de Stripe é não-fatal (BA fica com `stripeCustomerId = null`, checkout popula depois).
- **Race:** Stripe orphan possível só se tx DB abortar *após* Stripe ter retornado. Tratado por **sweep job** (ver seção 5).

### 2. Checkout (`POST /api/v1/checkout/sessions`)

- **Leitura (fallback tri-camada):** `BillingAccount.stripeCustomerId` → `Tenant.stripeCustomerId` (legacy) → `Subscription.stripeCustomerId` (legacy).
- **Escrita:** `updateMany({ where: { id, stripeCustomerId: null } })` write-once guard. Escreve em `BA.stripeCustomerId` se `tenant.billingAccountId` setado; senão em `Tenant.stripeCustomerId`.
- **Email na criação do Customer:** deriva de `tenant.billingAccount.owner.email` (primário) → primeiro `TENANT_ADMIN` do tenant (fallback). **Nunca** do `requestingUser.email` (billing-hijack vector).
- **AuthZ:** deny-by-default — `SUPER_ADMIN` ou `requestingUser.tenantId === tenantId` (strict). IDOR closed em F2.4.3.1 H-1.

### 3. Webhook handlers (Stripe events → Kaven DB)

- **Leitura da Subscription entrante:** `event.data.object.customer` (Customer ID) + `event.data.object.metadata.tenantId` (inserido no checkout).
- **Resolução do BillingAccount:** via `Tenant.billingAccountId`. Se `Tenant.billingAccountId IS NULL` (tenant legacy pré-F2.4 sem BA), cria entry na `Subscription` com `billingAccountId = NULL` e loga warning — não é cenário esperado pós-F2.4.5.
- **Escrita em `Subscription`:** `Subscription.billingAccountId` deve receber o valor resolvido. **Não** escreve em `Subscription.stripeCustomerId` — esse campo vira legado e é lido só em fallback. F2.4.4 implementa o `billingAccountId` setting; F2.4.5 droppa `Subscription.stripeCustomerId`.
- **Race com signup:** se webhook chega antes da tx de signup commitar (improvável mas possível com Stripe webhook retries), o webhook deve `retry` (HTTP 202) até BA existir. Stripe re-tenta com backoff automático.

### 4. Payment service (`subscription.service`, `invoice.service` futuros)

- **Leitura:** exclusivamente de `BillingAccount.stripeCustomerId` via `prisma.billingAccount.findUnique`. Não re-resolve via `Tenant.stripeCustomerId`.
- **Escrita:** nenhuma em Stripe IDs — isso fica em signup + checkout + webhook. Payment service apenas lê para invocar APIs Stripe (criar charges, update subscriptions, etc.).
- **Acesso a Subscriptions BA-scoped:** `WHERE billing_account_id = ?` (F2.4.4). Migra query patterns pré-F2.4 que usavam `WHERE tenant_id = ?`.

### 5. Jobs / Sweeps

- **`f2-4-backfill.ts`:** lê `Tenant.stripeCustomerId` legacy (para tenants pré-F2.4 sem BA) e escreve em `BillingAccount.stripeCustomerId` na BA recém-criada. Marca `source = 'backfill_f2_4_2'` para rollback isolável. **Read side effects**: nenhum. **Write side effects**: apenas criação de BA e re-link de Subscription/Tenant.
- **`stripe-orphan-sweep.ts` (F2.4.3.2):** lista Stripe Customers com `metadata.kaven = "true"` e reconcilia contra `BillingAccount.stripeCustomerId` + `Tenant.stripeCustomerId`. Reporta:
  - Órfãos reais (Customer no Stripe sem match em DB).
  - Metadata dangling (`metadata.tenantId` aponta para tenant deletado).
  Default **dry-run**; escrita destrutiva (`stripe.customers.del`) exige opt-in explícito (`--delete` + `STRIPE_SWEEP_CONFIRM=yes`).
- **Cron cadence sugerida:** semanal em prod, ad-hoc em staging. Registrar em operational playbook.

### 6. Endpoints BA-scoped (F2.4.4, preview)

- **Leitura:** exclusivamente de `BillingAccount.stripeCustomerId`. Nunca fallback para `Tenant` exceto com feature flag explícita `ALLOW_LEGACY_TENANT_STRIPE_ID=true` (pode cair em F2.4.5).
- **AuthZ:** via novo helper `canActOnBillingAccount(user, billingAccountId)` — verificará ownership, plus `SUPER_ADMIN` bypass, plus futuros `BillingAccountMember` (F2.4.6).

## Alternativas consideradas

### Alt A — Dual-write permanente
Continuar escrevendo em ambos `Tenant` e `BA` até F2.4.5 dropar `Tenant.stripeCustomerId`.
**Rejeitado**: aumenta superfície de divergência (2 escritas podem falhar independentemente), mascara bugs em readers que leem do lugar errado, e torna rollback/migration ainda mais frágil.

### Alt B — Proxy de leitura via Prisma middleware
Middleware que intercepta leituras de `Tenant.stripeCustomerId` e redireciona para `BA.stripeCustomerId`.
**Rejeitado**: mágica opaca, debugging difícil, não ajuda em raw SQL queries (backfill, audit, ops). Preferimos single-source + migração explícita.

### Alt C — Sync trigger PostgreSQL
Trigger DB que propaga escritas de um campo para o outro.
**Rejeitado**: adiciona dependência de PG-specific feature, complica migrations, não elimina o bug (ainda escrevemos em ambos).

## Consequências

### Positivas
- Fonte de verdade única elimina divergência.
- Checkout, webhooks, endpoints futuros de BA (F2.4.4) leem do mesmo lugar.
- `Tenant.stripeCustomerId` pode ser dropado em F2.4.5 sem dados em disputa.
- Testes podem validar invariante: `Tenant.stripeCustomerId IS NULL` para todo tenant pós-F2.4.3.1 com BA.

### Negativas
- Readers legados que dependem de `Tenant.stripeCustomerId` param de receber valores novos (só os backfillados permanecem).
  - **Mitigação**: grep em `apps/` e `packages/` antes de F2.4.5; migrar ou documentar cada call-site.
- Tenants criados via signup pós-F2.4.3.1 não terão `Tenant.stripeCustomerId` populado.
  - **Esperado e desejado** — esses tenants sempre têm BA.

### Invariantes mensuráveis

```sql
-- Todo tenant criado pós-F2.4.3.1 deploy tem stripeCustomerId apenas em BA.
-- Esperado: 0 rows.
SELECT t.id FROM "Tenant" t
WHERE t.created_at > '<deploy_f2_4_3_1>'
  AND t.stripe_customer_id IS NOT NULL;

-- Todo tenant com BA tem Tenant.stripeCustomerId NULL OU sincronizado com BA.
-- (Durante transição — backfill pode ter copiado; novos signups têm NULL).
-- Esperado: 0 rows (ou linhas apenas com stripeCustomerId idêntico).
SELECT t.id, t.stripe_customer_id, ba.stripe_customer_id
FROM "Tenant" t
JOIN billing_accounts ba ON ba.id = t.billing_account_id
WHERE t.stripe_customer_id IS DISTINCT FROM ba.stripe_customer_id
  AND t.stripe_customer_id IS NOT NULL;
```

## Plano de retirada (F2.4.5)

1. Grep todos os readers de `tenant.stripeCustomerId` e `subscription.stripeCustomerId`. Migrar para ler via `tenant.billingAccount.stripeCustomerId`.
2. Migration: `ALTER TABLE "Tenant" DROP COLUMN stripe_customer_id`.
3. Migration: `ALTER TABLE subscriptions DROP COLUMN stripe_customer_id`.
4. Bump schema version nos docs.

## Referências

- QA sweep report 2026-04-18 (data-integrity + architecture + security, PR #121 post-merge)
- Story `F2.4.3.1-qa-hardening.md`
- Migration `20260418030000_f2_4_1_billing_account_schema`
- Code: `apps/api/src/modules/auth/services/auth.service.ts`, `apps/api/src/modules/checkout/routes.ts`
