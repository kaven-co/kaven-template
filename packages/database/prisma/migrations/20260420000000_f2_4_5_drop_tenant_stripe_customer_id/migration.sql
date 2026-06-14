-- F2.4.5: Drop Tenant.stripe_customer_id (legacy — source of truth moved to BillingAccount)
-- ADR-0001: BillingAccount as Stripe billing source of truth.
-- Pre-condition: ALLOW_LEGACY_TENANT_STRIPE_ID=false in prod for ≥7 days without incidents.
-- Pre-condition: invariant check query returns 0 rows (see F2.4.5 story § Invariant checks SQL).

-- Drop the unique index added in migration 20260411000000
DROP INDEX IF EXISTS "Tenant_stripe_customer_id_key";

ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "stripe_customer_id";
