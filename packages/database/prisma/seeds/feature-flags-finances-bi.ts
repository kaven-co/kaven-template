import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Finances Tracking BI module.
 *
 * Features added:
 *   FINANCES_BI  (BOOLEAN) — Access to financial BI dashboards (DRE, cash flow, indicators)
 */
export async function seedFinancesBIFeatureFlags() {
  console.log('\n📊 Seeding Finances BI Feature Flags...');

  const featureDefs = [
    {
      code: 'FINANCES_BI',
      name: 'Finances BI Module',
      description: 'Access to financial BI dashboards — DRE, cash flow statements, KPI indicators',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'finances_bi',
      sortOrder: 240,
    },
  ];

  const featureMap: Record<string, string> = {};

  for (const def of featureDefs) {
    const feature = await prisma.feature.upsert({
      where: { code: def.code },
      update: {},
      create: {
        code: def.code, name: def.name, description: def.description,
        type: def.type, unit: def.unit, category: def.category, sortOrder: def.sortOrder,
      },
    });
    featureMap[def.code] = feature.id;
    console.log(`  ✅ Feature: ${def.code} (${def.type})`);
  }

  const planAssignments: Record<string, Array<{
    featureCode: string; enabled: boolean; limitValue: number | null;
  }>> = {
    free: [{ featureCode: 'FINANCES_BI', enabled: false, limitValue: null }],
    pro: [{ featureCode: 'FINANCES_BI', enabled: true, limitValue: null }],
    enterprise: [{ featureCode: 'FINANCES_BI', enabled: true, limitValue: null }],
  };

  for (const [planCode, features] of Object.entries(planAssignments)) {
    const plan = await prisma.plan.findFirst({ where: { code: planCode, tenantId: null } });
    if (!plan) { console.log(`  ⚠️ Plan "${planCode}" not found — skipping`); continue; }
    for (const feat of features) {
      const featureId = featureMap[feat.featureCode];
      if (!featureId) continue;
      const existing = await prisma.planFeature.findUnique({
        where: { planId_featureId: { planId: plan.id, featureId } },
      });
      if (!existing) {
        await prisma.planFeature.create({
          data: { planId: plan.id, featureId, enabled: feat.enabled, limitValue: feat.limitValue },
        });
      }
    }
    console.log(`  ✅ Plan "${planCode}": finances BI features assigned`);
  }

  console.log('✅ Finances BI Feature Flags seed complete.');
}

if (require.main === module) {
  seedFinancesBIFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
}
