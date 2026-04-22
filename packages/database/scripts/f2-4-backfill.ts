/**
 * F2.4.2 Backfill — Multi-Workspace Ownership.
 *
 * Popula BillingAccounts para Tenants existentes e liga Subscriptions.
 *
 * Invariantes garantidos após execução:
 *   1. Todo Tenant não-deletado tem `billing_account_id` NOT NULL.
 *   2. Toda Subscription de Tenant não-deletado tem `billing_account_id` NOT NULL.
 *   3. `BillingAccount.stripeCustomerId` herda `Tenant.stripeCustomerId` (quando existia).
 *   4. `BillingAccount.ownerUserId` = primeiro User com role TENANT_ADMIN do Tenant
 *      (ordem: createdAt ASC).
 *
 * Idempotência:
 *   Chave de detecção: BillingAccount cuja relação via Tenant já aponta para ela.
 *   Rodar 2× = mesmo estado. Resume correto em caso de interrupção.
 *
 * Segurança:
 *   - Usa transação por tenant (atomicidade parcial).
 *   - Rollback documentado em rollback SQL separado.
 *   - Pre-requisito: F2.4.0 audit APROVADO (sem blockers).
 *
 * Uso:
 *   pnpm --filter @kaven/database f2-4:backfill            # executa
 *   pnpm --filter @kaven/database f2-4:backfill --dry-run  # só reporta, sem mudar
 */

import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const DRY_RUN = process.argv.includes('--dry-run');

// F2.4.3.1 — H-3: mask PII/Stripe IDs in logs to avoid leakage.
// Stripe Customer IDs (`cus_XXXXXXXXXXXXXX`) are sensitive for lookup in
// Stripe Dashboard. Emails are PII (LGPD/GDPR). Mask both by default.
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const localMasked = local.length <= 2 ? '*'.repeat(local.length) : `${local[0]}***${local[local.length - 1]}`;
  const dotIdx = domain.lastIndexOf('.');
  const domainName = dotIdx > 0 ? domain.slice(0, dotIdx) : domain;
  const tld = dotIdx > 0 ? domain.slice(dotIdx) : '';
  const domainMasked = domainName.length <= 1 ? '*' : `${domainName[0]}***${tld}`;
  return `${localMasked}@${domainMasked}`;
}

function maskStripeId(id: string | null): string {
  if (!id) return '(none)';
  if (id.length <= 8) return '***';
  return `${id.slice(0, 4)}***${id.slice(-4)}`;
}

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  billing_account_id: string | null;
  /**
   * F2.4.3.2 — H: resolved via LEFT JOIN billing_accounts with
   * `ba.deleted_at IS NULL`. Null when Tenant has no BA OR when BA is
   * soft-deleted. Drives the "skip vs process" decision below.
   */
  effective_billing_account_id: string | null;
  stripe_customer_id: string | null;
};

type AdminRow = { id: string; email: string };
type SubscriptionRow = { id: string; billing_account_id: string | null };

type BackfillResult = {
  tenantsProcessed: number;
  tenantsSkipped: number;
  /**
   * F2.4.3.3 — 3.2: races between signup tx and backfill tx are benign
   * (signup already produced a live BA). Count them separately so the caller
   * doesn't treat them as errors and `process.exit(1)` when everything is
   * actually fine.
   */
  tenantsSkippedByRace: number;
  subscriptionsLinked: number;
  subscriptionsSkipped: number;
  billingAccountsCreated: number;
  errors: Array<{ tenantId: string; reason: string }>;
};

// F2.4.3.3 — 3.2: sentinel used by backfillTenant to communicate "race aborted
// me; this is benign" to the top-level catch. Kept as a distinct Error subclass
// so arbitrary thrown Errors are still surfaced as real errors.
class RaceAbortedError extends Error {
  constructor(public readonly tenantId: string) {
    super(`Race aborted backfill for tenant ${tenantId} (live BA won)`);
    this.name = 'RaceAbortedError';
  }
}

