-- Fix marketing module enum type naming drift.
--
-- Migration 20260324100000_add_marketing_module created enum types with
-- PascalCase quoted names (e.g. "CampaignChannel"), but the Prisma schema
-- maps them to snake_case via @@map() (e.g. @@map("campaign_channel")).
-- This causes Prisma Client to generate queries referencing a type that
-- doesn't exist, failing at runtime (discovered during `pnpm db:seed`
-- on 2026-04-18).
--
-- This migration renames the 9 affected enum types to match their
-- @@map() directives. PostgreSQL preserves all enum values and any
-- columns using them — the rename is a metadata-only operation.

ALTER TYPE "CampaignStatus" RENAME TO campaign_status;
ALTER TYPE "CampaignChannel" RENAME TO campaign_channel;
ALTER TYPE "CampaignEventType" RENAME TO campaign_event_type;
ALTER TYPE "ConsentType" RENAME TO consent_type;
ALTER TYPE "ConsentSource" RENAME TO consent_source;
ALTER TYPE "LeadScoreEventType" RENAME TO lead_score_event_type;
ALTER TYPE "AutomationTriggerType" RENAME TO automation_trigger_type;
ALTER TYPE "AutomationActionType" RENAME TO automation_action_type;
ALTER TYPE "AutomationStatus" RENAME TO automation_status;
