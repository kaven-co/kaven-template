/**
 * F2.4 Pre-Migration Audit (Story F2.4.0 — GATE antes de F2.4.1).
 *
 * Script READ-ONLY que roda contra o banco de dados e detecta anomalias
 * que bloqueariam a migração para o modelo Multi-Workspace Ownership.
 *
 * Anomalias detectadas:
 *   1. Tenants sem nenhum usuário com role TENANT_ADMIN — bloqueia backfill
 *      porque não há candidato a `ownerUserId` da BillingAccount.
 *   2. Subscriptions órfãs (tenantId apontando para tenant inexistente).
 *   3. Stripe Customer IDs duplicados entre tenants.
 *   4. Tenants soft-deleted (deletedAt NOT NULL) com Subscription ACTIVE.
 *   5. Tenants sem nenhum usuário (edge case raro, mas possível).
 *
 * Output: docs/migrations/f2-4-audit-{YYYY-MM-DD}.md
 *
 * Uso:
 *   pnpm --filter @kaven/database f2-4:audit
 *
 * NÃO modifica nenhum dado. Pode ser executado em produção com segurança.
 *
 * IMPORTANTE (naming drift): No schema atual:
 *   - `Tenant` e `User` NÃO têm @@map() → nome de tabela PascalCase.
 *   - `subscriptions` e `features` TÊM @@map() → nome snake_case.
 *   As queries abaixo respeitam essa inconsistência.
 */

import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const prisma = new PrismaClient();

type Finding = {
  severity: 'blocker' | 'warning' | 'info';
  category: string;
  description: string;
  details: Array<Record<string, unknown>>;
};

async function auditTenantsWithoutAdmin(): Promise<Finding> {
  const tenants = await prisma.$queryRaw<Array<{ id: string; name: string; slug: string }>>`
    SELECT t.id, t.name, t.slug
    FROM "Tenant" t
    WHERE t."deletedAt" IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM "User" u
        WHERE u."tenantId" = t.id
          AND u.role = 'TENANT_ADMIN'
          AND u."deletedAt" IS NULL
      )
  `;

  return {
    severity: 'blocker',
    category: 'Tenants without TENANT_ADMIN',
    description:
      'Tenants não-deletados sem nenhum usuário ativo com role TENANT_ADMIN. ' +
      'Backfill F2.4.2 não tem como escolher ownerUserId para a BillingAccount. ' +
      'Owner deve atribuir TENANT_ADMIN manualmente antes de prosseguir.',
    details: tenants,
  };
}

async function auditOrphanSubscriptions(): Promise<Finding> {
  const orphans = await prisma.$queryRaw<
    Array<{ id: string; tenant_id: string; status: string }>
  >`
    SELECT s.id, s.tenant_id, s.status
    FROM subscriptions s
    WHERE NOT EXISTS (
      SELECT 1 FROM "Tenant" t WHERE t.id = s.tenant_id
    )
  `;

  return {
    severity: 'blocker',
    category: 'Orphan Subscriptions',
    description:
      'Subscriptions apontando para tenantId que não existe (data corruption). ' +
      'Deve ser investigado e corrigido antes da migração.',
    details: orphans,
  };
}

async function auditDuplicateStripeCustomers(): Promise<Finding> {
  // Tenant.stripeCustomerId — leitura via raw SQL porque o campo tem histórico
  // de drift no schema (PR #114 restaurou). Coluna pode ou não existir ainda.
  try {
    const duplicates = await prisma.$queryRaw<
      Array<{ stripe_customer_id: string; count: bigint; tenant_ids: string[] }>
    >`
      SELECT
        stripe_customer_id,
        COUNT(*) as count,
        ARRAY_AGG(id) as tenant_ids
      FROM "Tenant"
      WHERE stripe_customer_id IS NOT NULL
        AND "deletedAt" IS NULL
      GROUP BY stripe_customer_id
      HAVING COUNT(*) > 1
    `;

    return {
      severity: 'blocker',
      category: 'Duplicate Stripe Customer IDs',
      description:
        'Mesmo stripe_customer_id em múltiplos tenants ativos. Backfill criaria ' +
        'múltiplas BillingAccounts competindo pelo mesmo Customer Stripe — precisa ' +
        'consolidação manual antes de prosseguir.',
      details: duplicates.map((d) => ({
        stripeCustomerId: d.stripe_customer_id,
        count: Number(d.count),
        tenantIds: d.tenant_ids,
      })),
    };
  } catch (e) {
    return {
      severity: 'warning',
      category: 'Duplicate Stripe Customer IDs (check skipped)',
      description:
        'Coluna Tenant.stripe_customer_id não existe ou não é acessível. ' +
        'Isso é esperado em ambientes pré-PR #114 ou DBs frescos. Re-rodar após ' +
        'migração 20260411000000_add_tenant_stripe_customer_id.',
      details: [{ error: String(e instanceof Error ? e.message : e) }],
    };
  }
}

