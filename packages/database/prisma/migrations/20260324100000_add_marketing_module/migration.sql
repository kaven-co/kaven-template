-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'PAUSED', 'CANCELLED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CampaignChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "CampaignEventType" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED', 'CONVERTED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('MARKETING', 'TRANSACTIONAL', 'ANALYTICS', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('FORM', 'IMPORT', 'API', 'MANUAL', 'DOUBLE_OPT_IN');

-- CreateEnum
CREATE TYPE "LeadScoreEventType" AS ENUM ('EMAIL_OPENED', 'EMAIL_CLICKED', 'FORM_SUBMITTED', 'PAGE_VISITED', 'DEMO_REQUESTED', 'CONTENT_DOWNLOADED', 'WEBINAR_ATTENDED', 'PROFILE_UPDATED', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('CONTACT_CREATED', 'LIFECYCLE_CHANGED', 'LEAD_SCORE_THRESHOLD', 'FORM_SUBMITTED', 'TAG_ADDED', 'CAMPAIGN_EVENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('SEND_EMAIL', 'ADD_TAG', 'REMOVE_TAG', 'UPDATE_FIELD', 'UPDATE_LIFECYCLE', 'NOTIFY_ASSIGNEE', 'WAIT', 'BRANCH', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "channel" "CampaignChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "timezone" TEXT DEFAULT 'UTC',
    "budget" DOUBLE PRECISION,
    "goal_metric" TEXT,
    "goal_value" DOUBLE PRECISION,
    "subject" TEXT,
    "body" TEXT,
    "html_content" TEXT,
    "template_id" TEXT,
    "segment_id" TEXT,
    "audience_size" INTEGER,
    "audience_snapshot" JSONB,
    "is_ab_test" BOOLEAN NOT NULL DEFAULT false,
    "winner_variant_id" TEXT,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "bounced_count" INTEGER NOT NULL DEFAULT 0,
    "unsub_count" INTEGER NOT NULL DEFAULT 0,
    "converted_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_variants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "html_content" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 50,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "event_type" "CampaignEventType" NOT NULL,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "consent_type" "ConsentType" NOT NULL,
    "channel" "CampaignChannel" NOT NULL,
    "source" "ConsentSource" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,
    "double_opt_in_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_scores" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "engagement_score" INTEGER NOT NULL DEFAULT 0,
    "profile_score" INTEGER NOT NULL DEFAULT 0,
    "behavioral_score" INTEGER NOT NULL DEFAULT 0,
    "demographic_score" INTEGER NOT NULL DEFAULT 0,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "is_qualified" BOOLEAN NOT NULL DEFAULT false,
    "qualified_at" TIMESTAMP(3),
    "mql_threshold" INTEGER NOT NULL DEFAULT 70,
    "last_event_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_score_histories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lead_score_id" TEXT NOT NULL,
    "event_type" "LeadScoreEventType" NOT NULL,
    "dimension" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "previous_score" INTEGER NOT NULL,
    "new_score" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_score_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_email_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "thumbnail" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mkt_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "trigger_type" "AutomationTriggerType" NOT NULL,
    "trigger_config" JSONB,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "enrolled_count" INTEGER NOT NULL DEFAULT 0,
    "completed_count" INTEGER NOT NULL DEFAULT 0,
    "exited_count" INTEGER NOT NULL DEFAULT 0,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "automation_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "step_data" JSONB,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "exited_at" TIMESTAMP(3),
    "exit_reason" TEXT,

    CONSTRAINT "automation_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_forms" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "settings" JSONB,
    "thank_you_message" TEXT,
    "redirect_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "submission_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mkt_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mkt_form_submissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "data" JSONB NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mkt_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_utms" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "contact_id" TEXT,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "utm_campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "landing_page" TEXT,
    "referrer" TEXT,
    "converted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_utms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_calendars" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'campaign',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "channel" "CampaignChannel",
    "campaign_id" TEXT,
    "color" TEXT,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_tags" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_tenant_id_slug_key" ON "campaigns"("tenant_id", "slug");
CREATE INDEX "campaigns_tenant_id_status_idx" ON "campaigns"("tenant_id", "status");
CREATE INDEX "campaigns_tenant_id_channel_idx" ON "campaigns"("tenant_id", "channel");
CREATE INDEX "campaigns_tenant_id_scheduled_at_idx" ON "campaigns"("tenant_id", "scheduled_at");
CREATE INDEX "campaigns_tenant_id_deleted_at_idx" ON "campaigns"("tenant_id", "deleted_at");

CREATE INDEX "campaign_variants_tenant_id_campaign_id_idx" ON "campaign_variants"("tenant_id", "campaign_id");

CREATE INDEX "campaign_events_tenant_id_campaign_id_idx" ON "campaign_events"("tenant_id", "campaign_id");
CREATE INDEX "campaign_events_tenant_id_contact_id_idx" ON "campaign_events"("tenant_id", "contact_id");
CREATE INDEX "campaign_events_tenant_id_event_type_idx" ON "campaign_events"("tenant_id", "event_type");
CREATE INDEX "campaign_events_occurred_at_idx" ON "campaign_events"("occurred_at");

CREATE UNIQUE INDEX "consent_records_tenant_id_contact_id_consent_type_channel_key" ON "consent_records"("tenant_id", "contact_id", "consent_type", "channel");
CREATE INDEX "consent_records_tenant_id_contact_id_idx" ON "consent_records"("tenant_id", "contact_id");
CREATE INDEX "consent_records_tenant_id_revoked_at_idx" ON "consent_records"("tenant_id", "revoked_at");

CREATE UNIQUE INDEX "lead_scores_contact_id_key" ON "lead_scores"("contact_id");
CREATE INDEX "lead_scores_tenant_id_total_score_idx" ON "lead_scores"("tenant_id", "total_score");
CREATE INDEX "lead_scores_tenant_id_is_qualified_idx" ON "lead_scores"("tenant_id", "is_qualified");

CREATE INDEX "lead_score_histories_tenant_id_lead_score_id_idx" ON "lead_score_histories"("tenant_id", "lead_score_id");
CREATE INDEX "lead_score_histories_created_at_idx" ON "lead_score_histories"("created_at");

CREATE UNIQUE INDEX "mkt_email_templates_tenant_id_slug_key" ON "mkt_email_templates"("tenant_id", "slug");
CREATE INDEX "mkt_email_templates_tenant_id_category_idx" ON "mkt_email_templates"("tenant_id", "category");

CREATE INDEX "automations_tenant_id_status_idx" ON "automations"("tenant_id", "status");
CREATE INDEX "automations_tenant_id_trigger_type_idx" ON "automations"("tenant_id", "trigger_type");

CREATE UNIQUE INDEX "automation_enrollments_automation_id_contact_id_key" ON "automation_enrollments"("automation_id", "contact_id");
CREATE INDEX "automation_enrollments_tenant_id_automation_id_idx" ON "automation_enrollments"("tenant_id", "automation_id");
CREATE INDEX "automation_enrollments_tenant_id_contact_id_idx" ON "automation_enrollments"("tenant_id", "contact_id");
CREATE INDEX "automation_enrollments_tenant_id_status_idx" ON "automation_enrollments"("tenant_id", "status");

CREATE UNIQUE INDEX "mkt_forms_tenant_id_slug_key" ON "mkt_forms"("tenant_id", "slug");
CREATE INDEX "mkt_forms_tenant_id_is_active_idx" ON "mkt_forms"("tenant_id", "is_active");

CREATE INDEX "mkt_form_submissions_tenant_id_form_id_idx" ON "mkt_form_submissions"("tenant_id", "form_id");
CREATE INDEX "mkt_form_submissions_tenant_id_contact_id_idx" ON "mkt_form_submissions"("tenant_id", "contact_id");
CREATE INDEX "mkt_form_submissions_submitted_at_idx" ON "mkt_form_submissions"("submitted_at");

CREATE INDEX "campaign_utms_tenant_id_source_medium_idx" ON "campaign_utms"("tenant_id", "source", "medium");
CREATE INDEX "campaign_utms_tenant_id_campaign_id_idx" ON "campaign_utms"("tenant_id", "campaign_id");
CREATE INDEX "campaign_utms_tenant_id_contact_id_idx" ON "campaign_utms"("tenant_id", "contact_id");

CREATE INDEX "marketing_calendars_tenant_id_scheduled_at_idx" ON "marketing_calendars"("tenant_id", "scheduled_at");
CREATE INDEX "marketing_calendars_tenant_id_campaign_id_idx" ON "marketing_calendars"("tenant_id", "campaign_id");
CREATE INDEX "marketing_calendars_tenant_id_type_idx" ON "marketing_calendars"("tenant_id", "type");

CREATE UNIQUE INDEX "campaign_tags_campaign_id_tag_id_key" ON "campaign_tags"("campaign_id", "tag_id");
CREATE INDEX "campaign_tags_tenant_id_campaign_id_idx" ON "campaign_tags"("tenant_id", "campaign_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_variants" ADD CONSTRAINT "campaign_variants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_variants" ADD CONSTRAINT "campaign_variants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaign_events" ADD CONSTRAINT "campaign_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_events" ADD CONSTRAINT "campaign_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_events" ADD CONSTRAINT "campaign_events_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lead_score_histories" ADD CONSTRAINT "lead_score_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_score_histories" ADD CONSTRAINT "lead_score_histories_lead_score_id_fkey" FOREIGN KEY ("lead_score_id") REFERENCES "lead_scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mkt_email_templates" ADD CONSTRAINT "mkt_email_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mkt_email_templates" ADD CONSTRAINT "mkt_email_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automations" ADD CONSTRAINT "automations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automations" ADD CONSTRAINT "automations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation_enrollments" ADD CONSTRAINT "automation_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_enrollments" ADD CONSTRAINT "automation_enrollments_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_enrollments" ADD CONSTRAINT "automation_enrollments_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mkt_forms" ADD CONSTRAINT "mkt_forms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mkt_forms" ADD CONSTRAINT "mkt_forms_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "mkt_form_submissions" ADD CONSTRAINT "mkt_form_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mkt_form_submissions" ADD CONSTRAINT "mkt_form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "mkt_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mkt_form_submissions" ADD CONSTRAINT "mkt_form_submissions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "campaign_utms" ADD CONSTRAINT "campaign_utms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_utms" ADD CONSTRAINT "campaign_utms_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_utms" ADD CONSTRAINT "campaign_utms_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "marketing_calendars" ADD CONSTRAINT "marketing_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketing_calendars" ADD CONSTRAINT "marketing_calendars_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "marketing_calendars" ADD CONSTRAINT "marketing_calendars_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "campaign_tags" ADD CONSTRAINT "campaign_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_tags" ADD CONSTRAINT "campaign_tags_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_tags" ADD CONSTRAINT "campaign_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
