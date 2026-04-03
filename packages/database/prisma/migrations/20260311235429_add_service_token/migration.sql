/*
  Warnings:

  - You are about to drop the `licenses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CallerType" AS ENUM ('HUMAN', 'AGENT');

-- DropForeignKey
ALTER TABLE "SecurityAuditLog" DROP CONSTRAINT "fk_security_audit_logs_tenant";

-- DropForeignKey
ALTER TABLE "capabilities" DROP CONSTRAINT "fk_capabilities_tenant";

-- DropForeignKey
ALTER TABLE "grant_requests" DROP CONSTRAINT "fk_grant_requests_tenant";

-- DropForeignKey
ALTER TABLE "grants" DROP CONSTRAINT "fk_grants_tenant";

-- DropForeignKey
ALTER TABLE "impersonation_sessions" DROP CONSTRAINT "fk_impersonation_sessions_tenant";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_purchase_id_fkey";

-- DropForeignKey
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "policies" DROP CONSTRAINT "fk_policies_tenant";

-- DropIndex
DROP INDEX "PlatformConfig_tenantId_idx";

-- DropIndex
DROP INDEX "idx_grant_requests_tenant_requester";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "agent_id" TEXT,
ADD COLUMN     "caller_type" "CallerType" NOT NULL DEFAULT 'HUMAN',
ALTER COLUMN "retentionUntil" SET DEFAULT NOW() + INTERVAL '90 days';

-- AlterTable
ALTER TABLE "PlatformConfig" ALTER COLUMN "language" SET DEFAULT 'en-US',
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "numberFormat" SET DEFAULT '1,000.00';

-- AlterTable
ALTER TABLE "SecurityAuditLog" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "capabilities" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "grant_requests" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "impersonation_sessions" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "policies" ALTER COLUMN "tenant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "spaces" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- DropTable
DROP TABLE "licenses";

-- DropEnum
DROP TYPE "LicenseStatus";

-- CreateTable
CREATE TABLE "service_tokens" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "agent_squad" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "capabilities" TEXT[],
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_tokens_token_key" ON "service_tokens"("token");

-- CreateIndex
CREATE INDEX "service_tokens_tenant_id_agent_id_idx" ON "service_tokens"("tenant_id", "agent_id");

-- CreateIndex
CREATE INDEX "service_tokens_tenant_id_last_used_at_idx" ON "service_tokens"("tenant_id", "last_used_at");

-- CreateIndex
CREATE INDEX "service_tokens_expires_at_idx" ON "service_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_userId_idx" ON "AuditLog"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_deletedAt_idx" ON "AuditLog"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_entity_createdAt_idx" ON "AuditLog"("tenantId", "entity", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_caller_type_idx" ON "AuditLog"("caller_type");

-- CreateIndex
CREATE INDEX "AuditLog_agent_id_idx" ON "AuditLog"("agent_id");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_createdAt_idx" ON "Invoice"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_dueDate_idx" ON "Invoice"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "Order_tenantId_status_idx" ON "Order"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Order_tenantId_createdAt_idx" ON "Order"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_tenant_id_createdAt_idx" ON "SecurityAuditLog"("tenant_id", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityAuditLog_tenant_id_action_idx" ON "SecurityAuditLog"("tenant_id", "action");

-- CreateIndex
CREATE INDEX "User_tenantId_email_idx" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE INDEX "User_tenantId_status_idx" ON "User"("tenantId", "status");

-- CreateIndex
CREATE INDEX "User_tenantId_deletedAt_idx" ON "User"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "User_tenantId_createdAt_idx" ON "User"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "User_tenantId_lastLoginAt_idx" ON "User"("tenantId", "lastLoginAt");

-- CreateIndex
CREATE INDEX "grants_tenant_id_space_id_idx" ON "grants"("tenant_id", "space_id");

-- CreateIndex
CREATE INDEX "grants_tenant_id_status_idx" ON "grants"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "grants_user_id_status_idx" ON "grants"("user_id", "status");

-- CreateIndex
CREATE INDEX "grants_tenant_id_user_id_status_idx" ON "grants"("tenant_id", "user_id", "status");

-- CreateIndex
CREATE INDEX "grants_expires_at_status_idx" ON "grants"("expires_at", "status");

-- CreateIndex
CREATE INDEX "in_app_notifications_user_id_read_idx" ON "in_app_notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "in_app_notifications_user_id_created_at_idx" ON "in_app_notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "policies_tenant_id_name_idx" ON "policies"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "policies_tenant_id_isActive_idx" ON "policies"("tenant_id", "isActive");

-- CreateIndex
CREATE INDEX "policies_tenant_id_type_idx" ON "policies"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "policies_tenant_id_targetType_isActive_idx" ON "policies"("tenant_id", "targetType", "isActive");

-- CreateIndex
CREATE INDEX "spaces_tenant_id_is_active_idx" ON "spaces"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "spaces_tenant_id_sort_order_idx" ON "spaces"("tenant_id", "sort_order");

-- AddForeignKey
ALTER TABLE "SecurityAuditLog" ADD CONSTRAINT "SecurityAuditLog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capabilities" ADD CONSTRAINT "capabilities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grants" ADD CONSTRAINT "grants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant_requests" ADD CONSTRAINT "grant_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impersonation_sessions" ADD CONSTRAINT "impersonation_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tokens" ADD CONSTRAINT "service_tokens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_security_audit_logs_tenant_id" RENAME TO "SecurityAuditLog_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_security_audit_logs_tenant_user" RENAME TO "SecurityAuditLog_tenant_id_userId_idx";

-- RenameIndex
ALTER INDEX "idx_capabilities_tenant_id" RENAME TO "capabilities_tenant_id_idx";

-- RenameIndex
ALTER INDEX "capability_audit_events_capabilityId_action_created_at_idx" RENAME TO "capability_audit_events_capability_id_action_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_grant_requests_tenant_id" RENAME TO "grant_requests_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_grants_tenant_id" RENAME TO "grants_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_grants_tenant_user" RENAME TO "grants_tenant_id_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_impersonation_sessions_tenant_id" RENAME TO "impersonation_sessions_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_policies_tenant_id" RENAME TO "policies_tenant_id_idx";
