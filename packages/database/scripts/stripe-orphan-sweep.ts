/**
 * F2.4.3.2 — Stripe Customer orphan sweep.
 *
 * Reconcilia Stripe Customers com o DB Kaven. Detecta 2 classes de divergência:
 *
 *   1. Stripe Customer sem match em DB:
 *      - `BillingAccount.stripeCustomerId = customer.id` → não existe
 *      - E `Tenant.stripeCustomerId = customer.id` (legacy) → não existe
 *      ⇒ Órfão real. Pode ter vindo de:
 *         - signup tx DB abortada após Stripe criar Customer (F2.4.3.1 mitigated but not zero)
 *         - tenant deletado manualmente sem cleanup Stripe
 *         - teste manual em prod
 *
 *   2. Dangling metadata:
 *      - `customer.metadata.tenantId` → tenant inexistente ou `deletedAt` setado
 *      ⇒ Stale pointer. Customer ainda útil se for legacy pre-F2.4 (tenant hard-deleted).
 *
 * Default: DRY-RUN (só reporta). Escrita destrutiva exige:
 *   - flag `--delete`
 *   - env `STRIPE_SWEEP_CONFIRM=yes` (defense-in-depth contra rm -rf acidental)
 *
 * Uso:
 *   pnpm --filter @kaven/database stripe:sweep                            # dry-run
 *   STRIPE_SWEEP_CONFIRM=yes pnpm --filter @kaven/database stripe:sweep -- --delete
 *
 * Segurança:
 *   - Só opera em Customers com metadata.kaven === "true" (outros são ignorados).
 *   - Logs usam maskStripeId / maskEmail (F2.4.3.1 H-3 pattern).
 *   - ADR-0001 seção "Consumers cobertos" documenta o contract.
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const DRY_RUN = !process.argv.includes('--delete');
const CONFIRMED = process.env.STRIPE_SWEEP_CONFIRM === 'yes';

const prisma = new PrismaClient();

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY não definida. Abort.');
  process.exit(1);
}
const stripe = new Stripe(stripeKey, { apiVersion: '2024-09-30.acacia' });

function maskEmail(email: string | null | undefined): string {
  if (!email) return '(none)';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const localMasked = local.length <= 2 ? '*'.repeat(local.length) : `${local[0]}***${local[local.length - 1]}`;
  const dotIdx = domain.lastIndexOf('.');
  const domainName = dotIdx > 0 ? domain.slice(0, dotIdx) : domain;
  const tld = dotIdx > 0 ? domain.slice(dotIdx) : '';
  const domainMasked = domainName.length <= 1 ? '*' : `${domainName[0]}***${tld}`;
  return `${localMasked}@${domainMasked}`;
}

function maskStripeId(id: string | null | undefined): string {
  if (!id) return '(none)';
  if (id.length <= 8) return '***';
  return `${id.slice(0, 4)}***${id.slice(-4)}`;
}

type SweepReport = {
  totalKavenCustomers: number;
  orphans: Array<{ customerId: string; email: string; tenantIdMeta: string | null; reason: string }>;
  danglingMetadata: Array<{ customerId: string; tenantIdMeta: string; tenantState: string }>;
  deleted: string[];
  skipped: string[];
  errors: Array<{ customerId: string; error: string }>;
};

async function* iterateKavenCustomers(): AsyncGenerator<Stripe.Customer> {
  // Stripe search supports metadata queries; cheaper than paginating all customers.
  // Query: customers where metadata['kaven'] = 'true'.
  const iterator = stripe.customers.search({
    query: "metadata['kaven']:'true'",
    limit: 100,
  });
  for await (const customer of iterator) {
    yield customer;
  }
}

async function classifyCustomer(
  customer: Stripe.Customer,
  report: SweepReport,
): Promise<'orphan' | 'dangling' | 'healthy'> {
  const customerId = customer.id;
  const tenantIdMeta = (customer.metadata?.tenantId as string | undefined) ?? null;

  // 1. Is there a BillingAccount using this Stripe Customer ID?
  const ba = await prisma.billingAccount.findFirst({
    where: { stripeCustomerId: customerId, deletedAt: null },
    select: { id: true },
  });
  if (ba) return 'healthy';

  // 2. Legacy fallback — Tenant.stripeCustomerId (pre-F2.4).
  const tenantLegacy = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "Tenant"
    WHERE stripe_customer_id = ${customerId}
      AND "deletedAt" IS NULL
    LIMIT 1
  `;
  if (tenantLegacy.length > 0) return 'healthy';

  // 3. No DB owner. If metadata.tenantId exists, check if that tenant is alive.
  if (tenantIdMeta) {
    const tenantRows = await prisma.$queryRaw<Array<{ id: string; deletedAt: Date | null }>>`
      SELECT id, "deletedAt"
      FROM "Tenant"
      WHERE id = ${tenantIdMeta}
      LIMIT 1
    `;
    const tenant = tenantRows[0];
    if (tenant && !tenant.deletedAt) {
      // Tenant exists and is active, but no BA/Tenant column points to this
      // customer. Could mean signup race before DB commit, or stale metadata.
      report.orphans.push({
        customerId,
        email: customer.email ?? '',
        tenantIdMeta,
        reason: 'tenant exists but no BA/Tenant column references this Customer',
      });
      return 'orphan';
    }
    report.danglingMetadata.push({
      customerId,
      tenantIdMeta,
      tenantState: tenant ? 'soft-deleted' : 'not-found',
    });
    return 'dangling';
  }

  // No metadata.tenantId and no DB reference — classic orphan.
  report.orphans.push({
    customerId,
    email: customer.email ?? '',
    tenantIdMeta: null,
    reason: 'no metadata.tenantId and no DB reference',
  });
  return 'orphan';
}

async function maybeDelete(customerId: string, report: SweepReport): Promise<void> {
  if (DRY_RUN) {
    report.skipped.push(customerId);
    return;
  }
  if (!CONFIRMED) {
    console.error(`  ⚠ --delete passed but STRIPE_SWEEP_CONFIRM=yes not set — skipping ${maskStripeId(customerId)}.`);
    report.skipped.push(customerId);
    return;
  }
  try {
    await stripe.customers.del(customerId);
    report.deleted.push(customerId);
    console.log(`  🗑 Deleted Customer ${maskStripeId(customerId)}`);
  } catch (e) {
    report.errors.push({ customerId, error: e instanceof Error ? e.message : String(e) });
  }
}

async function main() {
  console.log(
    `🧹 Stripe orphan sweep ${DRY_RUN ? '(DRY RUN)' : '(DESTRUCTIVE — will call stripe.customers.del)'}`,
  );
  if (!DRY_RUN && !CONFIRMED) {
    console.error('❌ --delete passed but STRIPE_SWEEP_CONFIRM=yes not set. Aborting for safety.');
    process.exit(1);
  }

  const report: SweepReport = {
    totalKavenCustomers: 0,
    orphans: [],
    danglingMetadata: [],
    deleted: [],
    skipped: [],
    errors: [],
  };

  for await (const customer of iterateKavenCustomers()) {
    report.totalKavenCustomers++;
    try {
      const verdict = await classifyCustomer(customer, report);
      if (verdict === 'orphan') {
        console.log(
          `  ✗ ORPHAN  ${maskStripeId(customer.id)}  email=${maskEmail(customer.email)}  tenantMeta=${customer.metadata?.tenantId ?? '(none)'}`,
        );
        await maybeDelete(customer.id, report);
      } else if (verdict === 'dangling') {
        console.log(
          `  ⚠ DANGLING ${maskStripeId(customer.id)} tenantMeta points to non-live tenant`,
        );
        // Dangling does NOT auto-delete — the Customer may still have valid
        // billing history tied to a hard-deleted tenant (rare but possible).
        // Operator must inspect and decide manually.
        report.skipped.push(customer.id);
      }
    } catch (e) {
      report.errors.push({ customerId: customer.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  console.log('\n📊 Report:');
  console.log(`   Kaven Customers encontrados:  ${report.totalKavenCustomers}`);
  console.log(`   Órfãos (candidatos a delete): ${report.orphans.length}`);
  console.log(`   Dangling metadata (manual):   ${report.danglingMetadata.length}`);
  console.log(`   Deletados nesta execução:     ${report.deleted.length}`);
  console.log(`   Skipped (dry-run ou dangling):${report.skipped.length}`);
  console.log(`   Erros:                         ${report.errors.length}`);

  if (report.errors.length > 0) {
    console.error('\n❌ Erros:');
    for (const err of report.errors) {
      console.error(`   - ${maskStripeId(err.customerId)}: ${err.error}`);
    }
    process.exit(1);
  }

  if (DRY_RUN && report.orphans.length > 0) {
    console.log(
      '\n🔎 DRY RUN: nada foi deletado. Re-execute com `--delete` e `STRIPE_SWEEP_CONFIRM=yes` para limpar.',
    );
  }
}

main()
  .catch((e) => {
    console.error('❌ Sweep falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
