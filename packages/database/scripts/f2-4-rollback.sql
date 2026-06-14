-- F2.4.2 Rollback SQL (hardened by F2.4.3.1)
--
-- Reverts the data changes made by f2-4-backfill.ts WITHOUT losing
-- BillingAccounts created by the F2.4.3 signup flow.
--
-- Key fix (F2.4.3.1 — B3): this script now filters by `source` column
-- added in migration 20260418040000. BAs created via signup
-- (source='signup') are NEVER touched. Only BAs created by the backfill
-- script (source='backfill_f2_4_2') are deleted.
--
-- Usage:
--   psql $DATABASE_URL -f packages/database/scripts/f2-4-rollback.sql
--
-- SCOPE:
--   - Does NOT roll back the F2.4.1 schema (billing_accounts table + columns).
--   - Does NOT roll back the F2.4.3.1 `source` column.
--   - Only reverts DATA populated by f2-4-backfill.ts.
--
-- Preconditions:
--   - Migration 20260418040000 must be applied (source column exists).
--   - If you applied backfill BEFORE this migration was in place, you must
--     first UPDATE rows to set `source='backfill_f2_4_2'` for backfill-origin
--     BAs, otherwise this rollback will treat them as signup BAs and skip them.
--
-- After this runs, any BA with source='signup' remains untouched; their
-- Tenant.billing_account_id and Subscription.billing_account_id links are
-- preserved.

BEGIN;

-- 1. Unlink subscriptions from BackBAs (BAs marked as backfill-origin).
UPDATE subscriptions s
SET billing_account_id = NULL
WHERE s.billing_account_id IN (
  SELECT id FROM billing_accounts WHERE source = 'backfill_f2_4_2'
);

-- 2. Unlink tenants from BackBAs.
UPDATE "Tenant" t
SET billing_account_id = NULL
WHERE t.billing_account_id IN (
  SELECT id FROM billing_accounts WHERE source = 'backfill_f2_4_2'
);

-- 3. Delete BackBAs. Signup BAs (source='signup') are preserved.
DELETE FROM billing_accounts
WHERE source = 'backfill_f2_4_2';

-- 4. Sanity check: no dangling FKs, signup BAs intact.
SELECT
  (SELECT COUNT(*) FROM billing_accounts WHERE source = 'backfill_f2_4_2') AS backfill_bas_remaining,
  (SELECT COUNT(*) FROM billing_accounts WHERE source = 'signup') AS signup_bas_preserved,
  (SELECT COUNT(*) FROM "Tenant" WHERE billing_account_id IS NOT NULL) AS tenants_still_linked,
  (SELECT COUNT(*) FROM subscriptions WHERE billing_account_id IS NOT NULL) AS subs_still_linked;

-- Expected after rollback:
--   backfill_bas_remaining = 0
--   signup_bas_preserved = <count of signup BAs, unchanged>
--   tenants_still_linked = <count of tenants with signup-created BA>
--   subs_still_linked = <count of subs belonging to signup BAs>

COMMIT;
