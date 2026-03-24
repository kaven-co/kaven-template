-- CreateEnum
CREATE TYPE "project_type" AS ENUM ('FIXED_SCOPE', 'TIME_AND_MATERIAL', 'RETAINER', 'MILESTONE_BASED');

-- CreateEnum (replace old ProjectStatus)
-- Drop old enum values and recreate with full set
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
CREATE TYPE "project_status" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "budget_type" AS ENUM ('FIXED', 'HOURLY', 'MONTHLY_RETAINER', 'MILESTONE');

-- CreateEnum
CREATE TYPE "project_member_role" AS ENUM ('OWNER', 'MANAGER', 'MEMBER', 'VIEWER', 'EXTERNAL');

-- CreateEnum (replace old TaskStatus)
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
CREATE TYPE "task_status" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum (replace old TaskPriority)
ALTER TYPE "TaskPriority" RENAME TO "TaskPriority_old";
CREATE TYPE "task_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "milestone_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- Migrate existing projects table
-- First, add new columns
ALTER TABLE "projects" ADD COLUMN "code" TEXT;
ALTER TABLE "projects" ADD COLUMN "type" "project_type" NOT NULL DEFAULT 'FIXED_SCOPE';
ALTER TABLE "projects" ADD COLUMN "budget_type" "budget_type";
ALTER TABLE "projects" ADD COLUMN "budget_amount" DOUBLE PRECISION;
ALTER TABLE "projects" ADD COLUMN "hourly_rate" DOUBLE PRECISION;
ALTER TABLE "projects" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'BRL';
ALTER TABLE "projects" ADD COLUMN "hours_estimated" DOUBLE PRECISION;
ALTER TABLE "projects" ADD COLUMN "hours_logged" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "cost_incurred" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "projects" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "end_date" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "completed_at" TIMESTAMP(3);
ALTER TABLE "projects" ADD COLUMN "contact_id" TEXT;
ALTER TABLE "projects" ADD COLUMN "manager_id" TEXT;
ALTER TABLE "projects" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Convert Project status from old enum to new
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "project_status" USING (
  CASE "status"::text
    WHEN 'ACTIVE' THEN 'ACTIVE'::"project_status"
    WHEN 'ARCHIVED' THEN 'ARCHIVED'::"project_status"
    WHEN 'COMPLETED' THEN 'COMPLETED'::"project_status"
    ELSE 'PLANNING'::"project_status"
  END
);
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'PLANNING';

-- Convert id from uuid to cuid (just change default for new rows)
ALTER TABLE "projects" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Migrate existing tasks table
ALTER TABLE "tasks" ADD COLUMN "milestone_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "parent_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "position" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "tasks" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "completed_at" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "estimated_hours" DOUBLE PRECISION;
ALTER TABLE "tasks" ADD COLUMN "blocked_by_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "blocks_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tasks" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Convert Task status from old enum to new
ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "task_status" USING (
  CASE "status"::text
    WHEN 'TODO' THEN 'TODO'::"task_status"
    WHEN 'IN_PROGRESS' THEN 'IN_PROGRESS'::"task_status"
    WHEN 'IN_REVIEW' THEN 'IN_REVIEW'::"task_status"
    WHEN 'DONE' THEN 'DONE'::"task_status"
    ELSE 'TODO'::"task_status"
  END
);
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- Convert Task priority from old enum to new
ALTER TABLE "tasks" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "priority" TYPE "task_priority" USING (
  CASE "priority"::text
    WHEN 'LOW' THEN 'LOW'::"task_priority"
    WHEN 'MEDIUM' THEN 'MEDIUM'::"task_priority"
    WHEN 'HIGH' THEN 'HIGH'::"task_priority"
    WHEN 'URGENT' THEN 'URGENT'::"task_priority"
    ELSE 'MEDIUM'::"task_priority"
  END
);
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- Drop old enums
DROP TYPE "ProjectStatus_old";
DROP TYPE "TaskStatus_old";
DROP TYPE "TaskPriority_old";

