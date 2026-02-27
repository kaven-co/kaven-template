-- AlterTable: Add metadata JSONB column to GrantRequest
-- Technical Debt: DB-L3 — GrantRequest.metadata Missing
-- Purpose: Optional JSON metadata for additional request context (e.g., justification details, approval notes)

ALTER TABLE "grant_requests" ADD COLUMN "metadata" JSONB;
