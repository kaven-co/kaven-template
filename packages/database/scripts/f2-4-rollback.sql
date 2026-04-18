-- F2.4.2 Rollback SQL
--
-- Reverte o backfill criado por f2-4-backfill.ts.
--
-- Uso (emergência):
--   psql $DATABASE_URL -f packages/database/scripts/f2-4-rollback.sql
--
-- IMPORTANTE: Este rollback NÃO desfaz a migração de schema F2.4.1 —
-- apenas zera os dados populados pelo backfill F2.4.2. O schema
-- (tabela billing_accounts + colunas billing_account_id) permanece.
-- Para reverter o schema também, dropar as colunas e a tabela manualmente
-- (ver rollback SQL na PR de F2.4.1 / migration 20260418030000).
--
-- Pré-requisitos:
--   - F2.4.3 signup flow NÃO estar em produção (senão novos tenants
--     seriam criados COM billing_account_id, mas eles não podem ser
--     rollback-ados por este script — apenas tenants pré-F2.4 são).
--   - F2.4.4 endpoint de POST /api/billing-accounts/:id/tenants NÃO
--     estar em uso (mesma razão).
--
-- Em outras palavras: só rode este rollback enquanto ainda estiver em
-- F2.4.2 (pré-F2.4.3). Depois de F2.4.3 em prod, o rollback seria bem
-- mais complicado e precisaria rollback coordenado do signup flow.

BEGIN;

-- 1. Zerar billing_account_id em subscriptions
UPDATE subscriptions SET billing_account_id = NULL
WHERE billing_account_id IS NOT NULL;

-- 2. Zerar billing_account_id em Tenant
UPDATE "Tenant" SET billing_account_id = NULL
WHERE billing_account_id IS NOT NULL;

-- 3. Remover BillingAccounts criadas pelo backfill.
-- Todas elas têm name igual ao Tenant correspondente e foram criadas
-- hoje. Um filtro por createdAt > '2026-04-18' é suficiente para o
-- cenário comum de rollback imediato pós-backfill.
DELETE FROM billing_accounts
WHERE created_at >= '2026-04-18 00:00:00';

-- 4. Verificação
SELECT
  (SELECT COUNT(*) FROM billing_accounts) AS billing_accounts_remaining,
  (SELECT COUNT(*) FROM "Tenant" WHERE billing_account_id IS NOT NULL) AS tenants_with_ba,
  (SELECT COUNT(*) FROM subscriptions WHERE billing_account_id IS NOT NULL) AS subs_with_ba;

-- Esperado: 0, 0, 0 para rollback completo.

COMMIT;
