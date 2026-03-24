-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PRIVATE', 'FOLDER_MEMBERS', 'TENANT');
-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEWER', 'COMMENTER', 'EDITOR', 'ADMIN');
-- CreateEnum
CREATE TYPE "KBArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'NEEDS_REVIEW', 'ARCHIVED');
-- CreateEnum
CREATE TYPE "DocumentCommentStatus" AS ENUM ('OPEN', 'RESOLVED', 'DELETED');
-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('LEGAL', 'HR', 'FINANCE', 'MARKETING', 'PROJECTS', 'CLIENTS', 'GENERAL');
-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "parent_id" TEXT,
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'FOLDER_MEMBERS',
    "owner_id" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "system_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "folder_shares" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "folder_id" TEXT NOT NULL,
    "user_id" TEXT,
    "group_id" TEXT,
    "permission" "SharePermission" NOT NULL,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    CONSTRAINT "folder_shares_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "folder_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "DocumentVisibility" NOT NULL DEFAULT 'FOLDER_MEMBERS',
    "file_key" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "is_rich_text" BOOLEAN NOT NULL DEFAULT false,
    "rich_content" JSONB,
    "summary" TEXT,
    "tags" TEXT[],
    "linked_module" TEXT,
    "linked_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "current_version_id" TEXT,
    "version_count" INTEGER NOT NULL DEFAULT 1,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "label" TEXT,
    "file_key" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "rich_content" JSONB,
    "change_log" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT,
    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "status" "DocumentCommentStatus" NOT NULL DEFAULT 'OPEN',
    "content" TEXT NOT NULL,
    "mentions" TEXT[],
    "anchor_id" TEXT,
    "anchor_text" TEXT,
    "author_id" TEXT NOT NULL,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "document_comments_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "user_id" TEXT,
    "group_id" TEXT,
    "email" TEXT,
    "permission" "SharePermission" NOT NULL,
    "token" TEXT,
    "granted_by" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "accessed_at" TIMESTAMP(3),
    CONSTRAINT "document_shares_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "kb_articles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "KBArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "summary" TEXT,
    "tags" TEXT[],
    "linked_module" TEXT,
    "related_doc_ids" TEXT[],
    "expert_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "needs_review" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "published_at" TIMESTAMP(3),
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    CONSTRAINT "kb_articles_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "kb_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "system_slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kb_categories_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "TemplateCategory" NOT NULL,
    "content" JSONB NOT NULL,
    "file_key" TEXT,
    "mime_type" TEXT,
    "tags" TEXT[],
    "preview_url" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "linked_module" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_template_usages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "used_by" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_template_usages_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "document_activity_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "document_id" TEXT,
    "article_id" TEXT,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_activity_logs_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "folders_tenant_id_idx" ON "folders"("tenant_id");
