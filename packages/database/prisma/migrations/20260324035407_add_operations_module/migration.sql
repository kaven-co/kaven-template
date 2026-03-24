-- CreateEnum
CREATE TYPE "sop_category" AS ENUM ('FINANCIAL', 'COMMERCIAL', 'OPERATIONAL', 'HR', 'IT', 'LEGAL', 'COMPLIANCE', 'QUALITY', 'SECURITY', 'CUSTOMER_SUCCESS', 'MARKETING', 'OTHER');

-- CreateEnum
CREATE TYPE "sop_status" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "sop_execution_status" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'COMPLETED_WITH_DEVIATIONS', 'ABANDONED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "sop_step_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "sop_trigger_type" AS ENUM ('MANUAL', 'SCHEDULED', 'EVENT_TRIGGERED', 'API');

-- CreateEnum
CREATE TYPE "vendor_category" AS ENUM ('TECHNOLOGY', 'PROFESSIONAL_SERVICES', 'INFRASTRUCTURE', 'MARKETING', 'LOGISTICS', 'LEGAL', 'FINANCIAL', 'HR_BENEFITS', 'FACILITIES', 'SUPPLIERS', 'OTHER');

-- CreateEnum
CREATE TYPE "vendor_status" AS ENUM ('PROSPECT', 'ONBOARDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "vendor_tier" AS ENUM ('STRATEGIC', 'PREFERRED', 'STANDARD', 'OCCASIONAL');

-- CreateEnum
CREATE TYPE "contract_type" AS ENUM ('RECURRING', 'ONE_TIME', 'RETAINER', 'PROJECT_BASED', 'MASTER_SERVICE_AGREEMENT');

-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'RENEWED');

-- CreateEnum
CREATE TYPE "payment_frequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "vendor_invoice_status" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "tool_category" AS ENUM ('PRODUCTIVITY', 'COMMUNICATION', 'PROJECT_MANAGEMENT', 'DESIGN', 'DEVELOPMENT', 'ANALYTICS', 'CRM', 'FINANCE', 'HR', 'SECURITY', 'INFRASTRUCTURE', 'AI', 'MARKETING', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "billing_type" AS ENUM ('MONTHLY', 'ANNUAL', 'ONE_TIME', 'USAGE_BASED');

-- CreateEnum
CREATE TYPE "tool_status" AS ENUM ('ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED', 'EVALUATING');

-- CreateTable
CREATE TABLE "sops" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" "sop_category" NOT NULL,
    "department" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "previousVersionId" TEXT,
    "ownerId" TEXT NOT NULL,
    "status" "sop_status" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "reviewCycleDays" INTEGER NOT NULL DEFAULT 365,
    "estimatedMinutes" INTEGER,
    "tags" TEXT[],
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "sops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_steps" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "parentStepId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "expectedOutput" TEXT,
    "estimatedMinutes" INTEGER,
    "roleRequired" TEXT,
    "assigneeId" TEXT,
    "isConditional" BOOLEAN NOT NULL DEFAULT false,
    "conditionField" TEXT,
    "conditionValue" TEXT,
    "attachments" TEXT[],
    "checklistItems" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sop_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_executions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "triggerType" "sop_trigger_type" NOT NULL DEFAULT 'MANUAL',
    "status" "sop_execution_status" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "totalSteps" INTEGER NOT NULL,
    "completedSteps" INTEGER NOT NULL DEFAULT 0,
    "skippedSteps" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION,
    "notes" TEXT,
    "blockers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sop_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sop_step_executions" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "sop_step_status" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "executorId" TEXT,
    "notes" TEXT,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sop_step_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "website" TEXT,
    "category" "vendor_category" NOT NULL,
    "subcategory" TEXT,
    "primaryContactName" TEXT,
    "primaryContactEmail" TEXT,
    "primaryContactPhone" TEXT,
    "status" "vendor_status" NOT NULL DEFAULT 'ACTIVE',
    "tier" "vendor_tier" NOT NULL DEFAULT 'STANDARD',
    "onboardedAt" TIMESTAMP(3),
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "scoreOverall" DOUBLE PRECISION,
    "scoreQuality" DOUBLE PRECISION,
    "scorePontuality" DOUBLE PRECISION,
    "scoreCost" DOUBLE PRECISION,
    "scoreSupport" DOUBLE PRECISION,
    "lastScoredAt" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_contacts" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "vendor_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_contracts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contractNumber" TEXT,
    "documentUrl" TEXT,
    "contractType" "contract_type" NOT NULL DEFAULT 'RECURRING',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "totalValue" DECIMAL(15,2),
    "monthlyValue" DECIMAL(15,2),
    "paymentFrequency" "payment_frequency" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalNoticeDays" INTEGER DEFAULT 30,
    "status" "contract_status" NOT NULL DEFAULT 'ACTIVE',
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "slaDescription" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "vendor_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_scorecard_entries" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoredBy" TEXT NOT NULL,
    "scoreOverall" DOUBLE PRECISION NOT NULL,
    "scoreQuality" DOUBLE PRECISION NOT NULL,
    "scorePontuality" DOUBLE PRECISION NOT NULL,
    "scoreCost" DOUBLE PRECISION NOT NULL,
    "scoreSupport" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "notes" TEXT,
    "incidents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vendor_scorecard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tool_registry_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorName" TEXT,
    "vendorId" TEXT,
    "category" "tool_category" NOT NULL,
    "subcategory" TEXT,
    "website" TEXT,
    "description" TEXT,
    "billingType" "billing_type" NOT NULL DEFAULT 'MONTHLY',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "costPerMonth" DECIMAL(10,2) NOT NULL,
    "seats" INTEGER,
    "costPerSeat" DECIMAL(10,2),
    "ownerId" TEXT NOT NULL,
    "department" TEXT,
    "activeUsers" INTEGER,
    "totalSeats" INTEGER,
    "status" "tool_status" NOT NULL DEFAULT 'ACTIVE',
    "contractStartDate" TIMESTAMP(3),
    "contractEndDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "renewalNoticeDays" INTEGER DEFAULT 30,
    "tags" TEXT[],
    "notes" TEXT,
    "lastAuditDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "tool_registry_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sops_tenantId_slug_version_key" ON "sops"("tenantId", "slug", "version");
