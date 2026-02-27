-- Sprint 1 Migration: Add tenantId to Permissions and Audit Systems
-- Stories: STORY-003, STORY-004, STORY-007
-- Date: 2026-02-07
-- Description: Add tenantId to Grant, GrantRequest, Policy, Capability, SecurityAuditLog, ImpersonationSession
--              and make Space.tenantId NOT NULL

-- ==============================================================================
-- STORY-003: Add tenantId to Permissions System
-- ==============================================================================

-- Step 1: Add tenantId columns (nullable first)
ALTER TABLE "grants" ADD COLUMN "tenant_id" VARCHAR(191) NULL;
ALTER TABLE "grant_requests" ADD COLUMN "tenant_id" VARCHAR(191) NULL;
ALTER TABLE "policies" ADD COLUMN "tenant_id" VARCHAR(191) NULL;
ALTER TABLE "capabilities" ADD COLUMN "tenant_id" VARCHAR(191) NULL;

-- Step 2: Backfill existing data

-- Grants: Get tenantId from user
UPDATE "grants" g
SET "tenant_id" = u."tenantId"
FROM "User" u
WHERE g."user_id" = u."id" AND g."tenant_id" IS NULL;

-- Grant Requests: Get tenantId from requester
UPDATE "grant_requests" gr
SET "tenant_id" = u."tenantId"
FROM "User" u
WHERE gr."requester_id" = u."id" AND gr."tenant_id" IS NULL;

-- Policies: Get tenantId from first tenant (or mark as global)
-- Note: Adjust this query based on your business logic
UPDATE "policies" p
SET "tenant_id" = (SELECT "id" FROM "Tenant" ORDER BY "createdAt" LIMIT 1)
WHERE p."tenant_id" IS NULL;

-- Capabilities: Keep NULL for global capabilities (no update needed)

-- Step 3: Make NOT NULL (except Capability which stays nullable for global capabilities)
ALTER TABLE "grants" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "grant_requests" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "policies" ALTER COLUMN "tenant_id" SET NOT NULL;
-- Capabilities remains nullable

-- Step 4: Add indexes
CREATE INDEX "idx_grants_tenant_id" ON "grants"("tenant_id");
CREATE INDEX "idx_grant_requests_tenant_id" ON "grant_requests"("tenant_id");
CREATE INDEX "idx_policies_tenant_id" ON "policies"("tenant_id");
CREATE INDEX "idx_capabilities_tenant_id" ON "capabilities"("tenant_id");

-- Composite indexes for common queries
CREATE INDEX "idx_grants_tenant_user" ON "grants"("tenant_id", "user_id");
CREATE INDEX "idx_grant_requests_tenant_requester" ON "grant_requests"("tenant_id", "requester_id");

-- Step 5: Add foreign key constraints
ALTER TABLE "grants"
ADD CONSTRAINT "fk_grants_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "grant_requests"
ADD CONSTRAINT "fk_grant_requests_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "policies"
ADD CONSTRAINT "fk_policies_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "capabilities"
ADD CONSTRAINT "fk_capabilities_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- ==============================================================================
-- STORY-004: Add tenantId to Audit Systems
-- ==============================================================================

-- Step 1: Add tenantId columns (nullable first)
ALTER TABLE "SecurityAuditLog" ADD COLUMN "tenant_id" VARCHAR(191) NULL;
ALTER TABLE "impersonation_sessions" ADD COLUMN "tenant_id" VARCHAR(191) NULL;

-- Step 2: Backfill existing data

-- Security Audit Logs: Get tenantId from user
UPDATE "SecurityAuditLog" sal
SET "tenant_id" = u."tenantId"
FROM "User" u
WHERE sal."userId" = u."id" AND sal."tenant_id" IS NULL;

-- Impersonation Sessions: Get tenantId from target user
UPDATE "impersonation_sessions" is_table
SET "tenant_id" = u."tenantId"
FROM "User" u
WHERE is_table."impersonated_id" = u."id" AND is_table."tenant_id" IS NULL;

-- Step 3: Make NOT NULL
ALTER TABLE "SecurityAuditLog" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "impersonation_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Step 4: Add indexes
CREATE INDEX "idx_security_audit_logs_tenant_id" ON "SecurityAuditLog"("tenant_id");
CREATE INDEX "idx_impersonation_sessions_tenant_id" ON "impersonation_sessions"("tenant_id");

-- Composite indexes
CREATE INDEX "idx_security_audit_logs_tenant_user" ON "SecurityAuditLog"("tenant_id", "userId");

-- Step 5: Add foreign key constraints
ALTER TABLE "SecurityAuditLog"
ADD CONSTRAINT "fk_security_audit_logs_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "impersonation_sessions"
ADD CONSTRAINT "fk_impersonation_sessions_tenant"
FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE;

-- ==============================================================================
-- STORY-007: Make Space.tenantId NOT NULL
-- ==============================================================================

-- Note: Space.tenantId should already exist but might be nullable
-- Step 1: Backfill any orphaned spaces
UPDATE "spaces" s
SET "tenant_id" = (SELECT "id" FROM "Tenant" ORDER BY "createdAt" LIMIT 1)
WHERE s."tenant_id" IS NULL;

-- Step 2: Make NOT NULL
ALTER TABLE "spaces" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Verify no NULL values remain
SELECT
  'grants' as table_name, COUNT(*) as null_count FROM "grants" WHERE "tenant_id" IS NULL
UNION ALL
SELECT 'grant_requests', COUNT(*) FROM "grant_requests" WHERE "tenant_id" IS NULL
UNION ALL
SELECT 'policies', COUNT(*) FROM "policies" WHERE "tenant_id" IS NULL
UNION ALL
SELECT 'SecurityAuditLog', COUNT(*) FROM "SecurityAuditLog" WHERE "tenant_id" IS NULL
UNION ALL
SELECT 'impersonation_sessions', COUNT(*) FROM "impersonation_sessions" WHERE "tenant_id" IS NULL
UNION ALL
SELECT 'spaces', COUNT(*) FROM "spaces" WHERE "tenant_id" IS NULL;

-- Expected result: All counts should be 0 (except capabilities which can have NULL)
