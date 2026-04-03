-- Add caller_type and agent_id columns to AuditLog for agent support
-- Idempotent: uses IF NOT EXISTS throughout to handle partial application

-- Add caller_type column with default 'HUMAN'
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "caller_type" VARCHAR(20) NOT NULL DEFAULT 'HUMAN';

-- Add agent_id column (nullable, for when caller_type = AGENT)
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "agent_id" VARCHAR(255);

-- Create CallerType enum if not exists (safe within Prisma-managed transaction)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CallerType') THEN
        CREATE TYPE "CallerType" AS ENUM ('HUMAN', 'AGENT');
    END IF;
END;
$$;

-- Add index for filtering by caller type
CREATE INDEX IF NOT EXISTS "AuditLog_caller_type_idx" ON "AuditLog"("caller_type");

-- Add index for filtering by agent
CREATE INDEX IF NOT EXISTS "AuditLog_agent_id_idx" ON "AuditLog"("agent_id");
