-- CreateEnum
CREATE TYPE "ad_platform" AS ENUM ('META', 'GOOGLE', 'TIKTOK', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "ad_status" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'DELETED', 'ERROR');

-- CreateEnum
CREATE TYPE "campaign_objective" AS ENUM ('AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'APP_PROMOTION', 'SALES', 'CONVERSIONS');

-- CreateEnum
CREATE TYPE "rule_condition_type" AS ENUM ('CPA_ABOVE', 'CPA_BELOW', 'ROAS_ABOVE', 'ROAS_BELOW', 'CTR_ABOVE', 'CTR_BELOW', 'SPEND_ABOVE', 'SPEND_BELOW', 'IMPRESSIONS_ABOVE', 'CLICKS_BELOW', 'CUSTOM');

-- CreateEnum
CREATE TYPE "rule_action_type" AS ENUM ('PAUSE', 'ENABLE', 'INCREASE_BUDGET', 'DECREASE_BUDGET', 'SEND_ALERT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "attribution_model" AS ENUM ('FIRST_TOUCH', 'LAST_TOUCH', 'LINEAR', 'TIME_DECAY', 'DATA_DRIVEN');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "rule_status" AS ENUM ('ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED', 'ERROR');

-- CreateEnum
CREATE TYPE "step_execution_type" AS ENUM ('SEND_NOTIFICATION', 'CREATE_RECORD', 'UPDATE_FIELD', 'CALL_WEBHOOK', 'AI_GENERATION', 'AI_AGENT');

-- CreateEnum
CREATE TYPE "budget_period" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "telemetry_provider" AS ENUM ('GEMINI', 'OPENAI', 'ANTHROPIC', 'CUSTOM');

-- ============================================
-- ADS MANAGEMENT MODULE
-- ============================================

-- CreateTable: ad_accounts
CREATE TABLE "ad_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "platform" "ad_platform" NOT NULL,
    "account_name" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync_at" TIMESTAMP(3),
    "sync_error" TEXT,
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ad_campaigns
CREATE TABLE "ad_campaigns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "objective" "campaign_objective",
    "status" "ad_status" NOT NULL DEFAULT 'DRAFT',
    "daily_budget" DECIMAL(12,2),
    "total_budget" DECIMAL(12,2),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "target_audience" JSONB,
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ad_sets
CREATE TABLE "ad_sets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "status" "ad_status" NOT NULL DEFAULT 'DRAFT',
    "daily_budget" DECIMAL(12,2),
    "bid_amount" DECIMAL(12,4),
    "bid_strategy" TEXT,
    "targeting" JSONB,
    "placements" JSONB,
    "schedule" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ads
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "ad_set_id" TEXT NOT NULL,
    "creative_id" TEXT,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "status" "ad_status" NOT NULL DEFAULT 'DRAFT',
    "headline" TEXT,
    "description" TEXT,
    "call_to_action" TEXT,
    "destination_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable: creatives
CREATE TABLE "creatives" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT,
    "thumbnail_url" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration_ms" INTEGER,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable: creative_variants
CREATE TABLE "creative_variants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "creative_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_url" TEXT,
    "headline" TEXT,
    "description" TEXT,
    "call_to_action" TEXT,
    "metadata" JSONB,
    "is_control" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creative_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: creative_performance
CREATE TABLE "creative_performance" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "creative_id" TEXT NOT NULL,
    "platform" "ad_platform" NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ctr" DECIMAL(8,4),
    "cpa" DECIMAL(12,2),
    "roas" DECIMAL(8,2),
    "score" DECIMAL(5,2),
    "score_details" JSONB,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creative_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ads_metrics
CREATE TABLE "ads_metrics" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "ad_id" TEXT,
    "platform" "ad_platform" NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "cpm" DECIMAL(12,4),
    "cpc" DECIMAL(12,4),
    "ctr" DECIMAL(8,4),
    "cpa" DECIMAL(12,2),
    "roas" DECIMAL(8,2),
    "video_views" INTEGER DEFAULT 0,
    "engagements" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ads_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ad_rules
CREATE TABLE "ad_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "account_id" TEXT,
    "campaign_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "condition_type" "rule_condition_type" NOT NULL,
    "condition_value" DECIMAL(12,4) NOT NULL,
    "action_type" "rule_action_type" NOT NULL,
    "action_value" JSONB,
    "frequency" TEXT NOT NULL DEFAULT 'HOURLY',
    "last_evaluated_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ad_rule_executions
CREATE TABLE "ad_rule_executions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "condition_met" BOOLEAN NOT NULL,
    "condition_data" JSONB,
    "action_taken" BOOLEAN NOT NULL,
    "action_result" JSONB,
    "error" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_rule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: attribution_events
CREATE TABLE "attribution_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "platform" "ad_platform",
    "campaign_id" TEXT,
    "ad_id" TEXT,
    "model" "attribution_model" NOT NULL DEFAULT 'LAST_TOUCH',
    "attribution_weight" DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    "revenue" DECIMAL(12,2),
    "conversion_data" JSONB,
    "source_url" TEXT,
    "ip_hash" TEXT,
    "user_agent" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribution_events_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- AI AUTOMATION MODULE
-- ============================================

-- CreateTable: domain_events
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "metadata" JSONB,
    "status" "event_status" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "processed_at" TIMESTAMP(3),
    "scheduled_for" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: trigger_definitions
CREATE TABLE "trigger_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "event_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "payload_schema" JSONB,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trigger_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: action_definitions
CREATE TABLE "action_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "action_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "execution_type" "step_execution_type" NOT NULL,
    "config_schema" JSONB,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: automation_rules
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "trigger_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "rule_status" NOT NULL DEFAULT 'DRAFT',
    "conditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_executions" INTEGER,
    "execution_count" INTEGER NOT NULL DEFAULT 0,
    "cooldown_ms" INTEGER,
    "last_fired_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: automation_rule_steps
CREATE TABLE "automation_rule_steps" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "config" JSONB,
    "retry_on_fail" BOOLEAN NOT NULL DEFAULT false,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "timeout_ms" INTEGER NOT NULL DEFAULT 30000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rule_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable: automation_runs
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "event_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "trigger_data" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "is_dry_run" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: automation_step_runs
CREATE TABLE "automation_step_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input_data" JSONB,
    "output_data" JSONB,
    "error" TEXT,
    "retry_attempt" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,

    CONSTRAINT "automation_step_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: agent_telemetry
CREATE TABLE "agent_telemetry" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" "telemetry_provider" NOT NULL,
    "model" TEXT NOT NULL,
    "agent_id" TEXT,
    "module" TEXT,
    "trace_id" TEXT,
    "parent_span_id" TEXT,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "estimated_cost_usd" DECIMAL(10,6) NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "first_token_ms" INTEGER,
    "prompt_hash" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable: agent_actions
CREATE TABLE "agent_actions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "input_summary" TEXT,
    "output_summary" TEXT,
    "telemetry_id" TEXT,
    "user_id" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "duration_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: cost_budgets
CREATE TABLE "cost_budgets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module" TEXT,
    "period" "budget_period" NOT NULL DEFAULT 'MONTHLY',
    "budget_usd" DECIMAL(10,2) NOT NULL,
    "spent_usd" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "alert_threshold" DECIMAL(3,2) NOT NULL DEFAULT 0.8,
    "alert_sent_at" TIMESTAMP(3),
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_budgets_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

-- CreateIndex
CREATE UNIQUE INDEX "ad_accounts_tenant_id_platform_external_id_key" ON "ad_accounts"("tenant_id", "platform", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribution_events_event_id_key" ON "attribution_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "domain_events_event_id_key" ON "domain_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "trigger_definitions_event_type_key" ON "trigger_definitions"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "action_definitions_action_key_key" ON "action_definitions"("action_key");

-- CreateIndex
CREATE UNIQUE INDEX "cost_budgets_tenant_id_module_period_start_key" ON "cost_budgets"("tenant_id", "module", "period_start");

-- ============================================
-- INDEXES — ADS MANAGEMENT
-- ============================================

CREATE INDEX "ad_accounts_tenant_id_platform_idx" ON "ad_accounts"("tenant_id", "platform");
CREATE INDEX "ad_accounts_tenant_id_is_active_idx" ON "ad_accounts"("tenant_id", "is_active");

CREATE INDEX "ad_campaigns_tenant_id_account_id_idx" ON "ad_campaigns"("tenant_id", "account_id");
CREATE INDEX "ad_campaigns_tenant_id_status_idx" ON "ad_campaigns"("tenant_id", "status");
CREATE INDEX "ad_campaigns_tenant_id_objective_idx" ON "ad_campaigns"("tenant_id", "objective");

CREATE INDEX "ad_sets_tenant_id_campaign_id_idx" ON "ad_sets"("tenant_id", "campaign_id");
CREATE INDEX "ad_sets_tenant_id_status_idx" ON "ad_sets"("tenant_id", "status");

CREATE INDEX "ads_tenant_id_ad_set_id_idx" ON "ads"("tenant_id", "ad_set_id");
CREATE INDEX "ads_tenant_id_status_idx" ON "ads"("tenant_id", "status");

CREATE INDEX "creatives_tenant_id_type_idx" ON "creatives"("tenant_id", "type");
CREATE INDEX "creatives_tenant_id_created_by_id_idx" ON "creatives"("tenant_id", "created_by_id");

CREATE INDEX "creative_variants_tenant_id_creative_id_idx" ON "creative_variants"("tenant_id", "creative_id");

CREATE INDEX "creative_performance_tenant_id_creative_id_period_start_idx" ON "creative_performance"("tenant_id", "creative_id", "period_start");
CREATE INDEX "creative_performance_tenant_id_platform_idx" ON "creative_performance"("tenant_id", "platform");

CREATE INDEX "ads_metrics_tenant_id_date_idx" ON "ads_metrics"("tenant_id", "date");
CREATE INDEX "ads_metrics_tenant_id_account_id_date_idx" ON "ads_metrics"("tenant_id", "account_id", "date");
CREATE INDEX "ads_metrics_tenant_id_campaign_id_date_idx" ON "ads_metrics"("tenant_id", "campaign_id", "date");
CREATE INDEX "ads_metrics_tenant_id_platform_date_idx" ON "ads_metrics"("tenant_id", "platform", "date");

CREATE INDEX "ad_rules_tenant_id_is_active_idx" ON "ad_rules"("tenant_id", "is_active");
CREATE INDEX "ad_rules_tenant_id_account_id_idx" ON "ad_rules"("tenant_id", "account_id");

CREATE INDEX "ad_rule_executions_tenant_id_rule_id_idx" ON "ad_rule_executions"("tenant_id", "rule_id");
CREATE INDEX "ad_rule_executions_tenant_id_executed_at_idx" ON "ad_rule_executions"("tenant_id", "executed_at");

CREATE INDEX "attribution_events_tenant_id_event_type_idx" ON "attribution_events"("tenant_id", "event_type");
CREATE INDEX "attribution_events_tenant_id_platform_idx" ON "attribution_events"("tenant_id", "platform");
CREATE INDEX "attribution_events_tenant_id_campaign_id_idx" ON "attribution_events"("tenant_id", "campaign_id");
CREATE INDEX "attribution_events_tenant_id_occurred_at_idx" ON "attribution_events"("tenant_id", "occurred_at");

-- ============================================
-- INDEXES — AI AUTOMATION
-- ============================================

CREATE INDEX "domain_events_tenant_id_event_type_idx" ON "domain_events"("tenant_id", "event_type");
CREATE INDEX "domain_events_status_scheduled_for_idx" ON "domain_events"("status", "scheduled_for");
CREATE INDEX "domain_events_tenant_id_created_at_idx" ON "domain_events"("tenant_id", "created_at");

CREATE INDEX "trigger_definitions_module_idx" ON "trigger_definitions"("module");

CREATE INDEX "action_definitions_execution_type_idx" ON "action_definitions"("execution_type");

CREATE INDEX "automation_rules_tenant_id_status_idx" ON "automation_rules"("tenant_id", "status");
CREATE INDEX "automation_rules_tenant_id_trigger_id_idx" ON "automation_rules"("tenant_id", "trigger_id");
CREATE INDEX "automation_rules_tenant_id_is_enabled_idx" ON "automation_rules"("tenant_id", "is_enabled");

CREATE INDEX "automation_rule_steps_tenant_id_rule_id_idx" ON "automation_rule_steps"("tenant_id", "rule_id");

CREATE INDEX "automation_runs_tenant_id_rule_id_idx" ON "automation_runs"("tenant_id", "rule_id");
CREATE INDEX "automation_runs_tenant_id_status_idx" ON "automation_runs"("tenant_id", "status");
CREATE INDEX "automation_runs_tenant_id_started_at_idx" ON "automation_runs"("tenant_id", "started_at");

CREATE INDEX "automation_step_runs_tenant_id_run_id_idx" ON "automation_step_runs"("tenant_id", "run_id");
CREATE INDEX "automation_step_runs_tenant_id_step_id_idx" ON "automation_step_runs"("tenant_id", "step_id");

CREATE INDEX "agent_telemetry_tenant_id_provider_idx" ON "agent_telemetry"("tenant_id", "provider");
CREATE INDEX "agent_telemetry_tenant_id_module_idx" ON "agent_telemetry"("tenant_id", "module");
CREATE INDEX "agent_telemetry_tenant_id_agent_id_idx" ON "agent_telemetry"("tenant_id", "agent_id");
CREATE INDEX "agent_telemetry_tenant_id_created_at_idx" ON "agent_telemetry"("tenant_id", "created_at");
CREATE INDEX "agent_telemetry_trace_id_idx" ON "agent_telemetry"("trace_id");

CREATE INDEX "agent_actions_tenant_id_agent_id_idx" ON "agent_actions"("tenant_id", "agent_id");
CREATE INDEX "agent_actions_tenant_id_module_idx" ON "agent_actions"("tenant_id", "module");
CREATE INDEX "agent_actions_tenant_id_action_type_idx" ON "agent_actions"("tenant_id", "action_type");
CREATE INDEX "agent_actions_tenant_id_created_at_idx" ON "agent_actions"("tenant_id", "created_at");

CREATE INDEX "cost_budgets_tenant_id_is_active_idx" ON "cost_budgets"("tenant_id", "is_active");
CREATE INDEX "cost_budgets_tenant_id_period_start_period_end_idx" ON "cost_budgets"("tenant_id", "period_start", "period_end");

-- ============================================
-- FOREIGN KEYS — ADS MANAGEMENT
-- ============================================

ALTER TABLE "ad_accounts" ADD CONSTRAINT "ad_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_accounts" ADD CONSTRAINT "ad_accounts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_sets" ADD CONSTRAINT "ad_sets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ads" ADD CONSTRAINT "ads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_set_id_fkey" FOREIGN KEY ("ad_set_id") REFERENCES "ad_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ads" ADD CONSTRAINT "ads_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "creatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "creatives" ADD CONSTRAINT "creatives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creatives" ADD CONSTRAINT "creatives_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "creative_variants" ADD CONSTRAINT "creative_variants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creative_variants" ADD CONSTRAINT "creative_variants_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "creatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "creative_performance" ADD CONSTRAINT "creative_performance_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "creative_performance" ADD CONSTRAINT "creative_performance_creative_id_fkey" FOREIGN KEY ("creative_id") REFERENCES "creatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ads_metrics" ADD CONSTRAINT "ads_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ads_metrics" ADD CONSTRAINT "ads_metrics_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ads_metrics" ADD CONSTRAINT "ads_metrics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ads_metrics" ADD CONSTRAINT "ads_metrics_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ad_rules" ADD CONSTRAINT "ad_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_rules" ADD CONSTRAINT "ad_rules_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_rules" ADD CONSTRAINT "ad_rules_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "ad_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ad_rules" ADD CONSTRAINT "ad_rules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ad_rule_executions" ADD CONSTRAINT "ad_rule_executions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ad_rule_executions" ADD CONSTRAINT "ad_rule_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "ad_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attribution_events" ADD CONSTRAINT "attribution_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- FOREIGN KEYS — AI AUTOMATION
-- ============================================

ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trigger_definitions" ADD CONSTRAINT "trigger_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "action_definitions" ADD CONSTRAINT "action_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_trigger_id_fkey" FOREIGN KEY ("trigger_id") REFERENCES "trigger_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation_rule_steps" ADD CONSTRAINT "automation_rule_steps_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_rule_steps" ADD CONSTRAINT "automation_rule_steps_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_rule_steps" ADD CONSTRAINT "automation_rule_steps_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "automation_step_runs" ADD CONSTRAINT "automation_step_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_step_runs" ADD CONSTRAINT "automation_step_runs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "automation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_step_runs" ADD CONSTRAINT "automation_step_runs_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "automation_rule_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_telemetry" ADD CONSTRAINT "agent_telemetry_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "agent_actions" ADD CONSTRAINT "agent_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "cost_budgets" ADD CONSTRAINT "cost_budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cost_budgets" ADD CONSTRAINT "cost_budgets_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