-- CreateTable: project_status_history
CREATE TABLE "project_status_history" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "from_status" "project_status" NOT NULL,
    "to_status" "project_status" NOT NULL,
    "changed_by_id" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable: project_members
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "project_member_role" NOT NULL DEFAULT 'MEMBER',
    "hourly_rate" DOUBLE PRECISION,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable: task_comments
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: task_attachments
CREATE TABLE "task_attachments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: milestones
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "milestone_status" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "trigger_invoice" BOOLEAN NOT NULL DEFAULT false,
    "invoice_amount" DOUBLE PRECISION,
    "invoice_percentage" DOUBLE PRECISION,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "completed_tasks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable: time_entries
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT,
    "user_id" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "is_running" BOOLEAN NOT NULL DEFAULT false,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "hourly_rate" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable: project_expenses
CREATE TABLE "project_expenses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "date" TIMESTAMP(3) NOT NULL,
    "receipt" TEXT,
    "is_billable" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: project_documents
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "category" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_status_history_tenant_id_project_id_idx" ON "project_status_history"("tenant_id", "project_id");
CREATE INDEX "project_status_history_project_id_created_at_idx" ON "project_status_history"("project_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_project_id_user_id_key" ON "project_members"("project_id", "user_id");
CREATE INDEX "project_members_tenant_id_user_id_idx" ON "project_members"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "task_comments_tenant_id_task_id_idx" ON "task_comments"("tenant_id", "task_id");

-- CreateIndex
CREATE INDEX "task_attachments_tenant_id_task_id_idx" ON "task_attachments"("tenant_id", "task_id");

-- CreateIndex
CREATE INDEX "milestones_tenant_id_project_id_idx" ON "milestones"("tenant_id", "project_id");
CREATE INDEX "milestones_project_id_status_idx" ON "milestones"("project_id", "status");

-- CreateIndex
CREATE INDEX "time_entries_tenant_id_project_id_idx" ON "time_entries"("tenant_id", "project_id");
CREATE INDEX "time_entries_tenant_id_user_id_idx" ON "time_entries"("tenant_id", "user_id");
CREATE INDEX "time_entries_tenant_id_is_running_idx" ON "time_entries"("tenant_id", "is_running");

-- CreateIndex
CREATE INDEX "project_expenses_tenant_id_project_id_idx" ON "project_expenses"("tenant_id", "project_id");

-- CreateIndex
CREATE INDEX "project_documents_tenant_id_project_id_idx" ON "project_documents"("tenant_id", "project_id");

-- Projects table new indexes
CREATE INDEX "projects_tenant_id_status_idx" ON "projects"("tenant_id", "status");
CREATE INDEX "projects_tenant_id_contact_id_idx" ON "projects"("tenant_id", "contact_id");
CREATE INDEX "projects_tenant_id_manager_id_idx" ON "projects"("tenant_id", "manager_id");

-- Tasks table new indexes
CREATE INDEX "tasks_tenant_id_project_id_status_idx" ON "tasks"("tenant_id", "project_id", "status");
CREATE INDEX "tasks_tenant_id_assignee_id_idx" ON "tasks"("tenant_id", "assignee_id");
CREATE INDEX "tasks_project_id_status_idx" ON "tasks"("project_id", "status");
CREATE INDEX "tasks_project_id_position_idx" ON "tasks"("project_id", "position");
CREATE INDEX "tasks_milestone_id_idx" ON "tasks"("milestone_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_status_history" ADD CONSTRAINT "project_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_members" ADD CONSTRAINT "project_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "milestones" ADD CONSTRAINT "milestones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostgreSQL trigger for project status history tracking
CREATE OR REPLACE FUNCTION fn_track_project_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_status_history (id, tenant_id, project_id, from_status, to_status, created_at)
    VALUES (
      gen_random_uuid()::text,
      NEW.tenant_id,
      NEW.id,
      OLD.status,
      NEW.status,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_project_status_change
AFTER UPDATE OF status ON projects
FOR EACH ROW
EXECUTE FUNCTION fn_track_project_status();
