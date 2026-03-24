-- =============================================
-- Content Operations Module
-- =============================================

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('IDEA', 'BRIEF', 'IN_CREATION', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "content_type" AS ENUM ('ARTICLE', 'BLOG_POST', 'SOCIAL_POST', 'VIDEO', 'PODCAST', 'NEWSLETTER', 'INFOGRAPHIC', 'EBOOK', 'CASE_STUDY', 'WEBINAR', 'OTHER');

-- CreateEnum
CREATE TYPE "asset_type" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'ARCHIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "review_decision" AS ENUM ('APPROVED', 'NEEDS_REVISION', 'REJECTED');

-- CreateEnum
CREATE TYPE "channel_platform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'YOUTUBE', 'TIKTOK', 'PINTEREST', 'BLOG', 'NEWSLETTER', 'PODCAST', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "performance_metric_type" AS ENUM ('VIEWS', 'IMPRESSIONS', 'REACH', 'ENGAGEMENT_RATE', 'LIKES', 'COMMENTS', 'SHARES', 'SAVES', 'CLICKS', 'CTR', 'WATCH_TIME', 'SUBSCRIBERS_GAINED', 'OPEN_RATE', 'CLICK_RATE', 'BOUNCE_RATE', 'CONVERSIONS');

-- CreateTable
CREATE TABLE "content_calendars" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "lead_time_days" INTEGER NOT NULL DEFAULT 7,
    "approval_chain" JSONB,
    "client_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_briefs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_type" "content_type" NOT NULL,
    "objective" TEXT NOT NULL,
    "target_audience" TEXT,
    "tone_of_voice" TEXT,
    "primary_keyword" TEXT,
    "secondary_keywords" TEXT[],
    "headline" TEXT,
    "outline" JSONB,
    "references" JSONB,
    "cta" TEXT,
    "kpi_targets" JSONB,
    "word_count_target" INTEGER,
    "duration_target" INTEGER,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_pieces" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "brief_id" TEXT,
    "parent_id" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "content_type" "content_type" NOT NULL,
    "status" "content_status" NOT NULL DEFAULT 'IDEA',
    "scheduled_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "embargo" TIMESTAMP(3),
    "assigned_to_id" TEXT,
    "channel_id" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "decision" "review_decision" NOT NULL,
    "comments" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "review_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_assets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "asset_type" "asset_type" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "metadata" JSONB,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_channels" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "channel_platform" NOT NULL,
    "account_name" TEXT,
    "account_url" TEXT,
    "access_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_performance" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "metric_type" "performance_metric_type" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_status_histories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "piece_id" TEXT NOT NULL,
    "from_status" "content_status",
    "to_status" "content_status" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_status_histories_pkey" PRIMARY KEY ("id")
);

-- Content Ops Indexes
CREATE INDEX "content_calendars_tenant_id_is_active_idx" ON "content_calendars"("tenant_id", "is_active");
CREATE INDEX "content_calendars_tenant_id_client_id_idx" ON "content_calendars"("tenant_id", "client_id");
CREATE INDEX "content_briefs_tenant_id_content_type_idx" ON "content_briefs"("tenant_id", "content_type");
CREATE INDEX "content_briefs_tenant_id_created_by_id_idx" ON "content_briefs"("tenant_id", "created_by_id");
CREATE INDEX "content_pieces_tenant_id_status_idx" ON "content_pieces"("tenant_id", "status");
CREATE INDEX "content_pieces_tenant_id_calendar_id_idx" ON "content_pieces"("tenant_id", "calendar_id");
CREATE INDEX "content_pieces_tenant_id_content_type_idx" ON "content_pieces"("tenant_id", "content_type");
CREATE INDEX "content_pieces_tenant_id_scheduled_at_idx" ON "content_pieces"("tenant_id", "scheduled_at");
CREATE INDEX "content_pieces_tenant_id_assigned_to_id_idx" ON "content_pieces"("tenant_id", "assigned_to_id");
CREATE INDEX "content_reviews_tenant_id_piece_id_idx" ON "content_reviews"("tenant_id", "piece_id");
CREATE INDEX "content_reviews_tenant_id_reviewer_id_idx" ON "content_reviews"("tenant_id", "reviewer_id");
CREATE INDEX "content_assets_tenant_id_piece_id_idx" ON "content_assets"("tenant_id", "piece_id");
CREATE INDEX "content_assets_tenant_id_asset_type_idx" ON "content_assets"("tenant_id", "asset_type");
CREATE UNIQUE INDEX "content_channels_tenant_id_platform_account_name_key" ON "content_channels"("tenant_id", "platform", "account_name");
CREATE INDEX "content_channels_tenant_id_is_active_idx" ON "content_channels"("tenant_id", "is_active");
CREATE INDEX "content_performance_tenant_id_piece_id_idx" ON "content_performance"("tenant_id", "piece_id");
CREATE INDEX "content_performance_tenant_id_metric_type_idx" ON "content_performance"("tenant_id", "metric_type");
CREATE INDEX "content_performance_tenant_id_period_start_period_end_idx" ON "content_performance"("tenant_id", "period_start", "period_end");
CREATE INDEX "content_status_histories_tenant_id_piece_id_idx" ON "content_status_histories"("tenant_id", "piece_id");

