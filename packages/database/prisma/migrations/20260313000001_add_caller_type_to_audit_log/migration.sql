-- Add caller_type and agent_id columns to AuditLog for agent support
BEGIN;

-- Add caller_type column with default 'HUMAN'
ALTER TABLE "AuditLog" ADD COLUMN "caller_type" VARCHAR(20) NOT NULL DEFAULT 'HUMAN';

-- Add agent_id column (nullable, for when caller_type = AGENT)
ALTER TABLE "AuditLog" ADD COLUMN "agent_id" VARCHAR(255);

-- Create enum type if not exists (for safety)
DO $$ BEGIN
    CREATE TYPE "CallerType" AS ENUM ('HUMAN', 'AGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alter column to use enum
ALTER TABLE "AuditLog" ALTER COLUMN "caller_type" TYPE VARCHAR(20) USING "caller_type"::VARCHAR;

-- Add index for filtering by caller type
CREATE INDEX "AuditLog_caller_type_idx" ON "AuditLog"("caller_type");

-- Add index for filtering by agent
CREATE INDEX "AuditLog_agent_id_idx" ON "AuditLog"("agent_id");

COMMIT;