async function findTenantAdmin(tenantId: string): Promise<AdminRow | null> {
  const rows = await prisma.$queryRaw<AdminRow[]>`
    SELECT u.id, u.email
    FROM "User" u
    WHERE u."tenantId" = ${tenantId}
      AND u.role = 'TENANT_ADMIN'
      AND u."deletedAt" IS NULL
    ORDER BY u."createdAt" ASC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function backfillTenant(tenant: TenantRow, result: BackfillResult): Promise<void> {
  // F2.4.3.2 — H: `effective_billing_account_id` is NULL when either the Tenant
  // has no BA pointer OR the pointed-to BA is soft-deleted. In the latter case
  // the Tenant is effectively orphaned from a live BA and must be re-processed
  // here (we'll allocate a fresh BA and overwrite the stale pointer below).
  if (tenant.effective_billing_account_id) {
    result.tenantsSkipped++;
    return;
  }

  const admin = await findTenantAdmin(tenant.id);
  if (!admin) {
    result.errors.push({
      tenantId: tenant.id,
      reason: `no TENANT_ADMIN found (audit should have caught this — re-run F2.4.0)`,
    });
    return;
  }

  if (DRY_RUN) {
    console.log(
      `  [DRY] Tenant ${tenant.slug} → create BA owner=${maskEmail(admin.email)} stripeCustomerId=${maskStripeId(tenant.stripe_customer_id)}`
    );
    result.tenantsProcessed++;
    result.billingAccountsCreated++;
    return;
  }

  // Transação: criar BA + atualizar Tenant + atualizar Subscriptions atomicamente.
  await prisma.$transaction(async (tx) => {
    // F2.4.3.1 — B3: mark records as backfill-origin so rollback can distinguish.
    const ba = await tx.billingAccount.create({
      data: {
        ownerUserId: admin.id,
        stripeCustomerId: tenant.stripe_customer_id,
        name: tenant.name,
        source: 'backfill_f2_4_2',
      },
    });

    // F2.4.3.1 — B4 + F2.4.3.2 — H: race-safe UPDATE. Accepts two valid states:
    //   (a) billing_account_id IS NULL (pristine Tenant, normal backfill path)
    //   (b) billing_account_id = <stale_id> (pointer to a soft-deleted BA —
    //       operator orphaned the Tenant; we overwrite with the fresh BA)
    // rowCount === 0 means a live signup won the race after our SELECT saw a
    // NULL/stale pointer — we abort to avoid producing duplicate BAs.
    const staleBaId = tenant.billing_account_id;
    const tenantRowsUpdated = staleBaId
      ? await tx.$executeRaw`
          UPDATE "Tenant"
          SET "billing_account_id" = ${ba.id}
          WHERE id = ${tenant.id} AND "billing_account_id" = ${staleBaId}
        `
      : await tx.$executeRaw`
          UPDATE "Tenant"
          SET "billing_account_id" = ${ba.id}
          WHERE id = ${tenant.id} AND "billing_account_id" IS NULL
        `;

    if (tenantRowsUpdated === 0) {
      // F2.4.3.3 — 3.2: benign race. Top-level `main` will catch
      // RaceAbortedError and increment tenantsSkippedByRace instead of
      // treating this as a hard error.
      throw new RaceAbortedError(tenant.id);
    }

    // F2.4.3.3 — 3.1: Subscription re-link MUST cover both states:
    //   (a) NULL billing_account_id (pristine legacy sub)
    //   (b) billing_account_id = <staleBaId> (was linked to the soft-deleted BA
    //       we just displaced; those subs are now orphaned from a live BA)
    // Missing (b) would leave subs pointing at a deleted BA — violates
    // post-validate invariant.
    const subscriptions = staleBaId
      ? await tx.$queryRaw<SubscriptionRow[]>`
          SELECT id, billing_account_id
          FROM subscriptions
          WHERE tenant_id = ${tenant.id}
            AND (billing_account_id IS NULL OR billing_account_id = ${staleBaId})
        `
      : await tx.$queryRaw<SubscriptionRow[]>`
          SELECT id, billing_account_id
          FROM subscriptions
          WHERE tenant_id = ${tenant.id}
            AND billing_account_id IS NULL
        `;

    for (const sub of subscriptions) {
      const prev = sub.billing_account_id;
      // Race-safe UPDATE for each sub — predicate matches only the expected
      // prior state, so concurrent writes don't clobber.
      const subUpdated = prev
        ? await tx.$executeRaw`
            UPDATE subscriptions
            SET billing_account_id = ${ba.id}
            WHERE id = ${sub.id} AND billing_account_id = ${prev}
          `
        : await tx.$executeRaw`
            UPDATE subscriptions
            SET billing_account_id = ${ba.id}
            WHERE id = ${sub.id} AND billing_account_id IS NULL
          `;
      if (subUpdated === 1) result.subscriptionsLinked++;
      else result.subscriptionsSkipped++;
    }

    result.billingAccountsCreated++;
    result.tenantsProcessed++;

    console.log(
      `  ✓ Tenant ${tenant.slug} → BA ${maskStripeId(ba.id)} (owner=${maskEmail(admin.email)}, ${subscriptions.length} subs)`
    );
  });
}

async function validatePostBackfill(): Promise<void> {
  const [orphanTenants, orphanSubs, subsOnDeadBa] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM "Tenant"
      WHERE "deletedAt" IS NULL
        AND billing_account_id IS NULL
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM subscriptions s
      INNER JOIN "Tenant" t ON t.id = s.tenant_id
      WHERE t."deletedAt" IS NULL
        AND s.billing_account_id IS NULL
    `,
    // F2.4.3.3 — 3.1: catch subs still pointing at a soft-deleted BA. Backfill
    // must leave every live Subscription on a live BA.
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM subscriptions s
      INNER JOIN "Tenant" t ON t.id = s.tenant_id
      INNER JOIN billing_accounts ba ON ba.id = s.billing_account_id
      WHERE t."deletedAt" IS NULL
        AND s.deleted_at IS NULL
        AND ba.deleted_at IS NOT NULL
    `,
  ]);

  const orphanTenantsCount = Number(orphanTenants[0].count);
  const orphanSubsCount = Number(orphanSubs[0].count);
  const subsOnDeadBaCount = Number(subsOnDeadBa[0].count);

  console.log('\n📋 Pós-backfill validation:');
  console.log(`   Tenants ativos sem BA: ${orphanTenantsCount}`);
  console.log(`   Subscriptions ativas sem BA: ${orphanSubsCount}`);
  console.log(`   Subscriptions ligadas a BA soft-deleted: ${subsOnDeadBaCount}`);

  if (orphanTenantsCount > 0 || orphanSubsCount > 0 || subsOnDeadBaCount > 0) {
    console.error('\n❌ VALIDATION FAILED: backfill deixou tenants/subscriptions órfãos ou em BA morta.');
    process.exit(1);
  }
}

async function main() {
  console.log(`🔧 F2.4.2 Backfill ${DRY_RUN ? '(DRY RUN)' : ''}— start`);

  // F2.4.3.2 — H: LEFT JOIN to resolve whether the BA pointer is still live.
  // `effective_billing_account_id` is NULL if the BA was soft-deleted (Tenant
  // becomes re-processable) OR if the pointer is NULL to begin with.
  const tenants = await prisma.$queryRaw<TenantRow[]>`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.billing_account_id,
      ba.id AS effective_billing_account_id,
      t.stripe_customer_id
    FROM "Tenant" t
    LEFT JOIN billing_accounts ba
      ON ba.id = t.billing_account_id
      AND ba.deleted_at IS NULL
    WHERE t."deletedAt" IS NULL
    ORDER BY t."createdAt" ASC
  `;

  console.log(`📊 Tenants ativos encontrados: ${tenants.length}`);

  const result: BackfillResult = {
    tenantsProcessed: 0,
    tenantsSkipped: 0,
    tenantsSkippedByRace: 0,
    subscriptionsLinked: 0,
    subscriptionsSkipped: 0,
    billingAccountsCreated: 0,
    errors: [],
  };

  for (const tenant of tenants) {
    try {
      await backfillTenant(tenant, result);
    } catch (e) {
      // F2.4.3.3 — 3.2: race aborts are benign — signup already created a
      // live BA for this tenant. Count them separately so the caller doesn't
      // misinterpret as a hard failure.
      if (e instanceof RaceAbortedError) {
        result.tenantsSkippedByRace++;
        console.log(`  ↷ Tenant ${tenant.slug} → skipped (race: live BA already present)`);
      } else {
        result.errors.push({
          tenantId: tenant.id,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }

  console.log('\n📊 Resultado:');
  console.log(`   Tenants processados: ${result.tenantsProcessed}`);
  console.log(`   Tenants skipped (já tinham BA): ${result.tenantsSkipped}`);
  console.log(`   Tenants skipped por race (benigno): ${result.tenantsSkippedByRace}`);
  console.log(`   BillingAccounts criadas: ${result.billingAccountsCreated}`);
  console.log(`   Subscriptions ligadas: ${result.subscriptionsLinked}`);
  console.log(`   Subscriptions skipped: ${result.subscriptionsSkipped}`);
  console.log(`   Erros: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.error('\n❌ Erros:');
    for (const err of result.errors) {
      console.error(`   - Tenant ${err.tenantId}: ${err.reason}`);
    }
    process.exit(1);
  }

  if (!DRY_RUN) {
    await validatePostBackfill();
    console.log('\n✅ Backfill concluído com sucesso.');
  } else {
    console.log('\n🔎 DRY RUN: nada foi escrito no DB.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Backfill falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