-- CreateIndex
CREATE INDEX "folders_tenant_id_parent_id_idx" ON "folders"("tenant_id", "parent_id");
-- CreateIndex
CREATE INDEX "folders_tenant_id_system_slug_idx" ON "folders"("tenant_id", "system_slug");
-- CreateIndex
CREATE INDEX "folder_shares_tenant_id_user_id_idx" ON "folder_shares"("tenant_id", "user_id");
-- CreateIndex
CREATE UNIQUE INDEX "folder_shares_folder_id_user_id_key" ON "folder_shares"("folder_id", "user_id");
-- CreateIndex
CREATE UNIQUE INDEX "folder_shares_folder_id_group_id_key" ON "folder_shares"("folder_id", "group_id");
-- CreateIndex
CREATE INDEX "documents_tenant_id_idx" ON "documents"("tenant_id");
-- CreateIndex
CREATE INDEX "documents_tenant_id_folder_id_idx" ON "documents"("tenant_id", "folder_id");
-- CreateIndex
CREATE INDEX "documents_tenant_id_status_idx" ON "documents"("tenant_id", "status");
-- CreateIndex
CREATE INDEX "documents_tenant_id_linked_module_linked_id_idx" ON "documents"("tenant_id", "linked_module", "linked_id");
-- CreateIndex
CREATE INDEX "documents_tenant_id_owner_id_idx" ON "documents"("tenant_id", "owner_id");
-- CreateIndex
CREATE INDEX "documents_tenant_id_tags_idx" ON "documents"("tenant_id", "tags");
-- CreateIndex
CREATE INDEX "document_versions_tenant_id_document_id_idx" ON "document_versions"("tenant_id", "document_id");
-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_number_key" ON "document_versions"("document_id", "version_number");
-- CreateIndex
CREATE INDEX "document_comments_tenant_id_document_id_idx" ON "document_comments"("tenant_id", "document_id");
-- CreateIndex
CREATE INDEX "document_comments_tenant_id_author_id_idx" ON "document_comments"("tenant_id", "author_id");
-- CreateIndex
CREATE UNIQUE INDEX "document_shares_token_key" ON "document_shares"("token");
-- CreateIndex
CREATE INDEX "document_shares_tenant_id_user_id_idx" ON "document_shares"("tenant_id", "user_id");
-- CreateIndex
CREATE INDEX "document_shares_token_idx" ON "document_shares"("token");
-- CreateIndex
CREATE UNIQUE INDEX "document_shares_document_id_user_id_key" ON "document_shares"("document_id", "user_id");
-- CreateIndex
CREATE UNIQUE INDEX "document_shares_document_id_group_id_key" ON "document_shares"("document_id", "group_id");
-- CreateIndex
CREATE INDEX "kb_articles_tenant_id_idx" ON "kb_articles"("tenant_id");
-- CreateIndex
CREATE INDEX "kb_articles_tenant_id_category_id_idx" ON "kb_articles"("tenant_id", "category_id");
-- CreateIndex
CREATE INDEX "kb_articles_tenant_id_status_idx" ON "kb_articles"("tenant_id", "status");
-- CreateIndex
CREATE INDEX "kb_articles_tenant_id_tags_idx" ON "kb_articles"("tenant_id", "tags");
-- CreateIndex
CREATE UNIQUE INDEX "kb_articles_tenant_id_slug_key" ON "kb_articles"("tenant_id", "slug");
-- CreateIndex
CREATE INDEX "kb_categories_tenant_id_parent_id_idx" ON "kb_categories"("tenant_id", "parent_id");
-- CreateIndex
CREATE UNIQUE INDEX "kb_categories_tenant_id_slug_key" ON "kb_categories"("tenant_id", "slug");
-- CreateIndex
CREATE INDEX "document_templates_tenant_id_idx" ON "document_templates"("tenant_id");
-- CreateIndex
CREATE INDEX "document_templates_tenant_id_category_idx" ON "document_templates"("tenant_id", "category");
-- CreateIndex
CREATE INDEX "document_templates_tenant_id_linked_module_idx" ON "document_templates"("tenant_id", "linked_module");
-- CreateIndex
CREATE INDEX "document_template_usages_tenant_id_template_id_idx" ON "document_template_usages"("tenant_id", "template_id");
-- CreateIndex
CREATE INDEX "document_activity_logs_tenant_id_document_id_idx" ON "document_activity_logs"("tenant_id", "document_id");
-- CreateIndex
CREATE INDEX "document_activity_logs_tenant_id_article_id_idx" ON "document_activity_logs"("tenant_id", "article_id");
-- CreateIndex
CREATE INDEX "document_activity_logs_tenant_id_actor_id_idx" ON "document_activity_logs"("tenant_id", "actor_id");
-- CreateIndex
CREATE INDEX "document_activity_logs_tenant_id_created_at_idx" ON "document_activity_logs"("tenant_id", "created_at");
-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "folder_shares" ADD CONSTRAINT "folder_shares_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "folder_shares" ADD CONSTRAINT "folder_shares_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "document_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_shares" ADD CONSTRAINT "document_shares_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "kb_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kb_categories" ADD CONSTRAINT "kb_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "kb_categories" ADD CONSTRAINT "kb_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "kb_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_template_usages" ADD CONSTRAINT "document_template_usages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_template_usages" ADD CONSTRAINT "document_template_usages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_template_usages" ADD CONSTRAINT "document_template_usages_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "document_activity_logs" ADD CONSTRAINT "document_activity_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- pgvector: conditional — only install if extension is available on the server
-- CI environments (standard PostgreSQL) may not have pgvector installed
-- Production (Neon) has pgvector available natively
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
    CREATE EXTENSION IF NOT EXISTS vector;
    ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
    ALTER TABLE "document_versions" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
    ALTER TABLE "kb_articles" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
    RAISE NOTICE 'pgvector extension enabled, embedding columns created';
  ELSE
    RAISE NOTICE 'pgvector extension not available — skipping embedding columns (install pgvector for semantic search)';
  END IF;
END $$;

-- GIN indexes for tag array search (Prisma generates btree which doesn't support array containment operators)
-- Keep existing btree composite indexes [tenantId, tags] for tenant-scoped ordered queries
CREATE INDEX IF NOT EXISTS "documents_tags_gin_idx" ON "documents" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "kb_articles_tags_gin_idx" ON "kb_articles" USING GIN ("tags");