async function auditSoftDeletedWithActiveSubscription(): Promise<Finding> {
  const anomalies = await prisma.$queryRaw<
    Array<{ tenant_id: string; tenant_name: string; subscription_id: string; status: string }>
  >`
    SELECT
      t.id as tenant_id,
      t.name as tenant_name,
      s.id as subscription_id,
      s.status
    FROM "Tenant" t
    INNER JOIN subscriptions s ON s.tenant_id = t.id
    WHERE t."deletedAt" IS NOT NULL
      AND s.status IN ('ACTIVE', 'TRIALING')
  `;

  return {
    severity: 'warning',
    category: 'Soft-deleted tenants with ACTIVE subscription',
    description:
      'Tenants marcados como deletados mas com subscription ainda cobrando. ' +
      'Não bloqueia migração, mas indica possível billing leak — revisar e cancelar.',
    details: anomalies,
  };
}

async function auditTenantsWithoutUsers(): Promise<Finding> {
  const tenants = await prisma.$queryRaw<Array<{ id: string; name: string; slug: string }>>`
    SELECT t.id, t.name, t.slug
    FROM "Tenant" t
    WHERE t."deletedAt" IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM "User" u
        WHERE u."tenantId" = t.id
          AND u."deletedAt" IS NULL
      )
  `;

  return {
    severity: 'warning',
    category: 'Tenants without any users',
    description:
      'Tenants ativos sem nenhum usuário (deletados ou não). Pode indicar tenant ' +
      'abandonado pós-trial. Não bloqueia migração (será pulado no backfill), mas ' +
      'vale auditoria separada.',
    details: tenants,
  };
}