-- Content Ops Foreign Keys
ALTER TABLE "content_calendars" ADD CONSTRAINT "content_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_calendars" ADD CONSTRAINT "content_calendars_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "content_calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_brief_id_fkey" FOREIGN KEY ("brief_id") REFERENCES "content_briefs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "content_pieces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "content_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "content_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "content_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "content_channels" ADD CONSTRAINT "content_channels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "content_performance" ADD CONSTRAINT "content_performance_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_performance" ADD CONSTRAINT "content_performance_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "content_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_performance" ADD CONSTRAINT "content_performance_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "content_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "content_status_histories" ADD CONSTRAINT "content_status_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_status_histories" ADD CONSTRAINT "content_status_histories_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "content_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_status_histories" ADD CONSTRAINT "content_status_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================
-- Compliance & Security Module
-- =============================================

-- CreateEnum
CREATE TYPE "compliance_framework_type" AS ENUM ('LGPD', 'SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'PCI_DSS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "compliance_item_status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED', 'NON_COMPLIANT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "incident_severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('OPEN', 'INVESTIGATING', 'MITIGATING', 'RESOLVED', 'CLOSED', 'POST_MORTEM');

-- CreateEnum
CREATE TYPE "incident_timeline_type" AS ENUM ('DETECTION', 'NOTIFICATION', 'ESCALATION', 'ACTION_TAKEN', 'MITIGATION', 'RESOLUTION', 'COMMUNICATION', 'POST_MORTEM');

-- CreateEnum
CREATE TYPE "insurance_policy_type" AS ENUM ('CYBER', 'GENERAL_LIABILITY', 'PROFESSIONAL_LIABILITY', 'DIRECTORS_OFFICERS', 'PROPERTY', 'WORKERS_COMP', 'OTHER');

-- CreateEnum
CREATE TYPE "insurance_policy_status" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_RENEWAL');

-- CreateEnum
CREATE TYPE "assessment_type" AS ENUM ('VULNERABILITY_SCAN', 'PENETRATION_TEST', 'CODE_REVIEW', 'INFRASTRUCTURE_AUDIT', 'POLICY_REVIEW', 'VENDOR_ASSESSMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "assessment_status" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "risk_level" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL');

-- CreateTable
CREATE TABLE "compliance_checklists" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "framework_type" "compliance_framework_type" NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "control_ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "compliance_item_status" NOT NULL DEFAULT 'NOT_STARTED',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "evidence" JSONB,
    "notes" TEXT,
    "assignee_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "due_date" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_reports" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "total_controls" INTEGER NOT NULL,
    "compliant_count" INTEGER NOT NULL,
    "non_compliant_count" INTEGER NOT NULL,
    "not_applicable_count" INTEGER NOT NULL,
    "findings" JSONB,
    "recommendations" JSONB,
    "generated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_responses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "incident_severity" NOT NULL,
    "status" "incident_status" NOT NULL DEFAULT 'OPEN',
    "category" TEXT,
    "affected_systems" TEXT[],
    "impact_description" TEXT,
    "root_cause" TEXT,
    "resolution" TEXT,
    "lessons_learned" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "sla_deadline" TIMESTAMP(3),
    "reported_by_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_timelines" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "entry_type" "incident_timeline_type" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "policy_type" "insurance_policy_type" NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "insurance_policy_status" NOT NULL DEFAULT 'ACTIVE',
    "coverage_amount" DOUBLE PRECISION NOT NULL,
    "deductible" DOUBLE PRECISION,
    "premium_amount" DOUBLE PRECISION NOT NULL,
    "premium_frequency" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "renewal_date" TIMESTAMP(3),
    "coverage_details" JSONB,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_assessments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assessment_type" "assessment_type" NOT NULL,
    "status" "assessment_status" NOT NULL DEFAULT 'PLANNED',
    "risk_level" "risk_level",
    "scope" TEXT,
    "methodology" TEXT,
    "findings" JSONB,
    "recommendations" JSONB,
    "findings_count" INTEGER NOT NULL DEFAULT 0,
    "critical_count" INTEGER NOT NULL DEFAULT 0,
    "high_count" INTEGER NOT NULL DEFAULT 0,
    "medium_count" INTEGER NOT NULL DEFAULT 0,
    "low_count" INTEGER NOT NULL DEFAULT 0,
    "scheduled_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "next_assessment" TIMESTAMP(3),
    "assessor_name" TEXT,
    "assessor_org" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_assessments_pkey" PRIMARY KEY ("id")
);

