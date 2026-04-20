-- F2.4.5: Drop Subscription.stripe_customer_id (legacy — source of truth is BillingAccount)
-- ADR-0001: BillingAccount as Stripe billing source of truth.
-- Pre-condition: ALLOW_LEGACY_TENANT_STRIPE_ID=false in prod for ≥7 days without incidents.
-- Pre-condition: invariant check query returns 0 rows (see F2.4.5 story § Invariant checks SQL).

ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "stripe_customer_id";
