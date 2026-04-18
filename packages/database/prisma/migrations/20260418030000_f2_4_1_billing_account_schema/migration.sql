-- F2.4.1 Schema Phase 1 — Multi-Workspace Ownership (backward-compatible).
--
-- Cria a nova entidade BillingAccount + FKs nullable em Tenant/Subscription
-- + Feature.scope enum. Zero breakage: todas as colunas novas são nullable
-- e Feature.scope tem default TENANT (comportamento atual preservado).
--
-- Ver docs/planning/stories/epic-4-framework/sprint-f2/F2.4-multi-workspace-ownership-model.md
-- Depende de: F2.4.0 (audit script APROVADO — sem blockers).
-- Próximo passo: F2.4.2 (backfill data + Stripe Customer migration).
--
-- Rollback: ALTER TABLE ... DROP COLUMN billing_account_id (reverso de tudo
-- abaixo). Seguro porque todas as colunas são nullable com FK ON DELETE SET NULL.

-- 1. Enum novo: FeatureScope
CREATE TYPE "FeatureScope" AS ENUM ('TENANT', 'BILLING_ACCOUNT');

-- 2. Tabela nova: billing_accounts
CREATE TABLE "billing_accounts" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "billing_accounts_pkey" PRIMARY KEY ("id")
);

-- Índices de billing_accounts
CREATE UNIQUE INDEX "billing_accounts_stripe_customer_id_key" ON "billing_accounts"("stripe_customer_id");
CREATE INDEX "billing_accounts_owner_user_id_idx" ON "billing_accounts"("owner_user_id");
CREATE INDEX "billing_accounts_stripe_customer_id_idx" ON "billing_accounts"("stripe_customer_id");
CREATE INDEX "billing_accounts_deleted_at_idx" ON "billing_accounts"("deleted_at");

-- FK billing_accounts.owner_user_id → User(id). ON DELETE RESTRICT previne
-- remoção de usuário enquanto ele for dono de qualquer BA (proteção de billing).
ALTER TABLE "billing_accounts"
    ADD CONSTRAINT "billing_accounts_owner_user_id_fkey"
    FOREIGN KEY ("owner_user_id") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Tenant.billing_account_id (nullable FK)
ALTER TABLE "Tenant" ADD COLUMN "billing_account_id" TEXT;

CREATE INDEX "Tenant_billing_account_id_idx" ON "Tenant"("billing_account_id");

ALTER TABLE "Tenant"
    ADD CONSTRAINT "Tenant_billing_account_id_fkey"
    FOREIGN KEY ("billing_account_id") REFERENCES "billing_accounts"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Subscription.billing_account_id (nullable FK)
ALTER TABLE "subscriptions" ADD COLUMN "billing_account_id" TEXT;

CREATE INDEX "subscriptions_billing_account_id_idx" ON "subscriptions"("billing_account_id");

ALTER TABLE "subscriptions"
    ADD CONSTRAINT "subscriptions_billing_account_id_fkey"
    FOREIGN KEY ("billing_account_id") REFERENCES "billing_accounts"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Feature.scope com default TENANT (preserva comportamento atual)
ALTER TABLE "features" ADD COLUMN "scope" "FeatureScope" NOT NULL DEFAULT 'TENANT';

-- 6. Seed update: MAX_TENANTS passa a ser BILLING_ACCOUNT-scoped.
-- EntitlementService.resolveQuotaCurrentUsage (refactor em F2.4.4) vai
-- despachar para contagem por billingAccountId quando scope=BILLING_ACCOUNT.
UPDATE "features" SET "scope" = 'BILLING_ACCOUNT' WHERE "code" = 'MAX_TENANTS';