-- Compliance & Security Indexes
CREATE INDEX "compliance_checklists_tenant_id_framework_type_idx" ON "compliance_checklists"("tenant_id", "framework_type");
CREATE INDEX "compliance_checklists_tenant_id_is_template_idx" ON "compliance_checklists"("tenant_id", "is_template");
CREATE INDEX "compliance_items_tenant_id_checklist_id_idx" ON "compliance_items"("tenant_id", "checklist_id");
CREATE INDEX "compliance_items_tenant_id_status_idx" ON "compliance_items"("tenant_id", "status");
CREATE INDEX "compliance_items_tenant_id_assignee_id_idx" ON "compliance_items"("tenant_id", "assignee_id");
CREATE INDEX "compliance_reports_tenant_id_checklist_id_idx" ON "compliance_reports"("tenant_id", "checklist_id");
CREATE INDEX "compliance_reports_tenant_id_created_at_idx" ON "compliance_reports"("tenant_id", "created_at");
CREATE INDEX "incident_responses_tenant_id_severity_idx" ON "incident_responses"("tenant_id", "severity");
CREATE INDEX "incident_responses_tenant_id_status_idx" ON "incident_responses"("tenant_id", "status");
CREATE INDEX "incident_responses_tenant_id_detected_at_idx" ON "incident_responses"("tenant_id", "detected_at");
CREATE INDEX "incident_timelines_tenant_id_incident_id_idx" ON "incident_timelines"("tenant_id", "incident_id");
CREATE UNIQUE INDEX "insurance_policies_tenant_id_policy_number_key" ON "insurance_policies"("tenant_id", "policy_number");
CREATE INDEX "insurance_policies_tenant_id_policy_type_idx" ON "insurance_policies"("tenant_id", "policy_type");
CREATE INDEX "insurance_policies_tenant_id_status_idx" ON "insurance_policies"("tenant_id", "status");
CREATE INDEX "insurance_policies_tenant_id_end_date_idx" ON "insurance_policies"("tenant_id", "end_date");
CREATE INDEX "security_assessments_tenant_id_assessment_type_idx" ON "security_assessments"("tenant_id", "assessment_type");
CREATE INDEX "security_assessments_tenant_id_status_idx" ON "security_assessments"("tenant_id", "status");
CREATE INDEX "security_assessments_tenant_id_risk_level_idx" ON "security_assessments"("tenant_id", "risk_level");

-- Compliance & Security Foreign Keys
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_checklists" ADD CONSTRAINT "compliance_checklists_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "compliance_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "compliance_items" ADD CONSTRAINT "compliance_items_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "compliance_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "incident_responses" ADD CONSTRAINT "incident_responses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incident_responses" ADD CONSTRAINT "incident_responses_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "incident_responses" ADD CONSTRAINT "incident_responses_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "incident_timelines" ADD CONSTRAINT "incident_timelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incident_timelines" ADD CONSTRAINT "incident_timelines_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incident_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incident_timelines" ADD CONSTRAINT "incident_timelines_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "insurance_policies" ADD CONSTRAINT "insurance_policies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "security_assessments" ADD CONSTRAINT "security_assessments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "security_assessments" ADD CONSTRAINT "security_assessments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
