-- CreateEnum
CREATE TYPE "invite_status" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "sync_status" AS ENUM ('IDLE', 'SYNCING', 'SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "legal_contract_status" AS ENUM ('DRAFT', 'REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'SENT_FOR_SIGN', 'SIGNED', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "legal_entity_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "obligation_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "signer_auth_method" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PIX', 'BIOMETRIC', 'ICP_BRASIL', 'SIMPLE');

-- CreateEnum
CREATE TYPE "case_status" AS ENUM ('INTAKE', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "case_type" AS ENUM ('LITIGATION', 'ADVISORY', 'TRANSACTIONAL', 'ARBITRATION', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "case_billing_type" AS ENUM ('HOURLY', 'FLAT_FEE', 'CONTINGENCY', 'RETAINER', 'PRO_BONO');

-- CreateEnum
CREATE TYPE "party_role" AS ENUM ('CLIENT', 'OPPOSING', 'WITNESS', 'EXPERT', 'JUDGE', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "case_task_status" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "case_task_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "deadline_type" AS ENUM ('COURT', 'FILING', 'HEARING', 'RESPONSE', 'APPEAL', 'DISCOVERY', 'INTERNAL', 'CLIENT_DELIVERY', 'REGULATORY', 'CONTRACT_EXPIRY');

-- CreateEnum
CREATE TYPE "time_entry_status" AS ENUM ('DRAFT', 'PENDING', 'BILLED', 'INVOICED', 'WRITTEN_OFF', 'NO_CHARGE');

-- CreateEnum
CREATE TYPE "trust_transaction_type" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'DISBURSEMENT', 'REFUND', 'TRANSFER', 'COURT_DEPOSIT', 'COURT_RELEASE');

-- CreateEnum
CREATE TYPE "churn_type" AS ENUM ('VOLUNTARY', 'INVOLUNTARY', 'TRIAL_EXPIRED', 'DOWNGRADE');

-- CreateEnum
CREATE TYPE "churn_reason" AS ENUM ('PRICE', 'FEATURES', 'COMPETITOR', 'SUPPORT', 'NOT_USING', 'BUG', 'BUSINESS_CLOSED', 'OTHER');

-- CreateEnum
CREATE TYPE "expansion_type" AS ENUM ('PLAN_UPGRADE', 'SEAT_EXPANSION', 'ADDON', 'REACTIVATION');

-- CreateEnum
CREATE TYPE "customer_health_category" AS ENUM ('HEALTHY', 'AT_RISK', 'CRITICAL', 'CHURNED');

-- CreateEnum
CREATE TYPE "property_type" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED');

-- CreateEnum
CREATE TYPE "property_status" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "unit_type" AS ENUM ('APARTMENT', 'HOUSE', 'STORE', 'OFFICE', 'WAREHOUSE', 'STUDIO', 'GARAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "lease_status" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "rent_payment_status" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "guarantor_type" AS ENUM ('GUARANTOR_PERSON', 'SURETY_BOND', 'CAPITALIZATION', 'DEPOSIT', 'NONE');

-- CreateEnum
CREATE TYPE "adjustment_index" AS ENUM ('IGPM', 'IPCA', 'INPC', 'IVAR', 'FIXED', 'NONE');

-- CreateEnum
CREATE TYPE "warehouse_type" AS ENUM ('MAIN', 'STORE', 'VIRTUAL', 'TRANSIT');

-- CreateEnum
CREATE TYPE "stock_movement_type" AS ENUM ('IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUST', 'TRANSFER', 'RETURN_SUPPLIER', 'RETURN_CUSTOMER');

-- CreateEnum
CREATE TYPE "sales_order_status" AS ENUM ('DRAFT', 'CONFIRMED', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "purchase_order_status" AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIAL_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "timesheet_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "work_schedule_type" AS ENUM ('FULL_TIME', 'PART_TIME', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "standup_status" AS ENUM ('SUBMITTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "channel_type" AS ENUM ('PROJECT', 'DEPARTMENT', 'GENERAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "channel_member_role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "rsvp_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'TENTATIVE');

-- CreateEnum
CREATE TYPE "team_meeting_type" AS ENUM ('STANDUP', 'PLANNING', 'RETRO', 'ONE_ON_ONE', 'REVIEW', 'CUSTOM');

-- CreateEnum
CREATE TYPE "dre_basis" AS ENUM ('ACCRUAL', 'CASH');

-- CreateEnum
CREATE TYPE "cash_flow_category" AS ENUM ('OPERATING', 'INVESTING', 'FINANCING');

-- CreateEnum
CREATE TYPE "indicator_status" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST');

-- CreateEnum
CREATE TYPE "equipment_category" AS ENUM ('LAPTOP', 'DESKTOP', 'MONITOR', 'PHONE', 'TABLET', 'PERIPHERAL', 'FURNITURE', 'VEHICLE', 'SOFTWARE_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "asset_condition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "assignment_status" AS ENUM ('ACTIVE', 'RETURNED', 'LOST', 'DAMAGED');

-- DropForeignKey
ALTER TABLE "project_documents" DROP CONSTRAINT "project_documents_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "project_expenses" DROP CONSTRAINT "project_expenses_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task_attachments" DROP CONSTRAINT "task_attachments_uploaded_by_id_fkey";

-- DropForeignKey
ALTER TABLE "task_comments" DROP CONSTRAINT "task_comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "time_entries" DROP CONSTRAINT "time_entries_user_id_fkey";

-- DropIndex
DROP INDEX "audit_log_module_idx";

-- DropIndex
DROP INDEX "documents_tags_gin_idx";

-- DropIndex
DROP INDEX "kb_articles_tags_gin_idx";

-- DropIndex
DROP INDEX "tasks_assignee_id_idx";

-- DropIndex
DROP INDEX "tasks_project_id_idx";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "retentionUntil" SET DEFAULT NOW() + INTERVAL '90 days';

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#6B7280',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "added_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "sync_status" "sync_status" NOT NULL DEFAULT 'IDLE',
    "last_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "delivery_status" NOT NULL DEFAULT 'PENDING',
    "http_status_code" INTEGER,
    "response_body" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" TEXT NOT NULL,
    "permissions" TEXT[],
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" "invite_status" NOT NULL DEFAULT 'PENDING',
    "token_hash" TEXT NOT NULL,
    "message" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "invited_by_id" TEXT NOT NULL,
    "accepted_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PJ',
    "name" TEXT NOT NULL,
    "trade_name" TEXT,
    "document" TEXT NOT NULL,
    "document_type" TEXT NOT NULL DEFAULT 'CNPJ',
    "status" "legal_entity_status" NOT NULL DEFAULT 'ACTIVE',
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "cnpj_status" TEXT,
    "cnpj_last_checked" TIMESTAMP(3),
    "cnpj_data" JSONB,
    "dpo_name" TEXT,
    "dpo_email" TEXT,
    "dpo_phone" TEXT,
    "dpo_appointed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entity_representatives" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_entity_representatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contract_number" TEXT,
    "type" TEXT NOT NULL,
    "status" "legal_contract_status" NOT NULL DEFAULT 'DRAFT',
    "value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "effective_date" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "signed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "renewal_period_days" INTEGER,
    "renewal_notice_days" INTEGER NOT NULL DEFAULT 30,
    "last_renewal_alert" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_id" TEXT,
    "content" TEXT,
    "summary" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_parties" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "entity_id" TEXT,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_signers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "auth_method" "signer_auth_method" NOT NULL DEFAULT 'EMAIL',
    "signed_at" TIMESTAMP(3),
    "sign_order" INTEGER NOT NULL DEFAULT 0,
    "signature_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_signers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_obligations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "obligation_status" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "owner_id" TEXT,
    "value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_obligations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_attachments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_status_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "from_status" "legal_contract_status" NOT NULL,
    "to_status" "legal_contract_status" NOT NULL,
    "reason" TEXT,
    "changed_by_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_number" TEXT,
    "court_number" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "case_type" "case_type" NOT NULL,
    "status" "case_status" NOT NULL DEFAULT 'INTAKE',
    "billing_type" "case_billing_type" NOT NULL DEFAULT 'HOURLY',
    "lead_attorney_id" TEXT,
    "originating_id" TEXT,
    "client_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "court_name" TEXT,
    "court_district" TEXT,
    "court_city" TEXT,
    "court_state" TEXT,
    "jurisdiction_type" TEXT,
    "distribution_date" TIMESTAMP(3),
    "estimated_value" DECIMAL(15,2),
    "contingency_pct" DECIMAL(5,2),
    "retainer_amount" DECIMAL(15,2),
    "flat_fee_amount" DECIMAL(15,2),
    "hourly_rate" DECIMAL(10,2),
    "budget_hours" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "opened_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "statute_of_lim_date" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_matters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "billing_type" "case_billing_type",
    "hourly_rate" DECIMAL(10,2),
    "status" "case_status" NOT NULL DEFAULT 'INTAKE',
    "assigned_to_id" TEXT,
    "estimated_hours" DECIMAL(8,2),
    "budget_amount" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "case_matters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_status_histories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "from_status" "case_status",
    "to_status" "case_status" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_parties" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "role" "party_role" NOT NULL,
    "name" TEXT NOT NULL,
    "document_type" TEXT,
    "document_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "contact_id" TEXT,
    "company_id" TEXT,
    "opposing_counsel_name" TEXT,
    "opposing_counsel_oab" TEXT,
    "opposing_counsel_email" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_tasks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "matter_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "case_task_status" NOT NULL DEFAULT 'BACKLOG',
    "priority" "case_task_priority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "parent_task_id" TEXT,
    "estimated_minutes" INTEGER,
    "deadline_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "case_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_deadlines" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deadline_type" "deadline_type" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "alert_t7" TIMESTAMP(3),
    "alert_t3" TIMESTAMP(3),
    "alert_t1" TIMESTAMP(3),
    "responsible_id" TEXT,
    "completed_at" TIMESTAMP(3),
    "completed_by_id" TEXT,
    "is_auto_capture" BOOLEAN NOT NULL DEFAULT false,
    "court_update_id" TEXT,
    "publication_date" TIMESTAMP(3),
    "calendar_days" INTEGER,
    "business_days" INTEGER,
    "description" TEXT,
    "is_fulfilled" BOOLEAN NOT NULL DEFAULT false,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_time_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "matter_id" TEXT,
    "task_id" TEXT,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "billing_type" "case_billing_type" NOT NULL DEFAULT 'HOURLY',
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(15,2),
    "status" "time_entry_status" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "activity_code" TEXT,
    "billable_record_id" TEXT,
    "adjusted_amount" DECIMAL(15,2),
    "adjustment_note" TEXT,
    "timer_session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "case_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billable_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "matter_id" TEXT,
    "client_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_hours" DECIMAL(8,2) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "finance_invoice_id" TEXT,
    "memo" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "invoiced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billable_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "bank_name" TEXT,
    "bank_account_number" TEXT,
    "bank_agency" TEXT,
    "alert_threshold" DECIMAL(15,2),
    "last_reconciled_at" TIMESTAMP(3),
    "last_reconciled_by_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_transactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "trust_account_id" TEXT NOT NULL,
    "type" "trust_transaction_type" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "direction" TEXT NOT NULL,
    "balance_after" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "authorized_by_id" TEXT NOT NULL,
    "finance_entry_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "description" TEXT,
    "document_kb_id" TEXT,
    "file_url" TEXT,
    "filed_at" TIMESTAMP(3),
    "filed_by" TEXT,
    "court_protocol_number" TEXT,
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "case_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_notes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "case_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrr_snapshots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "mrr_total" DECIMAL(12,2) NOT NULL,
    "mrr_new_business" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mrr_expansion" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mrr_contraction" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mrr_churn" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "mrr_reactivation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "recognized_revenue" DECIMAL(12,2) NOT NULL,
    "deferred_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "arr_projected" DECIMAL(12,2) NOT NULL,
    "arpu" DECIMAL(10,2) NOT NULL,
    "active_subscribers" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_version" TEXT NOT NULL DEFAULT '1',
    "metadata" JSONB,

    CONSTRAINT "mrr_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "churn_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "churn_type" "churn_type" NOT NULL,
    "churn_reason" "churn_reason",
    "churn_reason_text" TEXT,
    "competitor" TEXT,
    "mrr_lost" DECIMAL(10,2) NOT NULL,
    "arr_lost" DECIMAL(10,2) NOT NULL,
    "ltv" DECIMAL(10,2),
    "subscription_started_at" TIMESTAMP(3) NOT NULL,
    "churned_at" TIMESTAMP(3) NOT NULL,
    "subscription_age_in_days" INTEGER NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "feature_usage_score" INTEGER,
    "invoices_overdue" INTEGER NOT NULL DEFAULT 0,
    "dunning_attempts" INTEGER NOT NULL DEFAULT 0,
    "dunning_started_at" TIMESTAMP(3),
    "reactivated_at" TIMESTAMP(3),
    "reactivation_mrr" DECIMAL(10,2),
    "source_system" TEXT NOT NULL DEFAULT 'internal',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "churn_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_analyses" (
    "id" TEXT NOT NULL,
    "cohort_month" TIMESTAMP(3) NOT NULL,
    "cohort_size" INTEGER NOT NULL,
    "analysis_month" TIMESTAMP(3) NOT NULL,
    "months_elapsed" INTEGER NOT NULL,
    "active_count" INTEGER NOT NULL,
    "churned_count" INTEGER NOT NULL,
    "retention_rate" DECIMAL(5,4) NOT NULL,
    "cumulative_churn_rate" DECIMAL(5,4) NOT NULL,
    "mrr_cohort_entry" DECIMAL(12,2) NOT NULL,
    "mrr_current" DECIMAL(12,2) NOT NULL,
    "nrr" DECIMAL(5,4) NOT NULL,
    "grr" DECIMAL(5,4) NOT NULL,
    "segment" TEXT,
    "segment_value" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_adoption_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "feature_key" TEXT NOT NULL,
    "feature_module" TEXT NOT NULL,
    "feature_category" TEXT,
    "usage_date" TIMESTAMP(3) NOT NULL,
    "event_count" INTEGER NOT NULL DEFAULT 0,
    "unique_users" INTEGER NOT NULL DEFAULT 0,
    "avg_duration_ms" INTEGER,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "p95_duration_ms" INTEGER,
    "plan_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_adoption_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "expansion_type" "expansion_type" NOT NULL,
    "from_plan_id" TEXT,
    "from_plan_name" TEXT,
    "to_plan_id" TEXT NOT NULL,
    "to_plan_name" TEXT NOT NULL,
    "mrr_before" DECIMAL(10,2) NOT NULL,
    "mrr_after" DECIMAL(10,2) NOT NULL,
    "mrr_delta" DECIMAL(10,2) NOT NULL,
    "triggered_by" TEXT,
    "features_that_drove" JSONB,
    "campaign_id" TEXT,
    "expanded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "revenue_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_health_scores" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_score" INTEGER NOT NULL,
    "score_category" "customer_health_category" NOT NULL,
    "usage_frequency_score" INTEGER NOT NULL,
    "feature_breadth_score" INTEGER NOT NULL,
    "payment_health_score" INTEGER NOT NULL,
    "expansion_signal_score" INTEGER NOT NULL,
    "engagement_score" INTEGER NOT NULL,
    "previous_score" INTEGER,
    "score_delta" INTEGER,
    "alerts_triggered" JSONB,
    "recommended_actions" JSONB,
    "metadata" JSONB,

    CONSTRAINT "customer_health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "property_type" NOT NULL DEFAULT 'RESIDENTIAL',
    "status" "property_status" NOT NULL DEFAULT 'AVAILABLE',
    "address_street" TEXT NOT NULL,
    "address_number" TEXT,
    "address_complement" TEXT,
    "address_neighborhood" TEXT,
    "address_city" TEXT NOT NULL,
    "address_state" TEXT NOT NULL,
    "address_zip_code" TEXT NOT NULL,
    "address_country" TEXT NOT NULL DEFAULT 'BR',
    "area" DOUBLE PRECISION,
    "market_value" DOUBLE PRECISION,
    "registration_number" TEXT,
    "iptu_number" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_units" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "type" "unit_type" NOT NULL DEFAULT 'APARTMENT',
    "floor" INTEGER,
    "area" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "parking_spots" INTEGER,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "monthly_rent" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "property_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "birth_date" TIMESTAMP(3),
    "profession" TEXT,
    "monthly_income" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "renters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guarantors" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "renter_id" TEXT NOT NULL,
    "type" "guarantor_type" NOT NULL DEFAULT 'GUARANTOR_PERSON',
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "policy_number" TEXT,
    "insurer_name" TEXT,
    "coverage_amount" DOUBLE PRECISION,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guarantors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "renter_id" TEXT NOT NULL,
    "status" "lease_status" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "monthly_rent" DOUBLE PRECISION NOT NULL,
    "adjustment_index" "adjustment_index" NOT NULL DEFAULT 'IGPM',
    "adjustment_month" INTEGER,
    "deposit" DOUBLE PRECISION,
    "late_fee_percent" DOUBLE PRECISION DEFAULT 2,
    "late_fee_daily" DOUBLE PRECISION DEFAULT 0.033,
    "status_changed_at" TIMESTAMP(3),
    "status_reason" TEXT,
    "renewed_from_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lease_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid_amount" DOUBLE PRECISION,
    "paid_date" TIMESTAMP(3),
    "status" "rent_payment_status" NOT NULL DEFAULT 'PENDING',
    "late_fee" DOUBLE PRECISION,
    "notes" TEXT,
    "reference_month" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "warehouse_type" NOT NULL DEFAULT 'MAIN',
    "address" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_id" TEXT,
    "warehouse_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_qty" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER,
    "reorder_qty" INTEGER,
    "max_qty" INTEGER,
    "location" TEXT,
    "cost_price" DOUBLE PRECISION,
    "barcode" TEXT,
    "last_counted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,
    "type" "stock_movement_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "cost_per_unit" DOUBLE PRECISION,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" "sales_order_status" NOT NULL DEFAULT 'DRAFT',
    "customer_name" TEXT,
    "customer_email" TEXT,
    "shipping_address" JSONB,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status_changed_at" TIMESTAMP(3),
    "status_history" JSONB,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "tracking_code" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "sales_order_id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" "purchase_order_status" NOT NULL DEFAULT 'DRAFT',
    "supplier_name" TEXT NOT NULL,
    "supplier_email" TEXT,
    "supplier_phone" TEXT,
    "expected_date" TIMESTAMP(3),
    "received_date" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status_changed_at" TIMESTAMP(3),
    "status_history" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "stock_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "received_quantity" INTEGER NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remote_time_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "project_id" TEXT,
    "task_id" TEXT,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_running" BOOLEAN NOT NULL DEFAULT false,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remote_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_rates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "project_id" TEXT,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_periods" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "timesheet_status" NOT NULL DEFAULT 'DRAFT',
    "total_minutes" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" "work_schedule_type" NOT NULL DEFAULT 'FULL_TIME',
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_days" (
    "id" TEXT NOT NULL,
    "work_schedule_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "is_work_day" BOOLEAN NOT NULL DEFAULT true,
    "available_from" TEXT,
    "available_to" TEXT,

    CONSTRAINT "work_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timezone_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "utc_offset" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timezone_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "async_standups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cron_expr" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "prompts" JSONB NOT NULL DEFAULT '[]',
    "channel_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "async_standups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standup_responses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "standup_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "yesterday" TEXT,
    "today" TEXT,
    "blockers" TEXT,
    "video_url" TEXT,
    "status" "standup_status" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standup_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_channels" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "channel_type" NOT NULL DEFAULT 'GENERAL',
    "project_id" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_channel_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "channel_member_role" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_channel_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_updates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "yesterday" TEXT,
    "today" TEXT,
    "blockers" TEXT,
    "video_url" TEXT,
    "mood" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_meetings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "team_meeting_type" NOT NULL DEFAULT 'CUSTOM',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "external_link" TEXT,
    "channel_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_meeting_participants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rsvp_status" "rsvp_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_meeting_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dre_snapshots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period" DATE NOT NULL,
    "basis" "dre_basis" NOT NULL DEFAULT 'ACCRUAL',
    "gross_revenue" DECIMAL(15,2) NOT NULL,
    "deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_revenue" DECIMAL(15,2) NOT NULL,
    "cogs" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "gross_profit" DECIMAL(15,2) NOT NULL,
    "operating_expenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ebitda" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "depreciation" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "financial_result" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_expenses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_income" DECIMAL(15,2) NOT NULL,
    "metadata" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dre_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dre_category_breakdowns" (
    "id" TEXT NOT NULL,
    "dre_snapshot_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_code" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(15,2) NOT NULL,
    "percentage" DECIMAL(5,2),

    CONSTRAINT "dre_category_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_flow_snapshots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period" DATE NOT NULL,
    "operating_cash_flow" DECIMAL(15,2) NOT NULL,
    "investing_cash_flow" DECIMAL(15,2) NOT NULL,
    "financing_cash_flow" DECIMAL(15,2) NOT NULL,
    "net_cash_flow" DECIMAL(15,2) NOT NULL,
    "opening_balance" DECIMAL(15,2) NOT NULL,
    "closing_balance" DECIMAL(15,2) NOT NULL,
    "metadata" JSONB,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_flow_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_indicators" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period" DATE NOT NULL,
    "indicator_key" TEXT NOT NULL,
    "value" DECIMAL(15,4) NOT NULL,
    "previous_value" DECIMAL(15,4),
    "delta" DECIMAL(15,4),
    "status" "indicator_status" NOT NULL DEFAULT 'GREEN',
    "unit" TEXT NOT NULL DEFAULT 'percentage',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_score_alert_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 0,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notify_channel" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_score_alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_score_alerts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "alerted_tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "health_score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_score_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expansion_opportunities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "target_tenant_id" TEXT NOT NULL,
    "current_plan_name" TEXT NOT NULL,
    "suggested_plan_name" TEXT NOT NULL,
    "expansion_signal_score" INTEGER NOT NULL,
    "features_that_drove" JSONB,
    "estimated_mrr_increase" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'detected',
    "converted_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expansion_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "equipment_category" NOT NULL DEFAULT 'OTHER',
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "status" "equipment_status" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "asset_condition" NOT NULL DEFAULT 'NEW',
    "purchase_date" TIMESTAMP(3),
    "purchase_price" DECIMAL(10,2),
    "warranty_expiry" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_registries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "responsible_id" TEXT,
    "acquisition_date" TIMESTAMP(3),
    "acquisition_cost" DECIMAL(10,2),
    "current_value" DECIMAL(10,2),
    "depreciation_rate" DECIMAL(5,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "assigned_to_id" TEXT NOT NULL,
    "status" "assignment_status" NOT NULL DEFAULT 'ACTIVE',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "expected_return" TIMESTAMP(3),
    "notes" TEXT,
    "condition_at_assignment" "asset_condition" NOT NULL DEFAULT 'GOOD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "groups_tenant_id_is_active_idx" ON "groups"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "groups_tenant_id_name_key" ON "groups"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "group_members_tenant_id_group_id_idx" ON "group_members"("tenant_id", "group_id");

-- CreateIndex
CREATE INDEX "group_members_tenant_id_user_id_idx" ON "group_members"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_group_id_user_id_key" ON "group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "integration_configs_tenant_id_is_enabled_idx" ON "integration_configs"("tenant_id", "is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_tenant_id_provider_key" ON "integration_configs"("tenant_id", "provider");

-- CreateIndex
CREATE INDEX "webhook_endpoints_tenant_id_is_active_idx" ON "webhook_endpoints"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "webhook_deliveries_tenant_id_endpoint_id_idx" ON "webhook_deliveries"("tenant_id", "endpoint_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_tenant_id_status_idx" ON "webhook_deliveries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "webhook_deliveries_created_at_idx" ON "webhook_deliveries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_tenant_id_idx" ON "api_keys"("tenant_id");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_expires_at_idx" ON "api_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_hash_key" ON "invites"("token_hash");

-- CreateIndex
CREATE INDEX "invites_tenant_id_status_idx" ON "invites"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "invites"("email");

-- CreateIndex
CREATE INDEX "invites_expires_at_idx" ON "invites"("expires_at");

-- CreateIndex
CREATE INDEX "legal_entities_tenant_id_status_idx" ON "legal_entities"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "legal_entities_tenant_id_document_type_idx" ON "legal_entities"("tenant_id", "document_type");

-- CreateIndex
CREATE INDEX "legal_entities_document_idx" ON "legal_entities"("document");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entities_tenant_id_document_key" ON "legal_entities"("tenant_id", "document");

-- CreateIndex
CREATE INDEX "legal_entity_representatives_tenant_id_entity_id_idx" ON "legal_entity_representatives"("tenant_id", "entity_id");

-- CreateIndex
CREATE INDEX "contracts_tenant_id_status_idx" ON "contracts"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "contracts_tenant_id_type_idx" ON "contracts"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "contracts_expires_at_idx" ON "contracts"("expires_at");

-- CreateIndex
CREATE INDEX "contracts_parent_id_idx" ON "contracts"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_tenant_id_contract_number_key" ON "contracts"("tenant_id", "contract_number");

-- CreateIndex
CREATE INDEX "contract_parties_tenant_id_contract_id_idx" ON "contract_parties"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_signers_tenant_id_contract_id_idx" ON "contract_signers"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_obligations_tenant_id_contract_id_idx" ON "contract_obligations"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_obligations_tenant_id_status_idx" ON "contract_obligations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "contract_obligations_due_date_idx" ON "contract_obligations"("due_date");

-- CreateIndex
CREATE INDEX "contract_attachments_tenant_id_contract_id_idx" ON "contract_attachments"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_notes_tenant_id_contract_id_idx" ON "contract_notes"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_status_history_tenant_id_contract_id_idx" ON "contract_status_history"("tenant_id", "contract_id");

-- CreateIndex
CREATE INDEX "contract_status_history_created_at_idx" ON "contract_status_history"("created_at");

-- CreateIndex
CREATE INDEX "cases_tenant_id_status_idx" ON "cases"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "cases_tenant_id_client_id_idx" ON "cases"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "cases_tenant_id_court_number_idx" ON "cases"("tenant_id", "court_number");

-- CreateIndex
CREATE INDEX "cases_tenant_id_lead_attorney_id_idx" ON "cases"("tenant_id", "lead_attorney_id");

-- CreateIndex
CREATE INDEX "cases_tenant_id_deleted_at_idx" ON "cases"("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "case_matters_tenant_id_case_id_idx" ON "case_matters"("tenant_id", "case_id");

-- CreateIndex
CREATE INDEX "case_status_histories_tenant_id_case_id_created_at_idx" ON "case_status_histories"("tenant_id", "case_id", "created_at");

-- CreateIndex
CREATE INDEX "case_parties_tenant_id_case_id_role_idx" ON "case_parties"("tenant_id", "case_id", "role");

-- CreateIndex
CREATE INDEX "case_parties_tenant_id_document_number_idx" ON "case_parties"("tenant_id", "document_number");

-- CreateIndex
CREATE INDEX "case_tasks_tenant_id_case_id_status_idx" ON "case_tasks"("tenant_id", "case_id", "status");

-- CreateIndex
CREATE INDEX "case_tasks_tenant_id_assigned_to_id_due_date_idx" ON "case_tasks"("tenant_id", "assigned_to_id", "due_date");

-- CreateIndex
CREATE INDEX "case_tasks_tenant_id_due_date_idx" ON "case_tasks"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "case_deadlines_tenant_id_case_id_due_date_idx" ON "case_deadlines"("tenant_id", "case_id", "due_date");

-- CreateIndex
CREATE INDEX "case_deadlines_tenant_id_due_date_is_fulfilled_idx" ON "case_deadlines"("tenant_id", "due_date", "is_fulfilled");

-- CreateIndex
CREATE INDEX "case_deadlines_tenant_id_responsible_id_due_date_idx" ON "case_deadlines"("tenant_id", "responsible_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "case_time_entries_timer_session_id_key" ON "case_time_entries"("timer_session_id");

-- CreateIndex
CREATE INDEX "case_time_entries_tenant_id_case_id_status_idx" ON "case_time_entries"("tenant_id", "case_id", "status");

-- CreateIndex
CREATE INDEX "case_time_entries_tenant_id_user_id_started_at_idx" ON "case_time_entries"("tenant_id", "user_id", "started_at");

-- CreateIndex
CREATE INDEX "case_time_entries_tenant_id_matter_id_idx" ON "case_time_entries"("tenant_id", "matter_id");

-- CreateIndex
CREATE INDEX "case_time_entries_tenant_id_status_is_billable_idx" ON "case_time_entries"("tenant_id", "status", "is_billable");

-- CreateIndex
CREATE INDEX "billable_records_tenant_id_case_id_status_idx" ON "billable_records"("tenant_id", "case_id", "status");

-- CreateIndex
CREATE INDEX "billable_records_tenant_id_client_id_idx" ON "billable_records"("tenant_id", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "trust_accounts_case_id_key" ON "trust_accounts"("case_id");

-- CreateIndex
CREATE INDEX "trust_accounts_tenant_id_client_id_idx" ON "trust_accounts"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "trust_transactions_tenant_id_trust_account_id_transaction_d_idx" ON "trust_transactions"("tenant_id", "trust_account_id", "transaction_date");

-- CreateIndex
CREATE INDEX "case_documents_tenant_id_case_id_document_type_idx" ON "case_documents"("tenant_id", "case_id", "document_type");

-- CreateIndex
CREATE INDEX "case_notes_tenant_id_case_id_created_at_idx" ON "case_notes"("tenant_id", "case_id", "created_at");

-- CreateIndex
CREATE INDEX "mrr_snapshots_tenant_id_snapshot_date_idx" ON "mrr_snapshots"("tenant_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "mrr_snapshots_snapshot_date_idx" ON "mrr_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "mrr_snapshots_tenant_id_snapshot_date_key" ON "mrr_snapshots"("tenant_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_event_id_key" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_tenant_id_event_type_idx" ON "stripe_webhook_events"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_event_id_idx" ON "stripe_webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_processed_idx" ON "stripe_webhook_events"("processed");

-- CreateIndex
CREATE INDEX "churn_events_tenant_id_churned_at_idx" ON "churn_events"("tenant_id", "churned_at");

-- CreateIndex
CREATE INDEX "churn_events_churn_type_churned_at_idx" ON "churn_events"("churn_type", "churned_at");

-- CreateIndex
CREATE INDEX "churn_events_subscription_id_idx" ON "churn_events"("subscription_id");

-- CreateIndex
CREATE INDEX "churn_events_churned_at_idx" ON "churn_events"("churned_at");

-- CreateIndex
CREATE INDEX "cohort_analyses_cohort_month_months_elapsed_idx" ON "cohort_analyses"("cohort_month", "months_elapsed");

-- CreateIndex
CREATE INDEX "cohort_analyses_analysis_month_idx" ON "cohort_analyses"("analysis_month");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_analyses_cohort_month_analysis_month_segment_key" ON "cohort_analyses"("cohort_month", "analysis_month", "segment");

-- CreateIndex
CREATE INDEX "feature_adoption_logs_tenant_id_feature_module_usage_date_idx" ON "feature_adoption_logs"("tenant_id", "feature_module", "usage_date");

-- CreateIndex
CREATE INDEX "feature_adoption_logs_feature_key_usage_date_idx" ON "feature_adoption_logs"("feature_key", "usage_date");

-- CreateIndex
CREATE INDEX "feature_adoption_logs_tenant_id_usage_date_idx" ON "feature_adoption_logs"("tenant_id", "usage_date");

-- CreateIndex
CREATE UNIQUE INDEX "feature_adoption_logs_tenant_id_feature_key_usage_date_key" ON "feature_adoption_logs"("tenant_id", "feature_key", "usage_date");

-- CreateIndex
CREATE INDEX "revenue_metrics_tenant_id_expanded_at_idx" ON "revenue_metrics"("tenant_id", "expanded_at");

-- CreateIndex
CREATE INDEX "revenue_metrics_expansion_type_expanded_at_idx" ON "revenue_metrics"("expansion_type", "expanded_at");

-- CreateIndex
CREATE INDEX "revenue_metrics_subscription_id_idx" ON "revenue_metrics"("subscription_id");

-- CreateIndex
CREATE INDEX "customer_health_scores_tenant_id_calculated_at_idx" ON "customer_health_scores"("tenant_id", "calculated_at");

-- CreateIndex
CREATE INDEX "customer_health_scores_score_category_calculated_at_idx" ON "customer_health_scores"("score_category", "calculated_at");

-- CreateIndex
CREATE INDEX "customer_health_scores_overall_score_idx" ON "customer_health_scores"("overall_score");

-- CreateIndex
CREATE UNIQUE INDEX "customer_health_scores_tenant_id_calculated_at_key" ON "customer_health_scores"("tenant_id", "calculated_at");

-- CreateIndex
CREATE INDEX "properties_tenant_id_idx" ON "properties"("tenant_id");

-- CreateIndex
CREATE INDEX "properties_tenant_id_status_idx" ON "properties"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "properties_tenant_id_type_idx" ON "properties"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "property_units_tenant_id_idx" ON "property_units"("tenant_id");

-- CreateIndex
CREATE INDEX "property_units_tenant_id_property_id_idx" ON "property_units"("tenant_id", "property_id");

-- CreateIndex
CREATE INDEX "property_units_tenant_id_is_available_idx" ON "property_units"("tenant_id", "is_available");

-- CreateIndex
CREATE UNIQUE INDEX "property_units_tenant_id_property_id_unit_number_key" ON "property_units"("tenant_id", "property_id", "unit_number");

-- CreateIndex
CREATE INDEX "renters_tenant_id_idx" ON "renters"("tenant_id");

-- CreateIndex
CREATE INDEX "renters_tenant_id_cpf_idx" ON "renters"("tenant_id", "cpf");

-- CreateIndex
CREATE INDEX "renters_tenant_id_name_idx" ON "renters"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "guarantors_tenant_id_idx" ON "guarantors"("tenant_id");

-- CreateIndex
CREATE INDEX "guarantors_tenant_id_renter_id_idx" ON "guarantors"("tenant_id", "renter_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_idx" ON "leases"("tenant_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_status_idx" ON "leases"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "leases_tenant_id_property_id_idx" ON "leases"("tenant_id", "property_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_renter_id_idx" ON "leases"("tenant_id", "renter_id");

-- CreateIndex
CREATE INDEX "leases_tenant_id_end_date_idx" ON "leases"("tenant_id", "end_date");

-- CreateIndex
CREATE INDEX "rent_payments_tenant_id_idx" ON "rent_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "rent_payments_tenant_id_lease_id_idx" ON "rent_payments"("tenant_id", "lease_id");

-- CreateIndex
CREATE INDEX "rent_payments_tenant_id_status_idx" ON "rent_payments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "rent_payments_tenant_id_due_date_idx" ON "rent_payments"("tenant_id", "due_date");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_idx" ON "warehouses"("tenant_id");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_is_active_idx" ON "warehouses"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_tenant_id_code_key" ON "warehouses"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "stock_items_tenant_id_idx" ON "stock_items"("tenant_id");

-- CreateIndex
CREATE INDEX "stock_items_tenant_id_warehouse_id_idx" ON "stock_items"("tenant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_items_tenant_id_sku_idx" ON "stock_items"("tenant_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_tenant_id_sku_warehouse_id_key" ON "stock_items"("tenant_id", "sku", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_idx" ON "stock_movements"("tenant_id");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_stock_item_id_idx" ON "stock_movements"("tenant_id", "stock_item_id");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_type_idx" ON "stock_movements"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_created_at_idx" ON "stock_movements"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "sales_orders_tenant_id_idx" ON "sales_orders"("tenant_id");

-- CreateIndex
CREATE INDEX "sales_orders_tenant_id_status_idx" ON "sales_orders"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sales_orders_tenant_id_created_at_idx" ON "sales_orders"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_tenant_id_order_number_key" ON "sales_orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "sales_order_items_tenant_id_sales_order_id_idx" ON "sales_order_items"("tenant_id", "sales_order_id");

-- CreateIndex
CREATE INDEX "purchase_orders_tenant_id_idx" ON "purchase_orders"("tenant_id");

-- CreateIndex
CREATE INDEX "purchase_orders_tenant_id_status_idx" ON "purchase_orders"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "purchase_orders_tenant_id_created_at_idx" ON "purchase_orders"("tenant_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_tenant_id_order_number_key" ON "purchase_orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "purchase_order_items_tenant_id_purchase_order_id_idx" ON "purchase_order_items"("tenant_id", "purchase_order_id");

-- CreateIndex
CREATE INDEX "remote_time_entries_tenant_id_employee_id_idx" ON "remote_time_entries"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "remote_time_entries_tenant_id_project_id_idx" ON "remote_time_entries"("tenant_id", "project_id");

-- CreateIndex
CREATE INDEX "remote_time_entries_tenant_id_is_running_idx" ON "remote_time_entries"("tenant_id", "is_running");

-- CreateIndex
CREATE INDEX "remote_time_entries_tenant_id_start_time_idx" ON "remote_time_entries"("tenant_id", "start_time");

-- CreateIndex
CREATE INDEX "billing_rates_tenant_id_employee_id_idx" ON "billing_rates"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "billing_rates_tenant_id_employee_id_effective_from_idx" ON "billing_rates"("tenant_id", "employee_id", "effective_from");

-- CreateIndex
CREATE INDEX "timesheet_periods_tenant_id_status_idx" ON "timesheet_periods"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "timesheet_periods_tenant_id_employee_id_idx" ON "timesheet_periods"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_periods_tenant_id_employee_id_start_date_key" ON "timesheet_periods"("tenant_id", "employee_id", "start_date");

-- CreateIndex
CREATE INDEX "work_schedules_tenant_id_employee_id_idx" ON "work_schedules"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_days_work_schedule_id_day_of_week_key" ON "work_days"("work_schedule_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "timezone_configs_employee_id_key" ON "timezone_configs"("employee_id");

-- CreateIndex
CREATE INDEX "timezone_configs_tenant_id_idx" ON "timezone_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "async_standups_tenant_id_idx" ON "async_standups"("tenant_id");

-- CreateIndex
CREATE INDEX "standup_responses_tenant_id_standup_id_idx" ON "standup_responses"("tenant_id", "standup_id");

-- CreateIndex
CREATE INDEX "standup_responses_tenant_id_employee_id_idx" ON "standup_responses"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "standup_responses_standup_id_submitted_at_idx" ON "standup_responses"("standup_id", "submitted_at");

-- CreateIndex
CREATE INDEX "team_channels_tenant_id_type_idx" ON "team_channels"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "team_channels_tenant_id_project_id_idx" ON "team_channels"("tenant_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_channels_tenant_id_name_key" ON "team_channels"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "team_channel_members_tenant_id_user_id_idx" ON "team_channel_members"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_channel_members_channel_id_user_id_key" ON "team_channel_members"("channel_id", "user_id");

-- CreateIndex
CREATE INDEX "team_updates_tenant_id_channel_id_idx" ON "team_updates"("tenant_id", "channel_id");

-- CreateIndex
CREATE INDEX "team_updates_channel_id_created_at_idx" ON "team_updates"("channel_id", "created_at");

-- CreateIndex
CREATE INDEX "team_meetings_tenant_id_scheduled_at_idx" ON "team_meetings"("tenant_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "team_meetings_tenant_id_channel_id_idx" ON "team_meetings"("tenant_id", "channel_id");

-- CreateIndex
CREATE INDEX "team_meeting_participants_tenant_id_user_id_idx" ON "team_meeting_participants"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_meeting_participants_meeting_id_user_id_key" ON "team_meeting_participants"("meeting_id", "user_id");

-- CreateIndex
CREATE INDEX "dre_snapshots_tenant_id_period_idx" ON "dre_snapshots"("tenant_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "dre_snapshots_tenant_id_period_basis_key" ON "dre_snapshots"("tenant_id", "period", "basis");

-- CreateIndex
CREATE INDEX "dre_category_breakdowns_dre_snapshot_id_level_idx" ON "dre_category_breakdowns"("dre_snapshot_id", "level");

-- CreateIndex
CREATE INDEX "cash_flow_snapshots_tenant_id_period_idx" ON "cash_flow_snapshots"("tenant_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "cash_flow_snapshots_tenant_id_period_key" ON "cash_flow_snapshots"("tenant_id", "period");

-- CreateIndex
CREATE INDEX "financial_indicators_tenant_id_indicator_key_idx" ON "financial_indicators"("tenant_id", "indicator_key");

-- CreateIndex
CREATE UNIQUE INDEX "financial_indicators_tenant_id_period_indicator_key_key" ON "financial_indicators"("tenant_id", "period", "indicator_key");

-- CreateIndex
CREATE INDEX "health_score_alert_rules_tenant_id_is_active_idx" ON "health_score_alert_rules"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "health_score_alerts_tenant_id_created_at_idx" ON "health_score_alerts"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "health_score_alerts_alerted_tenant_id_idx" ON "health_score_alerts"("alerted_tenant_id");

-- CreateIndex
CREATE INDEX "health_score_alerts_rule_id_idx" ON "health_score_alerts"("rule_id");

-- CreateIndex
CREATE INDEX "expansion_opportunities_tenant_id_status_idx" ON "expansion_opportunities"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "expansion_opportunities_target_tenant_id_idx" ON "expansion_opportunities"("target_tenant_id");

-- CreateIndex
CREATE INDEX "expansion_opportunities_expansion_signal_score_idx" ON "expansion_opportunities"("expansion_signal_score");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_idx" ON "equipment"("tenant_id");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_status_idx" ON "equipment"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_category_idx" ON "equipment"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "equipment_tenant_id_serial_number_idx" ON "equipment"("tenant_id", "serial_number");

-- CreateIndex
CREATE INDEX "asset_registries_tenant_id_idx" ON "asset_registries"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_registries_tenant_id_category_idx" ON "asset_registries"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "asset_registries_tenant_id_is_active_idx" ON "asset_registries"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "asset_registries_tenant_id_asset_tag_key" ON "asset_registries"("tenant_id", "asset_tag");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_idx" ON "asset_assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_equipment_id_idx" ON "asset_assignments"("tenant_id", "equipment_id");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_assigned_to_id_idx" ON "asset_assignments"("tenant_id", "assigned_to_id");

-- CreateIndex
CREATE INDEX "asset_assignments_tenant_id_status_idx" ON "asset_assignments"("tenant_id", "status");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_configs" ADD CONSTRAINT "integration_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_configs" ADD CONSTRAINT "integration_configs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entities" ADD CONSTRAINT "legal_entities_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entity_representatives" ADD CONSTRAINT "legal_entity_representatives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entity_representatives" ADD CONSTRAINT "legal_entity_representatives_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "legal_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_parties" ADD CONSTRAINT "contract_parties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_parties" ADD CONSTRAINT "contract_parties_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_parties" ADD CONSTRAINT "contract_parties_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "legal_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signers" ADD CONSTRAINT "contract_signers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_signers" ADD CONSTRAINT "contract_signers_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_obligations" ADD CONSTRAINT "contract_obligations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_obligations" ADD CONSTRAINT "contract_obligations_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_obligations" ADD CONSTRAINT "contract_obligations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_attachments" ADD CONSTRAINT "contract_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_attachments" ADD CONSTRAINT "contract_attachments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_attachments" ADD CONSTRAINT "contract_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_notes" ADD CONSTRAINT "contract_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_notes" ADD CONSTRAINT "contract_notes_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_notes" ADD CONSTRAINT "contract_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_status_history" ADD CONSTRAINT "contract_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_status_history" ADD CONSTRAINT "contract_status_history_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_status_history" ADD CONSTRAINT "contract_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_lead_attorney_id_fkey" FOREIGN KEY ("lead_attorney_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_matters" ADD CONSTRAINT "case_matters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_matters" ADD CONSTRAINT "case_matters_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_status_histories" ADD CONSTRAINT "case_status_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_status_histories" ADD CONSTRAINT "case_status_histories_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_status_histories" ADD CONSTRAINT "case_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "case_matters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "case_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_tasks" ADD CONSTRAINT "case_tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_deadlines" ADD CONSTRAINT "case_deadlines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_deadlines" ADD CONSTRAINT "case_deadlines_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "case_matters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "case_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_time_entries" ADD CONSTRAINT "case_time_entries_billable_record_id_fkey" FOREIGN KEY ("billable_record_id") REFERENCES "billable_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billable_records" ADD CONSTRAINT "billable_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billable_records" ADD CONSTRAINT "billable_records_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billable_records" ADD CONSTRAINT "billable_records_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "case_matters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_accounts" ADD CONSTRAINT "trust_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_accounts" ADD CONSTRAINT "trust_accounts_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_trust_account_id_fkey" FOREIGN KEY ("trust_account_id") REFERENCES "trust_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_transactions" ADD CONSTRAINT "trust_transactions_authorized_by_id_fkey" FOREIGN KEY ("authorized_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrr_snapshots" ADD CONSTRAINT "mrr_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_webhook_events" ADD CONSTRAINT "stripe_webhook_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "churn_events" ADD CONSTRAINT "churn_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_adoption_logs" ADD CONSTRAINT "feature_adoption_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_metrics" ADD CONSTRAINT "revenue_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_health_scores" ADD CONSTRAINT "customer_health_scores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantors" ADD CONSTRAINT "guarantors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guarantors" ADD CONSTRAINT "guarantors_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "property_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_renewed_from_id_fkey" FOREIGN KEY ("renewed_from_id") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_sales_order_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remote_time_entries" ADD CONSTRAINT "remote_time_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remote_time_entries" ADD CONSTRAINT "remote_time_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_rates" ADD CONSTRAINT "billing_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_rates" ADD CONSTRAINT "billing_rates_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_periods" ADD CONSTRAINT "timesheet_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_periods" ADD CONSTRAINT "timesheet_periods_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_days" ADD CONSTRAINT "work_days_work_schedule_id_fkey" FOREIGN KEY ("work_schedule_id") REFERENCES "work_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timezone_configs" ADD CONSTRAINT "timezone_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timezone_configs" ADD CONSTRAINT "timezone_configs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "async_standups" ADD CONSTRAINT "async_standups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standup_responses" ADD CONSTRAINT "standup_responses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standup_responses" ADD CONSTRAINT "standup_responses_standup_id_fkey" FOREIGN KEY ("standup_id") REFERENCES "async_standups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standup_responses" ADD CONSTRAINT "standup_responses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_channels" ADD CONSTRAINT "team_channels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_channels" ADD CONSTRAINT "team_channels_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_channel_members" ADD CONSTRAINT "team_channel_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_channel_members" ADD CONSTRAINT "team_channel_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "team_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_channel_members" ADD CONSTRAINT "team_channel_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_updates" ADD CONSTRAINT "team_updates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_updates" ADD CONSTRAINT "team_updates_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "team_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_updates" ADD CONSTRAINT "team_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meetings" ADD CONSTRAINT "team_meetings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meetings" ADD CONSTRAINT "team_meetings_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "team_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meetings" ADD CONSTRAINT "team_meetings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meeting_participants" ADD CONSTRAINT "team_meeting_participants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meeting_participants" ADD CONSTRAINT "team_meeting_participants_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "team_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_meeting_participants" ADD CONSTRAINT "team_meeting_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dre_snapshots" ADD CONSTRAINT "dre_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dre_category_breakdowns" ADD CONSTRAINT "dre_category_breakdowns_dre_snapshot_id_fkey" FOREIGN KEY ("dre_snapshot_id") REFERENCES "dre_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_flow_snapshots" ADD CONSTRAINT "cash_flow_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_indicators" ADD CONSTRAINT "financial_indicators_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_score_alert_rules" ADD CONSTRAINT "health_score_alert_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_score_alerts" ADD CONSTRAINT "health_score_alerts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expansion_opportunities" ADD CONSTRAINT "expansion_opportunities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_registries" ADD CONSTRAINT "asset_registries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_registries" ADD CONSTRAINT "asset_registries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
