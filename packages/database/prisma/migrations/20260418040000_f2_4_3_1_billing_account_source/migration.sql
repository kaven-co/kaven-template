-- F2.4.3.1 — Add `source` column to `billing_accounts` to distinguish
-- origin of records (signup flow vs backfill). This makes rollback safe:
-- `f2-4-rollback.sql` can delete ONLY backfill-origin BAs without losing
-- data created by F2.4.3 signup flow.
--
-- Default 'signup' is safe for existing rows because in the window where
-- F2.4.3 is live:
--   - BAs created via signup get default 'signup' ✓
--   - BAs created by backfill script will SET source = 'backfill_f2_4_2' explicitly
-- For rows that already exist BEFORE this migration, we assume they came from
-- signup (F2.4.3 was merged first in #121, backfill script not yet executed in prod).
-- If this migration runs AFTER backfill already ran in some environment,
-- operator must manually `UPDATE billing_accounts SET source = 'backfill_f2_4_2'
-- WHERE <criteria>` before executing rollback.
--
-- ROLLBACK (manual):
--   ALTER TABLE "billing_accounts" DROP COLUMN "source";

ALTER TABLE "billing_accounts"
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'signup';

-- Index not required: rollback is a rare, ad-hoc operation where full scan
-- is acceptable. Avoids bloat on a column with 2 possible values.
