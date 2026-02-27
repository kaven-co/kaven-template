# Migration 003: Add tenantId to Permissions System

> **Status:** 📋 Planned (Not Yet Executed)
> **Priority:** P0 (LAUNCH BLOCKER)
> **Effort:** 24h
> **Risk:** HIGH (schema change + data backfill)

---

## Problem Statement

The permissions system (Grant, GrantRequest, Policy, Capability tables) was created without `tenantId` field, allowing cross-tenant data leakage.

**Security Impact:** P0 CRITICAL
- Tenant A can potentially access Tenant B permissions
- No row-level isolation enforced at database level
- Violates fundamental multi-tenancy principle

---

## Solution Overview

Add `tenantId` field to 4 tables:
1. `Grant`
2. `GrantRequest`
3. `Policy`
4. `Capability` (nullable - supports global capabilities)

---

## Migration Steps

### Step 1: Add tenantId Column (Nullable)

```sql
-- Add column as nullable first to allow existing data
ALTER TABLE grants ADD COLUMN tenant_id VARCHAR(191) NULL;
ALTER TABLE grant_requests ADD COLUMN tenant_id VARCHAR(191) NULL;
ALTER TABLE policies ADD COLUMN tenant_id VARCHAR(191) NULL;
ALTER TABLE capabilities ADD COLUMN tenant_id VARCHAR(191) NULL;
```

### Step 2: Backfill Existing Data

```sql
-- Grants: Get tenantId from user
UPDATE grants g
SET tenant_id = (
  SELECT u.tenant_id
  FROM users u
  WHERE u.id = g.user_id
)
WHERE g.tenant_id IS NULL;

-- Grant Requests: Get tenantId from requester
UPDATE grant_requests gr
SET tenant_id = (
  SELECT u.tenant_id
  FROM users u
  WHERE u.id = gr.requester_id
)
WHERE gr.tenant_id IS NULL;

-- Policies: Assign to first tenant (or delete if orphaned)
UPDATE policies p
SET tenant_id = (SELECT id FROM tenants ORDER BY created_at LIMIT 1)
WHERE p.tenant_id IS NULL;

-- Capabilities: Keep NULL for global capabilities
-- (No update needed - global capabilities remain tenantId = NULL)
```

### Step 3: Validate Backfill

```sql
-- Check for any remaining NULL values (except Capabilities)
SELECT 'grants' as table_name, COUNT(*) as null_count
FROM grants WHERE tenant_id IS NULL
UNION ALL
SELECT 'grant_requests', COUNT(*)
FROM grant_requests WHERE tenant_id IS NULL
UNION ALL
SELECT 'policies', COUNT(*)
FROM policies WHERE tenant_id IS NULL;

-- Expected result: 0 nulls for grants, grant_requests, policies
```

### Step 4: Make Column NOT NULL

```sql
-- Make tenant_id NOT NULL (except Capabilities which stays nullable)
ALTER TABLE grants MODIFY tenant_id VARCHAR(191) NOT NULL;
ALTER TABLE grant_requests MODIFY tenant_id VARCHAR(191) NOT NULL;
ALTER TABLE policies MODIFY tenant_id VARCHAR(191) NOT NULL;

-- Capabilities remains nullable to support global capabilities
```

### Step 5: Add Indexes

```sql
-- Add indexes for performance
CREATE INDEX idx_grants_tenant_id ON grants(tenant_id);
CREATE INDEX idx_grant_requests_tenant_id ON grant_requests(tenant_id);
CREATE INDEX idx_policies_tenant_id ON policies(tenant_id);
CREATE INDEX idx_capabilities_tenant_id ON capabilities(tenant_id);

-- Add composite indexes for common queries
CREATE INDEX idx_grants_tenant_user ON grants(tenant_id, user_id);
CREATE INDEX idx_grant_requests_tenant_requester ON grant_requests(tenant_id, requester_id);
```

### Step 6: Add Foreign Keys

```sql
-- Add foreign key constraints
ALTER TABLE grants
ADD CONSTRAINT fk_grants_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE grant_requests
ADD CONSTRAINT fk_grant_requests_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE policies
ADD CONSTRAINT fk_policies_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE capabilities
ADD CONSTRAINT fk_capabilities_tenant
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
```

---

## Rollback Plan

If migration fails, rollback in reverse order:

