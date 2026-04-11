-- TD-15: Add stripeCustomerId to Tenant for billing identity
-- Created at tenant signup; enables lazy-creation fallback at checkout.

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_stripe_customer_id_key"
  ON "Tenant"("stripe_customer_id")
  WHERE "stripe_customer_id" IS NOT NULL;
