/**
 * F2.4.3.2 — Stripe Customer orphan sweep.
 * F2.4.3.3 — Prod-safe hardening (age-gate, idempotent delete, audit sidecar,
 *            sk_live gate).
 *
 * Reconcilia Stripe Customers com o DB Kaven. Detecta 2 classes de divergência:
 *
 *   1. Stripe Customer sem match em DB:
 *      - `BillingAccount.stripeCustomerId = customer.id` → não existe
 *      - E `Tenant.stripeCustomerId = customer.id` (legacy) → não existe
 *      ⇒ Órfão real. Pode ter vindo de:
 *         - signup tx DB abortada após Stripe criar Customer
 *         - tenant deletado manualmente sem cleanup Stripe
 *         - teste manual em prod
 *
 *   2. Dangling metadata:
 *      - `customer.metadata.tenantId` → tenant inexistente ou `deletedAt` setado
 *      ⇒ Stale pointer. Customer ainda útil se for legacy pre-F2.4.
 *
 * Safety rails (F2.4.3.3):
 *   • Default DRY-RUN — destrutivo exige `--delete`.
 *   • Destrutivo exige `STRIPE_SWEEP_CONFIRM=yes`.
 *   • Destrutivo em `sk_live` exige ADICIONAL `ALLOW_STRIPE_LIVE_DELETE=yes`.
 *   • Age-gate: Customers criados há < 3600s (1h) são SKIPPED — protege contra
 *     eventual-consistency do Stripe Search (lag ~1min) deletando Customer
 *     cuja signup tx ainda não commitou no DB.
 *   • Delete é idempotente: 404 `resource_missing` cai em `skipped`, não `errors`.
 *   • Audit sidecar: `logs/stripe-sweep-<ISO>.json` persistido ao final com
 *     operator/host/timestamps/counts — para forense pós-incidente.
 *
 * Uso:
 *   pnpm --filter @kaven/database stripe:sweep                            # dry-run
 *   STRIPE_SWEEP_CONFIRM=yes pnpm --filter @kaven/database stripe:sweep -- --delete
 *   # em sk_live, adicionar ALLOW_STRIPE_LIVE_DELETE=yes
 *
 * ADR-0001 §5 documenta o contract; F2.4.4 roadmap integra com audit log DB.
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { hostname } from 'node:os';

const DRY_RUN = !process.argv.includes('--delete');
const CONFIRMED = process.env.STRIPE_SWEEP_CONFIRM === 'yes';
const LIVE_DELETE_OK = process.env.ALLOW_STRIPE_LIVE_DELETE === 'yes';

// F2.4.3.3 — 2.1: Customers younger than this are skipped during classification.
// Stripe Search has ~1min lag; we add margin against signup tx commit delays.
const AGE_GATE_SECONDS = 3600;

const prisma = new PrismaClient();

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY não definida. Abort.');
  process.exit(1);
}
const stripe = new Stripe(stripeKey, { apiVersion: '2024-09-30.acacia' });

// F2.4.3.3 — 2.4: sanity log + live-mode dual gate.
const IS_LIVE = stripeKey.startsWith('sk_live_');
const KEY_MODE = IS_LIVE ? 'sk_live_***' : stripeKey.startsWith('sk_test_') ? 'sk_test_***' : 'sk_***';

if (!DRY_RUN && IS_LIVE && !LIVE_DELETE_OK) {
  console.error(
    `❌ --delete em sk_live requer ALLOW_STRIPE_LIVE_DELETE=yes. Abort.\n` +
      `   Motivo: Stripe live Customer deletion é IRREVERSIBLE e ligada a billing history.`,
  );
  process.exit(1);
}

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
  orphans: Array<{ customerId: string; email: string; tenantIdMeta: string | null; reason: string; ageSeconds: number }>;
  danglingMetadata: Array<{ customerId: string; tenantIdMeta: string; tenantState: string }>;
  deleted: string[];
  skipped: string[];
  skippedByAge: string[];
  skippedAlreadyDeleted: string[];
  errors: Array<{ customerId: string; error: string }>;
  startedAt: string;
  finishedAt?: string;
  dryRun: boolean;
  confirmed: boolean;
  keyMode: string;
  operator: string;
  host: string;
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
): Promise<'orphan' | 'dangling' | 'healthy' | 'age-gated'> {
  const customerId = customer.id;
  const tenantIdMeta = (customer.metadata?.tenantId as string | undefined) ?? null;
  const ageSeconds = Math.floor(Date.now() / 1000) - (customer.created ?? 0);

  // F2.4.3.3 — 2.1: age-gate. Young Customers can still be in the Stripe Search
  // indexing lag while the DB row for their Tenant/BA is committing. Treat as
  // UNKNOWN and skip. Worst case: next weekly run catches truly orphaned ones.
  if (ageSeconds < AGE_GATE_SECONDS) {
    report.skippedByAge.push(customerId);
    return 'age-gated';
  }

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
      report.orphans.push({
        customerId,
        email: customer.email ?? '',
        tenantIdMeta,
        reason: 'tenant exists but no BA/Tenant column references this Customer',
        ageSeconds,
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
    ageSeconds,
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
    // F2.4.3.3 — 2.2: idempotent delete. If the Customer was already deleted
    // (previous run, concurrent ops, manual cleanup), Stripe returns 404 with
    // code='resource_missing'. That is a no-op success — classify as skipped.
    if (
      e instanceof Stripe.errors.StripeInvalidRequestError &&
      (e.code === 'resource_missing' || e.statusCode === 404)
    ) {
      report.skippedAlreadyDeleted.push(customerId);
      console.log(`  ↷ Already deleted Customer ${maskStripeId(customerId)} (idempotent no-op)`);
      return;
    }
    report.errors.push({ customerId, error: e instanceof Error ? e.message : String(e) });
  }
}

// F2.4.3.3 — 2.3: persist audit sidecar for forensics. File lives under
// ./logs/ with restrictive perms; gitignored. If ./logs doesn't exist, create
// it. On failure to write, log the error but don't crash — the run itself
// already succeeded (or not) by this point.
function writeAuditSidecar(report: SweepReport): string | null {
  try {
    const logsDir = join(process.cwd(), 'logs');
    if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true, mode: 0o700 });
    const filename = `stripe-sweep-${report.startedAt.replace(/[:.]/g, '-')}.json`;
    const path = join(logsDir, filename);
    writeFileSync(path, JSON.stringify(report, null, 2), { mode: 0o600 });
    return path;
  } catch (e) {
    console.error(
      `⚠ Failed to write audit sidecar: ${e instanceof Error ? e.message : String(e)}. Report is above in stdout.`,
    );
    return null;
  }
}

async function main() {
  const report: SweepReport = {
    totalKavenCustomers: 0,
    orphans: [],
    danglingMetadata: [],
    deleted: [],
    skipped: [],
    skippedByAge: [],
    skippedAlreadyDeleted: [],
    errors: [],
    startedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    confirmed: CONFIRMED,
    keyMode: KEY_MODE,
    operator: process.env.USER ?? process.env.USERNAME ?? 'unknown',
    host: hostname(),
  };

  console.log(
    `🧹 Stripe orphan sweep ${DRY_RUN ? '(DRY RUN)' : '(DESTRUCTIVE — will call stripe.customers.del)'}`,
  );
  console.log(`   key-mode: ${KEY_MODE} | operator: ${report.operator} | host: ${report.host}`);
  console.log(`   age-gate: ${AGE_GATE_SECONDS}s (customers younger than this are skipped)`);
  if (!DRY_RUN && !CONFIRMED) {
    console.error('❌ --delete passed but STRIPE_SWEEP_CONFIRM=yes not set. Aborting for safety.');
    process.exit(1);
  }

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
      } else if (verdict === 'age-gated') {
        // Quiet skip — these are expected during high-traffic periods. Report
        // counts them separately so operator can detect a pathological trend.
      }
    } catch (e) {
      report.errors.push({ customerId: customer.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  report.finishedAt = new Date().toISOString();

  console.log('\n📊 Report:');
  console.log(`   Kaven Customers encontrados:     ${report.totalKavenCustomers}`);
  console.log(`   Órfãos (candidatos a delete):    ${report.orphans.length}`);
  console.log(`   Dangling metadata (manual):      ${report.danglingMetadata.length}`);
  console.log(`   Deletados nesta execução:        ${report.deleted.length}`);
  console.log(`   Skipped (dry-run ou dangling):   ${report.skipped.length}`);
  console.log(`   Skipped by age (< ${AGE_GATE_SECONDS}s): ${report.skippedByAge.length}`);
  console.log(`   Skipped already-deleted (404):   ${report.skippedAlreadyDeleted.length}`);
  console.log(`   Erros:                            ${report.errors.length}`);

  const auditPath = writeAuditSidecar(report);
  if (auditPath) {
    console.log(`\n📝 Audit sidecar: ${auditPath}`);
  }

  // D3.2 — Emit structured audit event for observability.
  // TODO: F2.4.5 — emitir via AuditEvent (model Prisma) quando model estiver disponível.
  // Por ora: console.log JSON para captura pelo log aggregator do Cloud Run.
  const sweepAuditPayload = {
    event: 'stripe.sweep.completed',
    actor: 'job:stripe-orphan-sweep',
    dryRun: report.dryRun,
    confirmed: report.confirmed,
    keyMode: report.keyMode,
    totalKavenCustomers: report.totalKavenCustomers,
    deleted: report.deleted.length,
    orphans: report.orphans.map((o) => o.customerId),
    dangling: report.danglingMetadata.map((d) => d.customerId),
    skippedByAge: report.skippedByAge.length,
    skippedAlreadyDeleted: report.skippedAlreadyDeleted.length,
    errors: report.errors.map((e) => `${e.customerId}: ${e.error}`),
    startedAt: report.startedAt,
    finishedAt: report.finishedAt,
  };
  console.log(JSON.stringify(sweepAuditPayload));

  // D3.2 — Alert quando orphans >= 10 (severity: warning).
  // TODO: F2.4.5 — emitir via AuditEvent(type='stripe.sweep.alert') quando model estiver disponível.
  if (report.orphans.length >= 10) {
    const sweepAlertPayload = {
      event: 'stripe.sweep.alert',
      actor: 'job:stripe-orphan-sweep',
      severity: 'warning',
      message: `${report.orphans.length} Stripe orphan customers detected — review required`,
      orphans: report.orphans.map((o) => o.customerId),
    };
    console.log(JSON.stringify(sweepAlertPayload));
  }

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