```sql
-- Remove foreign keys
ALTER TABLE grants DROP FOREIGN KEY fk_grants_tenant;
ALTER TABLE grant_requests DROP FOREIGN KEY fk_grant_requests_tenant;
ALTER TABLE policies DROP FOREIGN KEY fk_policies_tenant;
ALTER TABLE capabilities DROP FOREIGN KEY fk_capabilities_tenant;

-- Remove indexes
DROP INDEX idx_grants_tenant_id ON grants;
DROP INDEX idx_grant_requests_tenant_id ON grant_requests;
DROP INDEX idx_policies_tenant_id ON policies;
DROP INDEX idx_capabilities_tenant_id ON capabilities;
DROP INDEX idx_grants_tenant_user ON grants;
DROP INDEX idx_grant_requests_tenant_requester ON grant_requests;

-- Remove column
ALTER TABLE grants DROP COLUMN tenant_id;
ALTER TABLE grant_requests DROP COLUMN tenant_id;
ALTER TABLE policies DROP COLUMN tenant_id;
ALTER TABLE capabilities DROP COLUMN tenant_id;
```

---

## Prisma Schema Changes

Update `packages/database/prisma/schema.prisma`:

```prisma
model Grant {
  // ... existing fields ...
  tenantId     String      @map("tenant_id") @db.VarChar(191)  // ADD THIS

  // Relations
  tenant       Tenant      @relation("TenantGrants", fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  @@index([tenantId])  // ADD THIS
  @@index([tenantId, userId])  // ADD THIS
}

model GrantRequest {
  // ... existing fields ...
  tenantId     String      @map("tenant_id") @db.VarChar(191)  // ADD THIS

  // Relations
  tenant       Tenant      @relation("TenantGrantRequests", fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  @@index([tenantId])  // ADD THIS
}

model Policy {
  // ... existing fields ...
  tenantId     String      @map("tenant_id") @db.VarChar(191)  // ADD THIS

  // Relations
  tenant       Tenant      @relation("TenantPolicies", fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS

  @@index([tenantId])  // ADD THIS
}

model Capability {
  // ... existing fields ...
  tenantId     String?     @map("tenant_id") @db.VarChar(191)  // ADD THIS (NULLABLE)

  // Relations
  tenant       Tenant?     @relation("TenantCapabilities", fields: [tenantId], references: [id], onDelete: Cascade)  // ADD THIS (OPTIONAL)

  @@index([tenantId])  // ADD THIS
}
```

---

## Testing Plan

### Pre-Migration Tests
1. Backup production database
2. Test migration on staging environment
3. Verify data integrity after backfill
4. Run performance tests with indexes

### Post-Migration Tests
1. Run multi-tenant isolation tests (`npm run test:multi-tenant`)
2. Verify API routes enforce tenantId WHERE clauses
3. Performance regression test (< 5ms overhead)
4. Load test with 1000 concurrent tenants

---

## Deployment Plan

### Maintenance Window Required
- **Duration:** 2-4 hours
- **Reason:** Large table ALTER + backfill + index creation

### Steps
1. **T-30min:** Announce maintenance window
2. **T-0min:** Put application in read-only mode
3. **T+5min:** Execute migration script
4. **T+60min:** Validate migration success
5. **T+90min:** Deploy updated API code with tenantId enforcement
6. **T+120min:** Run smoke tests
7. **T+150min:** Resume normal operations

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data backfill fails for orphaned records | MEDIUM | HIGH | Identify orphans beforehand, assign to default tenant or delete |
| Downtime exceeds window | LOW | HIGH | Use `gh-ost` for online schema change |
| Performance degradation | LOW | MEDIUM | Add composite indexes, test with 1M+ records |
| Foreign key constraint violation | LOW | HIGH | Validate data integrity before adding FK |

---

## Success Criteria

- ✅ Zero NULL tenantId in grants, grant_requests, policies (except global capabilities)
- ✅ All API routes enforce tenantId WHERE clauses
- ✅ Multi-tenant isolation tests pass 100%
- ✅ Performance overhead < 5ms per query
- ✅ Zero production incidents within 48h post-deployment

---

## References

- [STORY-003: Permissions tenantId Fix](../planning/stories/sprint-1/STORY-003-permissions-tenantid-fix.yaml)
- [Multi-Tenancy Architecture](../architecture/multi-tenancy.md)
- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Prepared by:** @aios-master (Orion)
**Date:** 2026-02-07
**Approved by:** [Pending Review]
