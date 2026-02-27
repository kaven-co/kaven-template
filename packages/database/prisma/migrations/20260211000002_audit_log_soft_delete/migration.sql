-- Migration: Audit Log Soft Delete + Retention (STORY-019)
-- LGPD/GDPR compliance: minimum retention period for audit logs

-- Add soft delete field
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Add retention until field (default 90 days from creation)
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "retentionUntil" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '90 days');

-- Update existing records: set retentionUntil = createdAt + 90 days
UPDATE "AuditLog"
SET "retentionUntil" = "createdAt" + INTERVAL '90 days'
WHERE "retentionUntil" = (NOW() + INTERVAL '90 days');

-- Index for efficient purge job queries
CREATE INDEX IF NOT EXISTS "AuditLog_retentionUntil_idx" ON "AuditLog"("retentionUntil");
