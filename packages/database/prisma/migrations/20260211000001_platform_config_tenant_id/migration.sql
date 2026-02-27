-- Migration: STORY-011 — PlatformConfig per-tenant architecture fix
-- Adiciona tenantId (nullable) ao PlatformConfig para suporte a white-label por tenant.
-- Nullable para compatibilidade retroativa: registros sem tenantId são config global.

-- AddColumn
ALTER TABLE "PlatformConfig" ADD COLUMN "tenantId" TEXT;

-- AddForeignKey
ALTER TABLE "PlatformConfig" ADD CONSTRAINT "PlatformConfig_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddIndex
CREATE INDEX "PlatformConfig_tenantId_idx" ON "PlatformConfig"("tenantId");
