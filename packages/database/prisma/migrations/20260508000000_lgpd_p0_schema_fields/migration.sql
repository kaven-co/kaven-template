-- LGPD P0 Schema Fields Migration
-- Débitos: lgpd-terms-acceptance-tracking, lgpd-gdpr-delete-field,
--          lgpd-security-audit-retention, lgpd-data-export-tenant-isolation
-- Refs: LGPD Art. 7, 8, 9, 15, 16, 18, 37

-- ============================================================
-- 1. User — Terms acceptance tracking (LGPD Art. 7, 8)
-- ============================================================
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "terms_accepted_at"       TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "privacy_accepted_at"     TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "privacy_policy_version"  TEXT,
  ADD COLUMN IF NOT EXISTS "gdpr_delete_requested_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_gdpr_delete_requested_at_idx"
  ON "User" ("gdpr_delete_requested_at")
  WHERE "gdpr_delete_requested_at" IS NOT NULL;

-- ============================================================
-- 2. SecurityAuditLog — Retention policy (LGPD Art. 15, 16)
-- ============================================================
ALTER TABLE "SecurityAuditLog"
  ADD COLUMN IF NOT EXISTS "retentionUntil" TIMESTAMP(3);

-- Backfill: registros existentes recebem TTL de 2 anos a partir de createdAt
UPDATE "SecurityAuditLog"
SET "retentionUntil" = "createdAt" + INTERVAL '2 years'
WHERE "retentionUntil" IS NULL;

CREATE INDEX IF NOT EXISTS "SecurityAuditLog_retentionUntil_idx"
  ON "SecurityAuditLog" ("retentionUntil")
  WHERE "retentionUntil" IS NOT NULL;

-- ============================================================
-- 3. DataExportLog — Tenant isolation (LGPD Art. 37)
-- ============================================================
ALTER TABLE "data_export_logs"
  ADD COLUMN IF NOT EXISTS "tenant_id" TEXT;

-- Backfill: popula tenant_id via join com User
UPDATE "data_export_logs" del
SET "tenant_id" = u."tenantId"
FROM "User" u
WHERE del."user_id" = u."id"
  AND del."tenant_id" IS NULL
  AND u."tenantId" IS NOT NULL;

-- Tornar NOT NULL após backfill (linhas sem tenant ficam como NULL — tratar manualmente se necessário)
-- ALTER TABLE "data_export_logs" ALTER COLUMN "tenant_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "data_export_logs_tenant_id_idx"
  ON "data_export_logs" ("tenant_id");

CREATE INDEX IF NOT EXISTS "data_export_logs_tenant_id_created_at_idx"
  ON "data_export_logs" ("tenant_id", "created_at");

-- Foreign key para Tenant
ALTER TABLE "data_export_logs"
  ADD CONSTRAINT "data_export_logs_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE
  DEFERRABLE INITIALLY DEFERRED;
