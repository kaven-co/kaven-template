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

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  billing_account_id: string | null;
  stripe_customer_id: string | null;
};

type AdminRow = { id: string; email: string };
type SubscriptionRow = { id: string; billing_account_id: string | null };

type BackfillResult = {
  tenantsProcessed: number;
  tenantsSkipped: number;
  subscriptionsLinked: number;
  subscriptionsSkipped: number;
  billingAccountsCreated: number;
  errors: Array<{ tenantId: string; reason: string }>;
};

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
  if (tenant.billing_account_id) {
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
      `  [DRY] Tenant ${tenant.slug} (${tenant.id}) → create BA owner=${admin.email} stripeCustomerId=${tenant.stripe_customer_id ?? '(none)'}`
    );
    result.tenantsProcessed++;
    result.billingAccountsCreated++;
    return;
  }

  // Transação: criar BA + atualizar Tenant + atualizar Subscriptions atomicamente.
  await prisma.$transaction(async (tx) => {
    const ba = await tx.billingAccount.create({
      data: {
        ownerUserId: admin.id,
        stripeCustomerId: tenant.stripe_customer_id,
        name: tenant.name,
      },
    });

    await tx.$executeRaw`
      UPDATE "Tenant"
      SET "billing_account_id" = ${ba.id}
      WHERE id = ${tenant.id}
    `;

    // Subscriptions deste tenant que ainda não têm billing_account_id.
    const subscriptions = await tx.$queryRaw<SubscriptionRow[]>`
      SELECT id, billing_account_id
      FROM subscriptions
      WHERE tenant_id = ${tenant.id}
        AND billing_account_id IS NULL
    `;

    for (const sub of subscriptions) {
      await tx.$executeRaw`
        UPDATE subscriptions
        SET billing_account_id = ${ba.id}
        WHERE id = ${sub.id}
      `;
      result.subscriptionsLinked++;
    }

    result.billingAccountsCreated++;
    result.tenantsProcessed++;

    console.log(
      `  ✓ Tenant ${tenant.slug} → BA ${ba.id} (owner=${admin.email}, ${subscriptions.length} subs)`
    );
  });
}

async function validatePostBackfill(): Promise<void> {
  const [orphanTenants, orphanSubs] = await Promise.all([
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
  ]);

  const orphanTenantsCount = Number(orphanTenants[0].count);
  const orphanSubsCount = Number(orphanSubs[0].count);

  console.log('\n📋 Pós-backfill validation:');
  console.log(`   Tenants ativos sem BA: ${orphanTenantsCount}`);
  console.log(`   Subscriptions ativas sem BA: ${orphanSubsCount}`);

  if (orphanTenantsCount > 0 || orphanSubsCount > 0) {
    console.error('\n❌ VALIDATION FAILED: backfill deixou tenants/subscriptions órfãos.');
    process.exit(1);
  }
}

async function main() {
  console.log(`🔧 F2.4.2 Backfill ${DRY_RUN ? '(DRY RUN)' : ''}— start`);

  const tenants = await prisma.$queryRaw<TenantRow[]>`
    SELECT id, name, slug, billing_account_id, stripe_customer_id
    FROM "Tenant"
    WHERE "deletedAt" IS NULL
    ORDER BY "createdAt" ASC
  `;

  console.log(`📊 Tenants ativos encontrados: ${tenants.length}`);

  const result: BackfillResult = {
    tenantsProcessed: 0,
    tenantsSkipped: 0,
    subscriptionsLinked: 0,
    subscriptionsSkipped: 0,
    billingAccountsCreated: 0,
    errors: [],
  };

  for (const tenant of tenants) {
    try {
      await backfillTenant(tenant, result);
    } catch (e) {
      result.errors.push({
        tenantId: tenant.id,
        reason: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.log('\n📊 Resultado:');
  console.log(`   Tenants processados: ${result.tenantsProcessed}`);
  console.log(`   Tenants skipped (já tinham BA): ${result.tenantsSkipped}`);
  console.log(`   BillingAccounts criadas: ${result.billingAccountsCreated}`);
  console.log(`   Subscriptions ligadas: ${result.subscriptionsLinked}`);
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
