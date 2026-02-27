-- Migration: Rollback and fix for 20260114201400_add_icon_color_mode
--
-- Context: The earlier migration (20260114201400_add_icon_color_mode) added the
-- IconColorMode enum and icon_color_mode column to currencies using a @map("icon_color_mode")
-- column name. However, the Prisma schema was revised to use the default column name
-- (iconColorMode) without @map. This migration:
--
-- 1. DROPS the icon_color_mode column added by the previous migration
-- 2. DROPS the IconColorMode enum (it will be recreated in 20260129033450_init or later)
-- 3. Fixes unrelated project FK constraint (CASCADE on delete for spaces)
-- 4. Drops unused indexes on projects/tasks tables
--
-- The IconColorMode enum and iconColorMode column were ultimately re-added in the
-- consolidated init migration (20260129033450_init) with the correct column naming.

/*
  Warnings:

  - You are about to drop the column `icon_color_mode` on the `currencies` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_space_id_fkey";

-- DropIndex
DROP INDEX "projects_status_idx";

-- DropIndex
DROP INDEX "tasks_priority_idx";

-- DropIndex
DROP INDEX "tasks_status_idx";

-- AlterTable
ALTER TABLE "currencies" DROP COLUMN "icon_color_mode";

-- DropEnum
DROP TYPE "IconColorMode";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
