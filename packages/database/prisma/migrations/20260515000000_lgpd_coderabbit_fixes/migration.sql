-- Migration: LGPD CodeRabbit fixes
-- 1. SecurityAuditLog.retentionUntil — update default to 2 years + compound index
-- 2. UserConsentRecord unique constraint — add tenantId scope

-- 1a. Update default to 2 years (was 90 days)
ALTER TABLE "SecurityAuditLog"
  ALTER COLUMN "retentionUntil" SET DEFAULT NOW() + INTERVAL '2 years';

-- 1b. Backfill any rows that still have null retentionUntil
UPDATE "SecurityAuditLog"
SET "retentionUntil" = NOW() + INTERVAL '2 years'
WHERE "retentionUntil" IS NULL;

-- 1c. Compound index for tenant-scoped retention expiry queries (LGPD Art. 15/16)
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_tenant_id_retentionUntil_idx"
  ON "SecurityAuditLog" ("tenant_id", "retentionUntil");

-- 2a. Drop old unique constraint (userId, purpose, version) — missing tenantId scope
ALTER TABLE "user_consent_records"
  DROP CONSTRAINT IF EXISTS "user_consent_records_user_id_purpose_version_key";

-- 2b. Add tenant-scoped unique constraint (LGPD Art. 8 — cross-tenant isolation)
ALTER TABLE "user_consent_records"
  ADD CONSTRAINT "user_consent_records_tenant_id_user_id_purpose_version_key"
  UNIQUE ("tenant_id", "user_id", "purpose", "version");
