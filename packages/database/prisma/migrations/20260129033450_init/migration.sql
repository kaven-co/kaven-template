-- CreateEnum
CREATE TYPE "SecurityRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "PolicyEnforcement" ADD VALUE 'ALLOW';

-- AlterEnum
ALTER TYPE "PolicyTargetType" ADD VALUE 'GLOBAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PolicyType" ADD VALUE 'IP_WHITELIST';
ALTER TYPE "PolicyType" ADD VALUE 'TIME_BASED';
ALTER TYPE "PolicyType" ADD VALUE 'DEVICE_TRUST';
ALTER TYPE "PolicyType" ADD VALUE 'GEO_RESTRICTION';

-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "ui_config" JSONB;

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module_slug" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "purchase_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_requests" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "SecurityRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requester_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "executed_by" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_key_key" ON "licenses"("key");

-- CreateIndex
CREATE INDEX "licenses_key_idx" ON "licenses"("key");

-- CreateIndex
CREATE INDEX "licenses_user_id_idx" ON "licenses"("user_id");

-- CreateIndex
CREATE INDEX "licenses_module_slug_idx" ON "licenses"("module_slug");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "security_requests_type_idx" ON "security_requests"("type");

-- CreateIndex
CREATE INDEX "security_requests_status_idx" ON "security_requests"("status");

-- CreateIndex
CREATE INDEX "security_requests_requester_id_idx" ON "security_requests"("requester_id");

-- CreateIndex
CREATE INDEX "security_requests_target_user_id_idx" ON "security_requests"("target_user_id");

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_requests" ADD CONSTRAINT "security_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_requests" ADD CONSTRAINT "security_requests_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_requests" ADD CONSTRAINT "security_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_requests" ADD CONSTRAINT "security_requests_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
