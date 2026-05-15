-- LGPD P0 — DataExportLog.tenant_id: enforce NOT NULL constraint
-- Pre-condition: backfill already ran in migration 20260508000000
--
-- Safe to apply after verifying:
--   SELECT COUNT(*) FROM data_export_logs WHERE tenant_id IS NULL;
-- Expected result: 0 rows
--
-- New rows always include tenantId via lgpdService.exportUserData —
-- no risk of NULL insertion after this constraint is applied.

DO $$
BEGIN
  -- Validate backfill is complete before enforcing NOT NULL
  IF (SELECT COUNT(*) FROM "data_export_logs" WHERE "tenant_id" IS NULL) > 0 THEN
    RAISE EXCEPTION
      'Cannot apply NOT NULL: % rows still have NULL tenant_id in data_export_logs. '
      'Run backfill from migration 20260508000000 first.',
      (SELECT COUNT(*) FROM "data_export_logs" WHERE "tenant_id" IS NULL);
  END IF;
END $$;

ALTER TABLE "data_export_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
