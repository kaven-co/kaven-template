-- CreateEnum
CREATE TYPE "employment_type" AS ENUM ('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'AUTONOMO', 'SOCIO');

-- CreateEnum
CREATE TYPE "employee_status" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'PROBATION');

-- CreateEnum
CREATE TYPE "hiring_job_status" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED_HIRED', 'CLOSED_CANCELLED');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'ASSESSMENT', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "interview_stage_type" AS ENUM ('PHONE_SCREEN', 'TECHNICAL', 'CULTURAL_FIT', 'MANAGER', 'DIRECTOR', 'PANEL', 'REFERENCE_CHECK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "interview_stage_status" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "performance_review_status" AS ENUM ('DRAFT', 'SELF_REVIEW_PENDING', 'MANAGER_REVIEW_PENDING', 'CALIBRATION', 'PUBLISHED', 'ACKNOWLEDGED');

-- CreateEnum
CREATE TYPE "performance_score" AS ENUM ('BELOW_EXPECTATIONS', 'NEEDS_IMPROVEMENT', 'MEETS_EXPECTATIONS', 'EXCEEDS_EXPECTATIONS', 'OUTSTANDING');

-- CreateEnum
CREATE TYPE "hr_time_entry_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ADJUSTED');

-- CreateEnum
CREATE TYPE "lgpd_consent_status" AS ENUM ('PENDING', 'GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "lgpd_data_purpose" AS ENUM ('PAYROLL', 'ESOCIAL', 'PERFORMANCE', 'BENEFITS', 'HEALTH', 'RECRUITMENT', 'TRAINING');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "gender" TEXT,
    "personal_email" TEXT,
    "phone" TEXT,
    "emergency_contact" JSONB,
    "address" JSONB,
    "employment_type" "employment_type" NOT NULL,
    "status" "employee_status" NOT NULL DEFAULT 'PROBATION',
    "hire_date" TIMESTAMP(3) NOT NULL,
    "termination_date" TIMESTAMP(3),
    "probation_end_date" TIMESTAMP(3),
    "job_title" TEXT NOT NULL,
    "job_level" TEXT,
    "department_id" TEXT NOT NULL,
    "manager_id" TEXT,
    "salary" DECIMAL(12,2) NOT NULL,
    "salary_basis" TEXT NOT NULL DEFAULT 'MONTHLY',
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "benefits_package" JSONB,
    "custom_fields" JSONB,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "parent_id" TEXT,
    "head_id" TEXT,
    "budget" DECIMAL(12,2),
    "headcount" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hiring_jobs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department_id" TEXT NOT NULL,
    "hiring_manager_id" TEXT NOT NULL,
    "status" "hiring_job_status" NOT NULL DEFAULT 'DRAFT',
    "location" TEXT,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "employment_type" "employment_type" NOT NULL,
    "seniority" TEXT,
    "salary_min" DECIMAL(12,2),
    "salary_max" DECIMAL(12,2),
    "target_hire_date" TIMESTAMP(3),
    "headcount_target" INTEGER NOT NULL DEFAULT 1,
    "headcount_filled" INTEGER NOT NULL DEFAULT 0,
    "interview_stage_template" JSONB,
    "custom_fields" JSONB,
    "metadata" JSONB,
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "hiring_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "linkedin_url" TEXT,
    "portfolio_url" TEXT,
    "resume_url" TEXT,
    "source" TEXT,
    "lgpd_consent_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "status" "application_status" NOT NULL DEFAULT 'APPLIED',
    "recruiter_note" TEXT,
    "offer_salary" DECIMAL(12,2),
    "offer_start_date" TIMESTAMP(3),
    "offer_expires_at" TIMESTAMP(3),
    "offer_details" JSONB,
    "rejection_reason" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hired_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_stages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "type" "interview_stage_type" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "interview_stage_status" NOT NULL DEFAULT 'SCHEDULED',
    "interviewer_ids" TEXT[],
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "feedback" TEXT,
    "score" INTEGER,
    "recommendation" TEXT,
    "meeting_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "interview_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expected_end_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "tasks" JSONB NOT NULL,
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "onboarding_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_cycles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ANNUAL',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "self_review_due" TIMESTAMP(3) NOT NULL,
    "manager_review_due" TIMESTAMP(3) NOT NULL,
    "calibration_date" TIMESTAMP(3),
    "publish_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "review_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "cycle_id" TEXT,
    "status" "performance_review_status" NOT NULL DEFAULT 'DRAFT',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "review_type" TEXT NOT NULL DEFAULT 'ANNUAL',
    "self_score" "performance_score",
    "self_comments" TEXT,
    "self_goals" JSONB,
    "manager_score" "performance_score",
    "manager_comments" TEXT,
    "manager_goals" JSONB,
    "final_score" "performance_score",
    "final_comments" TEXT,
    "nine_box_performance" INTEGER,
    "nine_box_potential" INTEGER,
    "self_review_due_at" TIMESTAMP(3),
    "manager_review_due_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_on_ones" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "manager_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "meeting_url" TEXT,
    "agenda" TEXT,
    "employee_notes" TEXT,
    "manager_notes" TEXT,
    "shared_notes" TEXT,
    "action_items" JSONB,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_on_ones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_time_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "hr_time_entry_status" NOT NULL DEFAULT 'PENDING',
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "break_minutes" INTEGER DEFAULT 0,
    "total_minutes" INTEGER,
    "expected_minutes" INTEGER,
    "overtime_minutes" INTEGER,
    "entry_type" TEXT NOT NULL DEFAULT 'REGULAR',
    "notes" TEXT,
    "external_id" TEXT,
    "external_source" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejection_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_consents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "purpose" "lgpd_data_purpose" NOT NULL,
    "status" "lgpd_consent_status" NOT NULL DEFAULT 'PENDING',
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "consent_text" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "channel" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lgpd_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lgpd_retention_policies" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "purpose" "lgpd_data_purpose" NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "retention_event" TEXT NOT NULL,
    "legal_basis" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lgpd_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL DEFAULT 'USER',
    "changes" JSONB,
    "sensitive_fields" TEXT[],
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "people_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");
CREATE INDEX "employees_tenant_id_idx" ON "employees"("tenant_id");
CREATE INDEX "employees_tenant_id_status_idx" ON "employees"("tenant_id", "status");
CREATE INDEX "employees_tenant_id_department_id_idx" ON "employees"("tenant_id", "department_id");
CREATE INDEX "employees_tenant_id_manager_id_idx" ON "employees"("tenant_id", "manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_code_key" ON "departments"("tenant_id", "code");
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE INDEX "hiring_jobs_tenant_id_idx" ON "hiring_jobs"("tenant_id");
CREATE INDEX "hiring_jobs_tenant_id_status_idx" ON "hiring_jobs"("tenant_id", "status");
CREATE INDEX "hiring_jobs_tenant_id_department_id_idx" ON "hiring_jobs"("tenant_id", "department_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_tenant_id_email_key" ON "applicants"("tenant_id", "email");
CREATE INDEX "applicants_tenant_id_idx" ON "applicants"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_applicant_id_key" ON "applications"("job_id", "applicant_id");
CREATE INDEX "applications_tenant_id_idx" ON "applications"("tenant_id");
CREATE INDEX "applications_tenant_id_status_idx" ON "applications"("tenant_id", "status");
CREATE INDEX "applications_tenant_id_job_id_idx" ON "applications"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "interview_stages_tenant_id_idx" ON "interview_stages"("tenant_id");
CREATE INDEX "interview_stages_application_id_idx" ON "interview_stages"("application_id");

-- CreateIndex
CREATE INDEX "onboarding_plans_tenant_id_idx" ON "onboarding_plans"("tenant_id");
CREATE INDEX "onboarding_plans_tenant_id_employee_id_idx" ON "onboarding_plans"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "review_cycles_tenant_id_idx" ON "review_cycles"("tenant_id");

-- CreateIndex
CREATE INDEX "performance_reviews_tenant_id_idx" ON "performance_reviews"("tenant_id");
CREATE INDEX "performance_reviews_tenant_id_reviewee_id_idx" ON "performance_reviews"("tenant_id", "reviewee_id");
CREATE INDEX "performance_reviews_tenant_id_cycle_id_idx" ON "performance_reviews"("tenant_id", "cycle_id");

-- CreateIndex
CREATE INDEX "one_on_ones_tenant_id_idx" ON "one_on_ones"("tenant_id");
CREATE INDEX "one_on_ones_tenant_id_employee_id_idx" ON "one_on_ones"("tenant_id", "employee_id");
CREATE INDEX "one_on_ones_tenant_id_manager_id_idx" ON "one_on_ones"("tenant_id", "manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_time_entries_tenant_id_employee_id_date_key" ON "hr_time_entries"("tenant_id", "employee_id", "date");
CREATE INDEX "hr_time_entries_tenant_id_idx" ON "hr_time_entries"("tenant_id");
CREATE INDEX "hr_time_entries_tenant_id_employee_id_idx" ON "hr_time_entries"("tenant_id", "employee_id");
CREATE INDEX "hr_time_entries_tenant_id_date_idx" ON "hr_time_entries"("tenant_id", "date");
CREATE INDEX "hr_time_entries_tenant_id_status_idx" ON "hr_time_entries"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "lgpd_consents_tenant_id_idx" ON "lgpd_consents"("tenant_id");
CREATE INDEX "lgpd_consents_tenant_id_employee_id_idx" ON "lgpd_consents"("tenant_id", "employee_id");
CREATE INDEX "lgpd_consents_tenant_id_purpose_idx" ON "lgpd_consents"("tenant_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "lgpd_retention_policies_tenant_id_data_type_purpose_key" ON "lgpd_retention_policies"("tenant_id", "data_type", "purpose");

-- CreateIndex
CREATE INDEX "people_audit_logs_tenant_id_idx" ON "people_audit_logs"("tenant_id");
CREATE INDEX "people_audit_logs_tenant_id_entity_type_entity_id_idx" ON "people_audit_logs"("tenant_id", "entity_type", "entity_id");
CREATE INDEX "people_audit_logs_tenant_id_actor_id_idx" ON "people_audit_logs"("tenant_id", "actor_id");
CREATE INDEX "people_audit_logs_created_at_idx" ON "people_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_jobs" ADD CONSTRAINT "hiring_jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hiring_jobs" ADD CONSTRAINT "hiring_jobs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hiring_jobs" ADD CONSTRAINT "hiring_jobs_hiring_manager_id_fkey" FOREIGN KEY ("hiring_manager_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "hiring_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_stages" ADD CONSTRAINT "interview_stages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interview_stages" ADD CONSTRAINT "interview_stages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_cycles" ADD CONSTRAINT "review_cycles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "review_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "one_on_ones" ADD CONSTRAINT "one_on_ones_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_time_entries" ADD CONSTRAINT "hr_time_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hr_time_entries" ADD CONSTRAINT "hr_time_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lgpd_consents" ADD CONSTRAINT "lgpd_consents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lgpd_consents" ADD CONSTRAINT "lgpd_consents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lgpd_retention_policies" ADD CONSTRAINT "lgpd_retention_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people_audit_logs" ADD CONSTRAINT "people_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "people_audit_logs" ADD CONSTRAINT "audit_employee_fk" FOREIGN KEY ("entity_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
