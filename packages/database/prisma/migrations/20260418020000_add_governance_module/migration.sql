-- Add Governance/OKR module schema (16 tables, 20 enums).
--
-- The Governance module (OKRs, meetings, decisions, boards, strategic
-- pillars, mission statements) was added to schema.extended.prisma but
-- never migrated. `pnpm db:seed` failed at governance-seed.ts because
-- public.okr_cycles did not exist (discovered 2026-04-18).
--
-- This migration was generated via `prisma migrate diff --to-schema-datamodel`
-- and trimmed to include only Governance-related tables/enums (full diff
-- revealed 87 missing tables across 8+ modules — to be tackled per-module).
--
-- Tables: okr_cycles, objectives, key_results, okr_check_ins, initiatives,
--         meetings, meeting_attendees, meeting_agenda_items, decisions,
--         action_items, meeting_minutes, boards, board_members,
--         strategic_pillars, mission_statements, meeting_free_blocks
--
-- Excluded (deferred to async-standups module): team_meetings, team_meeting_participants
-- (FK to non-existent team_channels).

-- CreateEnum
CREATE TYPE "okr_cycle_type" AS ENUM ('ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "okr_cycle_status" AS ENUM ('PLANNING', 'ACTIVE', 'REVIEW', 'CLOSED');

-- CreateEnum
CREATE TYPE "objective_level" AS ENUM ('COMPANY', 'DEPARTMENT', 'TEAM', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "okr_status" AS ENUM ('DRAFT', 'ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "okr_privacy" AS ENUM ('PUBLIC', 'TEAM', 'PRIVATE');

-- CreateEnum
CREATE TYPE "kr_type" AS ENUM ('NUMERIC', 'PERCENT', 'BINARY', 'CURRENCY');

-- CreateEnum
CREATE TYPE "kr_data_source" AS ENUM ('MANUAL', 'FINANCE', 'SALES', 'PROJECTS', 'PEOPLE');

-- CreateEnum
CREATE TYPE "check_in_confidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "initiative_status" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "meeting_type" AS ENUM ('ONE_ON_ONE', 'TEAM', 'ALL_HANDS', 'BOARD', 'COMMITTEE', 'STANDUP');

-- CreateEnum
CREATE TYPE "meeting_location" AS ENUM ('IN_PERSON', 'VIRTUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "meeting_status" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "agenda_item_type" AS ENUM ('INFO', 'DISCUSSION', 'VOTE', 'REPORT', 'ACTION');

-- CreateEnum
CREATE TYPE "action_item_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "gov_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "decision_type" AS ENUM ('OPERATIONAL', 'STRATEGIC', 'FINANCIAL', 'POLICY', 'TECHNICAL');

-- CreateEnum
CREATE TYPE "decision_outcome" AS ENUM ('APPROVED', 'REJECTED', 'DEFERRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "board_type" AS ENUM ('BOARD', 'COMMITTEE', 'ADVISORY', 'INVESTOR');

-- CreateEnum
CREATE TYPE "board_role" AS ENUM ('CHAIR', 'VICE_CHAIR', 'SECRETARY', 'TREASURER', 'MEMBER', 'OBSERVER');

-- CreateEnum
CREATE TYPE "strategic_horizon" AS ENUM ('SHORT_TERM', 'MID_TERM', 'LONG_TERM');

-- CreateTable
CREATE TABLE "okr_cycles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "okr_cycle_type" NOT NULL DEFAULT 'QUARTERLY',
    "status" "okr_cycle_status" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okr_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level" "objective_level" NOT NULL DEFAULT 'COMPANY',
    "status" "okr_status" NOT NULL DEFAULT 'DRAFT',
    "privacy" "okr_privacy" NOT NULL DEFAULT 'PUBLIC',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "owner_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_results" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "objective_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "kr_type" NOT NULL DEFAULT 'PERCENT',
    "dataSource" "kr_data_source" NOT NULL DEFAULT 'MANUAL',
    "start_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target_value" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "unit" TEXT,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "okr_status" NOT NULL DEFAULT 'DRAFT',
    "owner_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okr_check_ins" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key_result_id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "previous_value" DOUBLE PRECISION NOT NULL,
    "confidence" "check_in_confidence" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "blockers" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okr_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initiatives" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "key_result_id" TEXT NOT NULL,
    "objective_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "initiative_status" NOT NULL DEFAULT 'TODO',
    "priority" "gov_priority" NOT NULL DEFAULT 'MEDIUM',
    "owner_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "meeting_type" NOT NULL DEFAULT 'TEAM',
    "status" "meeting_status" NOT NULL DEFAULT 'SCHEDULED',
    "location" "meeting_location" NOT NULL DEFAULT 'VIRTUAL',
    "location_url" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration_min" INTEGER,
    "board_id" TEXT,
    "organizer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_agenda_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "agenda_item_type" NOT NULL DEFAULT 'DISCUSSION',
    "position" INTEGER NOT NULL DEFAULT 0,
    "duration_min" INTEGER,
    "presenter_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT,
    "title" TEXT NOT NULL,
    "context" TEXT,
    "description" TEXT NOT NULL,
    "type" "decision_type" NOT NULL DEFAULT 'OPERATIONAL',
    "outcome" "decision_outcome",
    "votes_for" INTEGER,
    "votes_against" INTEGER,
    "abstentions" INTEGER,
    "impact" TEXT,
    "participants" TEXT[],
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "action_item_status" NOT NULL DEFAULT 'OPEN',
    "priority" "gov_priority" NOT NULL DEFAULT 'MEDIUM',
    "assignee_id" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_minutes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_minutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "board_type" NOT NULL DEFAULT 'BOARD',
    "quorum_min" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "board_role" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_pillars" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "horizon" "strategic_horizon" NOT NULL DEFAULT 'MID_TERM',
    "color" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_pillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_statements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "values" TEXT[],
    "purpose" TEXT,
    "updated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_free_blocks" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_free_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "okr_cycles_tenant_id_status_idx" ON "okr_cycles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "okr_cycles_tenant_id_start_date_idx" ON "okr_cycles"("tenant_id", "start_date");

-- CreateIndex
CREATE INDEX "objectives_tenant_id_cycle_id_idx" ON "objectives"("tenant_id", "cycle_id");

-- CreateIndex
CREATE INDEX "objectives_tenant_id_owner_id_idx" ON "objectives"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "objectives_tenant_id_parent_id_idx" ON "objectives"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "key_results_tenant_id_objective_id_idx" ON "key_results"("tenant_id", "objective_id");

-- CreateIndex
CREATE INDEX "key_results_tenant_id_owner_id_idx" ON "key_results"("tenant_id", "owner_id");

-- CreateIndex
CREATE INDEX "okr_check_ins_tenant_id_key_result_id_idx" ON "okr_check_ins"("tenant_id", "key_result_id");

-- CreateIndex
CREATE INDEX "okr_check_ins_tenant_id_created_at_idx" ON "okr_check_ins"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "initiatives_tenant_id_key_result_id_idx" ON "initiatives"("tenant_id", "key_result_id");

-- CreateIndex
CREATE INDEX "initiatives_tenant_id_objective_id_idx" ON "initiatives"("tenant_id", "objective_id");

-- CreateIndex
CREATE INDEX "initiatives_tenant_id_status_idx" ON "initiatives"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "meetings_tenant_id_scheduled_at_idx" ON "meetings"("tenant_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "meetings_tenant_id_type_idx" ON "meetings"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "meetings_tenant_id_board_id_idx" ON "meetings"("tenant_id", "board_id");

-- CreateIndex
CREATE INDEX "meeting_attendees_tenant_id_meeting_id_idx" ON "meeting_attendees"("tenant_id", "meeting_id");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meeting_id_user_id_key" ON "meeting_attendees"("meeting_id", "user_id");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_tenant_id_meeting_id_idx" ON "meeting_agenda_items"("tenant_id", "meeting_id");

-- CreateIndex
CREATE INDEX "decisions_tenant_id_meeting_id_idx" ON "decisions"("tenant_id", "meeting_id");

-- CreateIndex
CREATE INDEX "decisions_tenant_id_type_idx" ON "decisions"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "decisions_tenant_id_decided_at_idx" ON "decisions"("tenant_id", "decided_at");

-- CreateIndex
CREATE INDEX "action_items_tenant_id_assignee_id_idx" ON "action_items"("tenant_id", "assignee_id");

-- CreateIndex
CREATE INDEX "action_items_tenant_id_status_idx" ON "action_items"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "action_items_tenant_id_due_date_idx" ON "action_items"("tenant_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_minutes_meeting_id_key" ON "meeting_minutes"("meeting_id");

-- CreateIndex
CREATE INDEX "meeting_minutes_tenant_id_idx" ON "meeting_minutes"("tenant_id");

-- CreateIndex
CREATE INDEX "boards_tenant_id_type_idx" ON "boards"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "board_members_tenant_id_board_id_idx" ON "board_members"("tenant_id", "board_id");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_board_id_user_id_key" ON "board_members"("board_id", "user_id");

-- CreateIndex
CREATE INDEX "strategic_pillars_tenant_id_horizon_idx" ON "strategic_pillars"("tenant_id", "horizon");

-- CreateIndex
CREATE UNIQUE INDEX "mission_statements_tenant_id_key" ON "mission_statements"("tenant_id");

-- CreateIndex
CREATE INDEX "meeting_free_blocks_tenant_id_employee_id_idx" ON "meeting_free_blocks"("tenant_id", "employee_id");

-- AddForeignKey
ALTER TABLE "okr_cycles" ADD CONSTRAINT "okr_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okr_cycles" ADD CONSTRAINT "okr_cycles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "okr_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_results" ADD CONSTRAINT "key_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_results" ADD CONSTRAINT "key_results_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "key_results" ADD CONSTRAINT "key_results_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okr_check_ins" ADD CONSTRAINT "okr_check_ins_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okr_check_ins" ADD CONSTRAINT "okr_check_ins_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "key_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okr_check_ins" ADD CONSTRAINT "okr_check_ins_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "key_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agenda_items" ADD CONSTRAINT "meeting_agenda_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agenda_items" ADD CONSTRAINT "meeting_agenda_items_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_agenda_items" ADD CONSTRAINT "meeting_agenda_items_presenter_id_fkey" FOREIGN KEY ("presenter_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_pillars" ADD CONSTRAINT "strategic_pillars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategic_pillars" ADD CONSTRAINT "strategic_pillars_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_statements" ADD CONSTRAINT "mission_statements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_statements" ADD CONSTRAINT "mission_statements_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_free_blocks" ADD CONSTRAINT "meeting_free_blocks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_free_blocks" ADD CONSTRAINT "meeting_free_blocks_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

