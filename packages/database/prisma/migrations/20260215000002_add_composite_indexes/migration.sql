-- AddCompositeIndexes
-- Adds composite indexes for multi-tenant query performance optimization
-- Target: Policy and Space models (tenantId + createdAt)

-- Policy: Tenant-scoped policy timeline ordering
CREATE INDEX "policies_tenant_id_created_at_idx" ON "policies"("tenant_id", "created_at");

-- Space: Tenant-scoped space timeline ordering
CREATE INDEX "spaces_tenant_id_created_at_idx" ON "spaces"("tenant_id", "created_at");
