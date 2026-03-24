-- Clients + CRM Module
-- 14 models, 5 enums, PostgreSQL trigger for lifecycle tracking

-- CreateEnum
CREATE TYPE "ContactLifecycleStage" AS ENUM ('LEAD', 'MQL', 'SQL', 'OPPORTUNITY', 'ACTIVE_CLIENT', 'AT_RISK', 'CHURNED', 'ADVOCATE');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('PERSON', 'COMPANY', 'PARTNER', 'VENDOR');

-- CreateEnum
CREATE TYPE "HealthCategory" AS ENUM ('HEALTHY', 'AT_RISK', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('UP', 'DOWN', 'STABLE');

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_type" "ContactType" NOT NULL DEFAULT 'PERSON',
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "phone_alt" TEXT,
    "linkedin_url" TEXT,
    "avatar_url" TEXT,
    "organization_id" TEXT,
    "job_title" TEXT,
    "department" TEXT,
    "lifecycle_stage" "ContactLifecycleStage" NOT NULL DEFAULT 'LEAD',
    "status" "ContactStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "source_detail" TEXT,
    "country" TEXT DEFAULT 'BR',
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "postal_code" TEXT,
    "lead_score" INTEGER DEFAULT 0,
    "qualified_at" TIMESTAMP(3),
    "assigned_to_id" TEXT,
    "enriched_at" TIMESTAMP(3),
    "enrichment_data" JSONB,
    "enrichment_status" TEXT,
    "custom_fields" JSONB,
    "preferred_channel" TEXT,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed_at" TIMESTAMP(3),
    "do_not_contact" BOOLEAN NOT NULL DEFAULT false,
    "nps_score" INTEGER,
    "nps_last_at" TIMESTAMP(3),
    "notes" TEXT,
    "owner_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_organizations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "cnpj" TEXT,
    "website" TEXT,
    "linkedin_url" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "revenue" TEXT,
    "country" TEXT DEFAULT 'BR',
    "state" TEXT,
    "city" TEXT,
    "enriched_at" TIMESTAMP(3),
    "enrichment_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "tags" TEXT[],
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "crm_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "area_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_tags" (
    "contact_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by_id" TEXT,

    CONSTRAINT "contact_tags_pkey" PRIMARY KEY ("contact_id","tag_id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "area_slug" TEXT,
    "query_def" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "last_evaluated_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_segments" (
    "contact_id" TEXT NOT NULL,
    "segment_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_segments_pkey" PRIMARY KEY ("contact_id","segment_id")
);

-- CreateTable
CREATE TABLE "crm_interactions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "user_id" TEXT,
    "agent_id" TEXT,
    "type" TEXT NOT NULL,
    "channel" TEXT,
    "direction" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "duration" INTEGER,
    "outcome" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_timeline_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycle_histories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "from_stage" TEXT,
    "to_stage" TEXT NOT NULL,
    "changed_by_id" TEXT,
    "reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_feedbacks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "score" INTEGER,
    "comment" TEXT,
    "sentiment" TEXT,
    "triggered_by" TEXT,
    "source_id" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lifecycle_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "industry" TEXT,
    "name" TEXT NOT NULL,
    "stages" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_health_scores" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "category" "HealthCategory" NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculated_by" TEXT,

    CONSTRAINT "client_health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_health_histories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "previous_score" INTEGER NOT NULL,
    "new_score" INTEGER NOT NULL,
    "previous_category" "HealthCategory" NOT NULL,
    "new_category" "HealthCategory" NOT NULL,
    "delta" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_health_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_contacts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "shared_with_tenant_id" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL,
    "shared_by" TEXT NOT NULL,
    "shared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "shared_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_lifecycle_stage_idx" ON "contacts"("tenant_id", "lifecycle_stage");
CREATE INDEX "contacts_tenant_id_status_idx" ON "contacts"("tenant_id", "status");
CREATE INDEX "contacts_tenant_id_email_idx" ON "contacts"("tenant_id", "email");
CREATE INDEX "contacts_tenant_id_lead_score_idx" ON "contacts"("tenant_id", "lead_score");
CREATE INDEX "contacts_tenant_id_deleted_at_idx" ON "contacts"("tenant_id", "deleted_at");
CREATE INDEX "contacts_tenant_id_contact_type_idx" ON "contacts"("tenant_id", "contact_type");
CREATE INDEX "contacts_tenant_id_assigned_to_id_idx" ON "contacts"("tenant_id", "assigned_to_id");
CREATE INDEX "contacts_tenant_id_organization_id_idx" ON "contacts"("tenant_id", "organization_id");

CREATE INDEX "crm_organizations_tenant_id_domain_idx" ON "crm_organizations"("tenant_id", "domain");
CREATE INDEX "crm_organizations_tenant_id_status_idx" ON "crm_organizations"("tenant_id", "status");
CREATE INDEX "crm_organizations_tenant_id_industry_idx" ON "crm_organizations"("tenant_id", "industry");

CREATE UNIQUE INDEX "tags_tenant_id_name_area_slug_key" ON "tags"("tenant_id", "name", "area_slug");
CREATE INDEX "tags_tenant_id_idx" ON "tags"("tenant_id");

CREATE INDEX "segments_tenant_id_area_slug_idx" ON "segments"("tenant_id", "area_slug");
CREATE INDEX "segments_tenant_id_created_by_id_idx" ON "segments"("tenant_id", "created_by_id");

CREATE INDEX "crm_interactions_tenant_id_contact_id_idx" ON "crm_interactions"("tenant_id", "contact_id");
CREATE INDEX "crm_interactions_tenant_id_type_idx" ON "crm_interactions"("tenant_id", "type");
CREATE INDEX "crm_interactions_contact_id_occurred_at_idx" ON "crm_interactions"("contact_id", "occurred_at");

CREATE INDEX "crm_timeline_events_tenant_id_contact_id_occurred_at_idx" ON "crm_timeline_events"("tenant_id", "contact_id", "occurred_at");
CREATE INDEX "crm_timeline_events_tenant_id_source_type_idx" ON "crm_timeline_events"("tenant_id", "source_type");

CREATE INDEX "lifecycle_histories_tenant_id_contact_id_idx" ON "lifecycle_histories"("tenant_id", "contact_id");
CREATE INDEX "lifecycle_histories_tenant_id_changed_at_idx" ON "lifecycle_histories"("tenant_id", "changed_at");

CREATE INDEX "customer_feedbacks_tenant_id_feedback_type_idx" ON "customer_feedbacks"("tenant_id", "feedback_type");
CREATE INDEX "customer_feedbacks_tenant_id_contact_id_idx" ON "customer_feedbacks"("tenant_id", "contact_id");

CREATE INDEX "lifecycle_templates_tenant_id_idx" ON "lifecycle_templates"("tenant_id");
CREATE INDEX "lifecycle_templates_industry_idx" ON "lifecycle_templates"("industry");

CREATE INDEX "client_health_scores_tenant_id_contact_id_idx" ON "client_health_scores"("tenant_id", "contact_id");
CREATE INDEX "client_health_scores_tenant_id_category_idx" ON "client_health_scores"("tenant_id", "category");
CREATE INDEX "client_health_scores_tenant_id_calculated_at_idx" ON "client_health_scores"("tenant_id", "calculated_at");

CREATE INDEX "client_health_histories_tenant_id_contact_id_idx" ON "client_health_histories"("tenant_id", "contact_id");
CREATE INDEX "client_health_histories_tenant_id_changed_at_idx" ON "client_health_histories"("tenant_id", "changed_at");

CREATE UNIQUE INDEX "shared_contacts_contact_id_shared_with_tenant_id_key" ON "shared_contacts"("contact_id", "shared_with_tenant_id");
CREATE INDEX "shared_contacts_tenant_id_contact_id_idx" ON "shared_contacts"("tenant_id", "contact_id");
CREATE INDEX "shared_contacts_shared_with_tenant_id_idx" ON "shared_contacts"("shared_with_tenant_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "crm_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm_organizations" ADD CONSTRAINT "crm_organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tags" ADD CONSTRAINT "tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_tags" ADD CONSTRAINT "contact_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "segments" ADD CONSTRAINT "segments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "segments" ADD CONSTRAINT "segments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contact_segments" ADD CONSTRAINT "contact_segments_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_segments" ADD CONSTRAINT "contact_segments_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm_interactions" ADD CONSTRAINT "crm_interactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_interactions" ADD CONSTRAINT "crm_interactions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_interactions" ADD CONSTRAINT "crm_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm_timeline_events" ADD CONSTRAINT "crm_timeline_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_timeline_events" ADD CONSTRAINT "crm_timeline_events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lifecycle_histories" ADD CONSTRAINT "lifecycle_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lifecycle_histories" ADD CONSTRAINT "lifecycle_histories_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lifecycle_histories" ADD CONSTRAINT "lifecycle_histories_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_feedbacks" ADD CONSTRAINT "customer_feedbacks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_feedbacks" ADD CONSTRAINT "customer_feedbacks_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lifecycle_templates" ADD CONSTRAINT "lifecycle_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "client_health_scores" ADD CONSTRAINT "client_health_scores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_health_scores" ADD CONSTRAINT "client_health_scores_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "client_health_histories" ADD CONSTRAINT "client_health_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_health_histories" ADD CONSTRAINT "client_health_histories_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shared_contacts" ADD CONSTRAINT "shared_contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_contacts" ADD CONSTRAINT "shared_contacts_shared_with_tenant_id_fkey" FOREIGN KEY ("shared_with_tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_contacts" ADD CONSTRAINT "shared_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_contacts" ADD CONSTRAINT "shared_contacts_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===========================
-- PostgreSQL Trigger: Lifecycle Stage Tracking
-- ===========================
-- Automatically inserts a LifecycleHistory record when
-- a contact's lifecycle_stage changes.

CREATE OR REPLACE FUNCTION fn_track_lifecycle_stage()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.lifecycle_stage IS DISTINCT FROM NEW.lifecycle_stage THEN
    INSERT INTO lifecycle_histories (id, tenant_id, contact_id, from_stage, to_stage, changed_at)
    VALUES (gen_random_uuid(), NEW.tenant_id, NEW.id, OLD.lifecycle_stage::text, NEW.lifecycle_stage::text, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contact_lifecycle_change
AFTER UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION fn_track_lifecycle_stage();
