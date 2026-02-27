-- DB-M3: Analytics Composite Indexes
-- Adds composite indexes for analytics/dashboard queries that filter by
-- tenantId + status/action + createdAt date range.
--
-- These indexes complement the existing single-column and two-column indexes
-- added in Sprint 5-6. They specifically optimize three-column queries used
-- in dashboard charts and analytics reports.
--
-- All statements use IF NOT EXISTS to be safely idempotent.

-- Invoice: status distribution over time (dashboard charts)
CREATE INDEX IF NOT EXISTS "Invoice_tenantId_status_createdAt_idx"
  ON "Invoice" ("tenantId", "status", "createdAt");

-- AuditLog: action frequency over time (analytics)
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_action_createdAt_idx"
  ON "AuditLog" ("tenantId", "action", "createdAt");

-- SecurityAuditLog: security action frequency over time
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_tenant_id_action_createdAt_idx"
  ON "SecurityAuditLog" ("tenant_id", "action", "createdAt");

-- SecurityAuditLog: success/failure rate over time
CREATE INDEX IF NOT EXISTS "SecurityAuditLog_tenant_id_success_createdAt_idx"
  ON "SecurityAuditLog" ("tenant_id", "success", "createdAt");

-- Order: status distribution over time (dashboard charts)
CREATE INDEX IF NOT EXISTS "Order_tenantId_status_createdAt_idx"
  ON "Order" ("tenantId", "status", "createdAt");

-- EmailEvent: event type frequency over time (email analytics)
CREATE INDEX IF NOT EXISTS "email_events_tenant_id_created_at_idx"
  ON "email_events" ("tenant_id", "created_at");

CREATE INDEX IF NOT EXISTS "email_events_tenant_id_event_type_created_at_idx"
  ON "email_events" ("tenant_id", "event_type", "created_at");

-- CapabilityAuditEvent: capability usage analytics
CREATE INDEX IF NOT EXISTS "capability_audit_events_capabilityId_action_created_at_idx"
  ON "capability_audit_events" ("capability_id", "action", "created_at");

-- DB-M4: PlatformConfig defaults changed from pt-BR to en-US
-- Update existing records that still have the old hardcoded defaults.
-- This is a data migration: only updates rows that have the exact old defaults,
-- preserving any tenant-customized values.
UPDATE "PlatformConfig"
  SET "language" = 'en-US',
      "currency" = 'USD',
      "numberFormat" = '1,000.00'
  WHERE "language" = 'pt-BR'
    AND "currency" = 'BRL'
    AND "numberFormat" = '1.000,00'
    AND "tenantId" IS NULL;
