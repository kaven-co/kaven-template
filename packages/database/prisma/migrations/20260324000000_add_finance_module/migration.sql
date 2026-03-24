-- CreateEnum
CREATE TYPE "FinancialEntryStatus" AS ENUM ('SCHEDULED', 'PENDING', 'CONFIRMED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "FinanceProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "appears_in_dfc" BOOLEAN NOT NULL DEFAULT true,
    "appears_in_dre" BOOLEAN NOT NULL DEFAULT true,
    "bs_category" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank_code" TEXT,
    "bank_name" TEXT,
    "agency" TEXT,
    "account_number" TEXT,
    "type" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "initial_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "initial_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "credit_limit" DECIMAL(15,2),
    "closing_day" INTEGER,
    "due_day" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_card_statements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "reference_month" INTEGER NOT NULL,
    "reference_year" INTEGER NOT NULL,
    "closing_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "paid_at" TIMESTAMP(3),
    "paid_entry_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_projects" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "FinanceProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "budget_amount" DECIMAL(15,2),
    "actual_amount" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "finance_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "date_dfc" TIMESTAMP(3) NOT NULL,
    "date_dre" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "transfer_pair_id" TEXT,
    "description" TEXT,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "exchange_rate" DECIMAL(10,6),
    "total_amount_brl" DECIMAL(15,2),
    "tax_retained" DECIMAL(15,2),
    "net_amount" DECIMAL(15,2),
    "interest_rate" DECIMAL(5,4),
    "penalty_amount" DECIMAL(15,2),
    "paid_amount" DECIMAL(15,2),
    "status" "FinancialEntryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "period_locked" BOOLEAN NOT NULL DEFAULT false,
    "balance_sheet_type" TEXT,
    "recurring_entry_id" TEXT,
    "installment_plan_id" TEXT,
    "installment_number" INTEGER,
    "source_type" TEXT,
    "source_id" TEXT,
    "external_ref" TEXT,
    "imported_at" TIMESTAMP(3),
    "client_id" TEXT,
    "entity_id" TEXT,
    "project_id" TEXT,
    "tags" TEXT[],
    "attachment_url" TEXT,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "financial_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_entry_lines" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "chart_of_account_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "cost_center_id" TEXT,
    "statement_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "financial_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_plans" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "installment_amount" DECIMAL(15,2) NOT NULL,
    "first_due_date" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "chart_of_account_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "client_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "chart_of_account_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "cost_center_id" TEXT,
    "client_id" TEXT,
    "frequency" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_generated_at" TIMESTAMP(3),
    "next_due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Annual Budget',
    "scenario" TEXT NOT NULL DEFAULT 'base',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_lines" (
    "id" TEXT NOT NULL,
    "budget_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "chart_of_account_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_projections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "assumptions" JSONB NOT NULL,
    "projections" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_projections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closed_periods" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "closed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_by_id" TEXT NOT NULL,

    CONSTRAINT "closed_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "formula" TEXT NOT NULL,
    "industry" TEXT,
    "threshold_good" DECIMAL(15,4),
    "threshold_warning" DECIMAL(15,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_type_idx" ON "chart_of_accounts"("tenant_id", "type");
CREATE INDEX "chart_of_accounts_tenant_id_parent_id_idx" ON "chart_of_accounts"("tenant_id", "parent_id");
CREATE INDEX "chart_of_accounts_tenant_id_code_idx" ON "chart_of_accounts"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_type_is_active_idx" ON "bank_accounts"("tenant_id", "type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "credit_card_statements_tenant_id_bank_account_id_reference__key" ON "credit_card_statements"("tenant_id", "bank_account_id", "reference_year", "reference_month");
CREATE INDEX "credit_card_statements_tenant_id_status_due_date_idx" ON "credit_card_statements"("tenant_id", "status", "due_date");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_is_active_idx" ON "cost_centers"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "finance_projects_tenant_id_status_idx" ON "finance_projects"("tenant_id", "status");
CREATE INDEX "finance_projects_tenant_id_start_date_end_date_idx" ON "finance_projects"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "financial_entries_tenant_id_date_dfc_idx" ON "financial_entries"("tenant_id", "date_dfc");
CREATE INDEX "financial_entries_tenant_id_date_dre_idx" ON "financial_entries"("tenant_id", "date_dre");
CREATE INDEX "financial_entries_tenant_id_type_status_idx" ON "financial_entries"("tenant_id", "type", "status");
CREATE INDEX "financial_entries_tenant_id_status_due_date_idx" ON "financial_entries"("tenant_id", "status", "due_date");
CREATE INDEX "financial_entries_tenant_id_client_id_idx" ON "financial_entries"("tenant_id", "client_id");
CREATE INDEX "financial_entries_tenant_id_source_type_source_id_idx" ON "financial_entries"("tenant_id", "source_type", "source_id");
CREATE INDEX "financial_entries_tenant_id_transfer_pair_id_idx" ON "financial_entries"("tenant_id", "transfer_pair_id");
CREATE INDEX "financial_entries_tenant_id_installment_plan_id_idx" ON "financial_entries"("tenant_id", "installment_plan_id");

-- CreateIndex
CREATE INDEX "financial_entry_lines_tenant_id_entry_id_idx" ON "financial_entry_lines"("tenant_id", "entry_id");
CREATE INDEX "financial_entry_lines_tenant_id_chart_of_account_id_idx" ON "financial_entry_lines"("tenant_id", "chart_of_account_id");
CREATE INDEX "financial_entry_lines_tenant_id_bank_account_id_idx" ON "financial_entry_lines"("tenant_id", "bank_account_id");
CREATE INDEX "financial_entry_lines_tenant_id_statement_id_idx" ON "financial_entry_lines"("tenant_id", "statement_id");

-- CreateIndex
CREATE INDEX "installment_plans_tenant_id_status_idx" ON "installment_plans"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "recurring_entries_tenant_id_is_active_next_due_date_idx" ON "recurring_entries"("tenant_id", "is_active", "next_due_date");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_tenant_id_year_name_scenario_key" ON "budgets"("tenant_id", "year", "name", "scenario");
CREATE INDEX "budgets_tenant_id_year_is_active_idx" ON "budgets"("tenant_id", "year", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "budget_lines_budget_id_chart_of_account_id_month_key" ON "budget_lines"("budget_id", "chart_of_account_id", "month");
CREATE INDEX "budget_lines_tenant_id_budget_id_idx" ON "budget_lines"("tenant_id", "budget_id");
CREATE INDEX "budget_lines_tenant_id_chart_of_account_id_idx" ON "budget_lines"("tenant_id", "chart_of_account_id");

-- CreateIndex
CREATE INDEX "financial_projections_tenant_id_is_active_idx" ON "financial_projections"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "closed_periods_tenant_id_year_month_key" ON "closed_periods"("tenant_id", "year", "month");
CREATE INDEX "closed_periods_tenant_id_year_idx" ON "closed_periods"("tenant_id", "year");

-- CreateIndex
CREATE INDEX "kpi_definitions_industry_is_active_idx" ON "kpi_definitions"("industry", "is_active");
CREATE INDEX "kpi_definitions_tenant_id_is_active_idx" ON "kpi_definitions"("tenant_id", "is_active");

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_card_statements" ADD CONSTRAINT "credit_card_statements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "credit_card_statements" ADD CONSTRAINT "credit_card_statements_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_projects" ADD CONSTRAINT "finance_projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "finance_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entry_lines" ADD CONSTRAINT "financial_entry_lines_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "financial_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_entry_lines" ADD CONSTRAINT "financial_entry_lines_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "financial_entry_lines" ADD CONSTRAINT "financial_entry_lines_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_entry_lines" ADD CONSTRAINT "financial_entry_lines_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "financial_entry_lines" ADD CONSTRAINT "financial_entry_lines_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "credit_card_statements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_entries" ADD CONSTRAINT "recurring_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_lines" ADD CONSTRAINT "budget_lines_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_projections" ADD CONSTRAINT "financial_projections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_periods" ADD CONSTRAINT "closed_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
