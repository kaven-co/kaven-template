-- Extend Tenant with admin workspace settings
-- Fields added to schema.base.prisma under "Admin Extend" section

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "logo_url" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "date_format" TEXT NOT NULL DEFAULT 'YYYY-MM-DD';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "first_day_of_week" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "default_timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "sso_config" JSONB;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "wizard_state" JSONB;

-- Add module field to AuditLog for per-module audit filtering
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "module" TEXT;
CREATE INDEX IF NOT EXISTS "audit_log_module_idx" ON "AuditLog" ("module");