CREATE INDEX "sops_tenantId_status_idx" ON "sops"("tenantId", "status");
CREATE INDEX "sops_tenantId_category_idx" ON "sops"("tenantId", "category");
CREATE INDEX "sops_tenantId_department_idx" ON "sops"("tenantId", "department");
CREATE INDEX "sops_ownerId_idx" ON "sops"("ownerId");

CREATE INDEX "sop_steps_sopId_order_idx" ON "sop_steps"("sopId", "order");

CREATE INDEX "sop_executions_tenantId_sopId_idx" ON "sop_executions"("tenantId", "sopId");
CREATE INDEX "sop_executions_tenantId_status_idx" ON "sop_executions"("tenantId", "status");
CREATE INDEX "sop_executions_executorId_idx" ON "sop_executions"("executorId");

CREATE INDEX "sop_step_executions_executionId_idx" ON "sop_step_executions"("executionId");
CREATE INDEX "sop_step_executions_stepId_idx" ON "sop_step_executions"("stepId");

CREATE UNIQUE INDEX "vendors_tenantId_taxId_key" ON "vendors"("tenantId", "taxId");
CREATE INDEX "vendors_tenantId_status_idx" ON "vendors"("tenantId", "status");
CREATE INDEX "vendors_tenantId_category_idx" ON "vendors"("tenantId", "category");
CREATE INDEX "vendors_tenantId_tier_idx" ON "vendors"("tenantId", "tier");

CREATE INDEX "vendor_contacts_vendorId_idx" ON "vendor_contacts"("vendorId");

CREATE INDEX "vendor_contracts_tenantId_vendorId_idx" ON "vendor_contracts"("tenantId", "vendorId");
CREATE INDEX "vendor_contracts_tenantId_status_idx" ON "vendor_contracts"("tenantId", "status");
CREATE INDEX "vendor_contracts_tenantId_endDate_idx" ON "vendor_contracts"("tenantId", "endDate");

CREATE INDEX "vendor_scorecard_entries_vendorId_scoredAt_idx" ON "vendor_scorecard_entries"("vendorId", "scoredAt");

CREATE UNIQUE INDEX "tool_registry_items_tenantId_name_key" ON "tool_registry_items"("tenantId", "name");
CREATE INDEX "tool_registry_items_tenantId_category_idx" ON "tool_registry_items"("tenantId", "category");
CREATE INDEX "tool_registry_items_tenantId_status_idx" ON "tool_registry_items"("tenantId", "status");
CREATE INDEX "tool_registry_items_ownerId_idx" ON "tool_registry_items"("ownerId");

-- AddForeignKey
ALTER TABLE "sops" ADD CONSTRAINT "sops_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sops" ADD CONSTRAINT "sops_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "sops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sops" ADD CONSTRAINT "sops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sop_steps" ADD CONSTRAINT "sop_steps_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "sops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sop_steps" ADD CONSTRAINT "sop_steps_parentStepId_fkey" FOREIGN KEY ("parentStepId") REFERENCES "sop_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sop_steps" ADD CONSTRAINT "sop_steps_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sop_executions" ADD CONSTRAINT "sop_executions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sop_executions" ADD CONSTRAINT "sop_executions_sopId_fkey" FOREIGN KEY ("sopId") REFERENCES "sops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sop_executions" ADD CONSTRAINT "sop_executions_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sop_step_executions" ADD CONSTRAINT "sop_step_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "sop_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sop_step_executions" ADD CONSTRAINT "sop_step_executions_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "sop_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sop_step_executions" ADD CONSTRAINT "sop_step_executions_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vendor_contacts" ADD CONSTRAINT "vendor_contacts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vendor_contracts" ADD CONSTRAINT "vendor_contracts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vendor_scorecard_entries" ADD CONSTRAINT "vendor_scorecard_entries_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tool_registry_items" ADD CONSTRAINT "tool_registry_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tool_registry_items" ADD CONSTRAINT "tool_registry_items_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tool_registry_items" ADD CONSTRAINT "tool_registry_items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