async function collectMetrics() {
  const [tenantsActive, tenantsDeleted, subscriptions, features, users] =
    await Promise.all([
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "Tenant" WHERE "deletedAt" IS NULL`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "Tenant" WHERE "deletedAt" IS NOT NULL`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM subscriptions`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM features`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "User" WHERE "deletedAt" IS NULL`,
    ]);

  return {
    tenantsActive: Number(tenantsActive[0].count),
    tenantsDeleted: Number(tenantsDeleted[0].count),
    subscriptions: Number(subscriptions[0].count),
    features: Number(features[0].count),
    activeUsers: Number(users[0].count),
  };
}

function renderReport(findings: Finding[], metrics: Record<string, number>): string {
  const date = new Date().toISOString().split('T')[0];
  const blockers = findings.filter((f) => f.severity === 'blocker');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const totalIssues = findings.reduce((acc, f) => acc + f.details.length, 0);
  const blockerIssues = blockers.reduce((acc, f) => acc + f.details.length, 0);

  const verdict =
    blockerIssues === 0
      ? '✅ **APROVADO PARA F2.4.1** — nenhum blocker detectado.'
      : `🚫 **BLOQUEADO** — ${blockerIssues} issue(s) crítica(s) encontrada(s). ` +
        `Resolver antes de rodar F2.4.1.`;

  const lines: string[] = [
    `# F2.4 Pre-Migration Audit Report`,
    ``,
    `**Data:** ${date}`,
    `**Script:** \`packages/database/scripts/f2-4-pre-migration-audit.ts\``,
    `**Story:** F2.4.0 (gate para F2.4.1)`,
    ``,
    `## Veredito`,
    ``,
    verdict,
    ``,
    `## Métricas do banco`,
    ``,
    `| Métrica | Valor |`,
    `|---|---|`,
    `| Tenants ativos | ${metrics.tenantsActive} |`,
    `| Tenants soft-deleted | ${metrics.tenantsDeleted} |`,
    `| Subscriptions (todas) | ${metrics.subscriptions} |`,
    `| Features cadastradas | ${metrics.features} |`,
    `| Usuários ativos | ${metrics.activeUsers} |`,
    ``,
    `## Resumo de issues`,
    ``,
    `| Categoria | Severidade | Ocorrências |`,
    `|---|---|---|`,
  ];

  for (const f of findings) {
    const icon = f.severity === 'blocker' ? '🚫' : f.severity === 'warning' ? '⚠️' : 'ℹ️';
    lines.push(`| ${f.category} | ${icon} ${f.severity} | ${f.details.length} |`);
  }

  lines.push('', `**Total de ocorrências:** ${totalIssues}`, '');

  if (blockers.length > 0) {
    lines.push(`## 🚫 Blockers (resolver antes de F2.4.1)`, ``);
    for (const f of blockers) {
      lines.push(`### ${f.category}`, ``, f.description, ``);
      if (f.details.length === 0) {
        lines.push(`✅ Nenhuma ocorrência.`, ``);
      } else {
        lines.push('```json', JSON.stringify(f.details, null, 2), '```', ``);
      }
    }
  }

  if (warnings.length > 0) {
    lines.push(`## ⚠️ Warnings (revisar, mas não bloqueia)`, ``);
    for (const f of warnings) {
      lines.push(`### ${f.category}`, ``, f.description, ``);
      if (f.details.length === 0) {
        lines.push(`✅ Nenhuma ocorrência.`, ``);
      } else {
        lines.push('```json', JSON.stringify(f.details, null, 2), '```', ``);
      }
    }
  }

  lines.push(
    `## Próximo passo`,
    ``,
    blockerIssues === 0
      ? `- [x] Audit passou. @dev pode prosseguir com **F2.4.1 (Schema phase 1)**.`
      : `- [ ] Owner corrige blockers listados acima.\n- [ ] Re-rodar \`pnpm --filter @kaven/database f2-4:audit\`.\n- [ ] Só prosseguir para F2.4.1 quando este relatório vier "APROVADO".`,
    ``,
    `---`,
    ``,
    `_Gerado automaticamente por \`f2-4-pre-migration-audit.ts\`._`
  );

  return lines.join('\n');
}

async function main() {
  console.log('🔍 F2.4 Pre-Migration Audit — start');

  const findings = await Promise.all([
    auditTenantsWithoutAdmin(),
    auditOrphanSubscriptions(),
    auditDuplicateStripeCustomers(),
    auditSoftDeletedWithActiveSubscription(),
    auditTenantsWithoutUsers(),
  ]);

  const metrics = await collectMetrics();

  const totalIssues = findings.reduce((acc, f) => acc + f.details.length, 0);
  const blockers = findings.filter((f) => f.severity === 'blocker');
  const blockerCount = blockers.reduce((acc, f) => acc + f.details.length, 0);

  for (const f of findings) {
    const icon =
      f.severity === 'blocker' ? '🚫' : f.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`  ${icon} [${f.severity}] ${f.category}: ${f.details.length} issue(s)`);
  }

  console.log(`\n📊 Métricas:`, metrics);
  console.log(`\n🎯 Total: ${totalIssues} issue(s) | Blockers: ${blockerCount}`);

  const date = new Date().toISOString().split('T')[0];
  const outputPath = join(
    __dirname,
    '..',
    '..',
    '..',
    'docs',
    'migrations',
    `f2-4-audit-${date}.md`
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, renderReport(findings, metrics), 'utf-8');

  console.log(`\n📄 Report gerado em: ${outputPath}`);

  if (blockerCount > 0) {
    console.log(`\n🚫 BLOQUEADO — ${blockerCount} blocker(s). Veja report acima.`);
    process.exit(1);
  }

  console.log(`\n✅ APROVADO — nenhum blocker. F2.4.1 pode prosseguir.`);
}

main()
  .catch((e) => {
    console.error('❌ Audit falhou:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
