# Schema Changes Summary - Sprint 1 Migrations

> **Migration:** 20260207000001_sprint1_add_tenantid
> **Date:** 2026-02-07
> **Status:** ✅ Ready for Execution

---

## Models Updated

### ✅ Grant (COMPLETED)
- Added: `tenantId String @map("tenant_id") @db.VarChar(191)`
- Added relation: `tenant Tenant @relation("TenantGrants"...)`
- Added indexes: `@@index([tenantId])`, `@@index([tenantId, userId])`

### 🔄 GrantRequest (TODO)
- Add: `tenantId String @map("tenant_id") @db.VarChar(191)`
- Add relation: `tenant Tenant @relation("TenantGrantRequests"...)`
- Add index: `@@index([tenantId])`

### 🔄 Policy (TODO)
- Add: `tenantId String @map("tenant_id") @db.VarChar(191)`
- Add relation: `tenant Tenant @relation("TenantPolicies"...)`
- Add index: `@@index([tenantId])`

### 🔄 Capability (TODO)
- Add: `tenantId String? @map("tenant_id") @db.VarChar(191)` (NULLABLE)
- Add relation: `tenant Tenant? @relation("TenantCapabilities"...)` (OPTIONAL)
- Add index: `@@index([tenantId])`

### 🔄 SecurityAuditLog (TODO)
- Add: `tenantId String @map("tenant_id") @db.VarChar(191)`
- Add relation: `tenant Tenant @relation("TenantAuditLogs"...)`
- Add index: `@@index([tenantId])`

### 🔄 ImpersonationSession (TODO)
- Add: `tenantId String @map("tenant_id") @db.VarChar(191)`
- Add relation: `tenant Tenant @relation("TenantImpersonations"...)`
- Add index: `@@index([tenantId])`

### 🔄 Space (TODO)
- Make NOT NULL: `tenantId String @map("tenant_id") @db.VarChar(191)` (already exists, just remove `?`)

---

## Tenant Model Relations to Add

The Tenant model needs to add these relations:

```prisma
model Tenant {
  // ... existing fields ...

  // Sprint 1 Relations (ADD THESE)
  grants               Grant[]               @relation("TenantGrants")
  grantRequests        GrantRequest[]        @relation("TenantGrantRequests")
  policies             Policy[]              @relation("TenantPolicies")
  capabilities         Capability[]          @relation("TenantCapabilities")
  securityAuditLogs    SecurityAuditLog[]    @relation("TenantAuditLogs")
  impersonationSessions ImpersonationSession[] @relation("TenantImpersonations")
}
```

---

## Manual Edits Required

Due to the large number of changes, you need to manually edit `schema.prisma` for:
1. GrantRequest model (line ~1852)
2. Policy model (line ~1899)
3. Capability model (line ~1702)
4. SecurityAuditLog model (search for it)
5. ImpersonationSession model (search for it)
6. Space model (search for it - just remove `?` from tenantId)
7. Tenant model (line ~332 - add relations)

OR run `prisma db pull` after migration to auto-update schema.

---

## Verification Steps

After migration:

```bash
# 1. Run migration
pnpm db:migrate

# 2. Generate Prisma Client
pnpm db:generate

# 3. Verify no NULL values
SELECT 'grants', COUNT(*) FROM grants WHERE tenant_id IS NULL
UNION ALL
SELECT 'grant_requests', COUNT(*) FROM grant_requests WHERE tenant_id IS NULL;
# ... etc

# 4. Run tests
pnpm run test:multi-tenant
```

---

**Status:** Migration SQL ready, Schema updates in progress
