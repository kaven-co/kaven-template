import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Case/Matter Management module.
 *
 * Features added:
 *   CASE_MANAGEMENT      (BOOLEAN) — Access to case management module
 *   CASE_TIME_TRACKING   (BOOLEAN) — Time tracking with timer
 *   CASE_TRUST_ACCOUNTS  (BOOLEAN) — Trust account management (IOLTA)
 *   MAX_CASES            (QUOTA)   — Maximum active cases per tenant
 *   MAX_CASE_MATTERS     (QUOTA)   — Maximum matters per case
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   CASE_MANAGEMENT:     false / true / true
 *   CASE_TIME_TRACKING:  false / true / true
 *   CASE_TRUST_ACCOUNTS: false / false / true
 *   MAX_CASES:           0 / 50 / -1
 *   MAX_CASE_MATTERS:    0 / 10 / -1
 */
export async function seedCaseMatterFeatureFlags() {
  console.log('\n⚖️ Seeding Case/Matter Management Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'CASE_MANAGEMENT',
      name: 'Case Management',
      description: 'Access to the Case/Matter Management module for law firms',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'case_matter',
      sortOrder: 300,
    },
    {
      code: 'CASE_TIME_TRACKING',
      name: 'Case Time Tracking',
      description: 'Time tracking with start/stop timer and manual entry for billing',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'case_matter',
      sortOrder: 301,
    },
    {
      code: 'CASE_TRUST_ACCOUNTS',
      name: 'Trust Account Management',
      description: 'Trust account (IOLTA) management with transaction tracking',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'case_matter',
      sortOrder: 302,
    },
    {
      code: 'MAX_CASES',
      name: 'Maximum Active Cases',
      description: 'Maximum number of active cases per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'cases',
      category: 'case_matter',
      sortOrder: 303,
    },
    {
      code: 'MAX_CASE_MATTERS',
      name: 'Maximum Matters per Case',
      description: 'Maximum number of matters per case (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'matters',
      category: 'case_matter',
      sortOrder: 304,
    },
  ];

  const featureMap: Record<string, string> = {};

  for (const def of featureDefs) {
    const feature = await prisma.feature.upsert({
      where: { code: def.code },
      update: {},
      create: {
        code: def.code,
        name: def.name,
        description: def.description,
        type: def.type,
        unit: def.unit,
        category: def.category,
        sortOrder: def.sortOrder,
      },
    });
    featureMap[def.code] = feature.id;
    console.log(`  ✅ Feature: ${def.code} (${def.type})`);
  }

  // -------------------------------------------------------
  // 2. Assign features to plans (free / pro / enterprise)
  // -------------------------------------------------------

  const planAssignments: Record<string, Array<{
    featureCode: string;
    enabled: boolean;
    limitValue: number | null;
  }>> = {
    free: [
      { featureCode: 'CASE_MANAGEMENT', enabled: false, limitValue: null },
      { featureCode: 'CASE_TIME_TRACKING', enabled: false, limitValue: null },
      { featureCode: 'CASE_TRUST_ACCOUNTS', enabled: false, limitValue: null },
      { featureCode: 'MAX_CASES', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_CASE_MATTERS', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'CASE_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'CASE_TIME_TRACKING', enabled: true, limitValue: null },
      { featureCode: 'CASE_TRUST_ACCOUNTS', enabled: false, limitValue: null },
      { featureCode: 'MAX_CASES', enabled: true, limitValue: 50 },
      { featureCode: 'MAX_CASE_MATTERS', enabled: true, limitValue: 10 },
    ],
    enterprise: [
      { featureCode: 'CASE_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'CASE_TIME_TRACKING', enabled: true, limitValue: null },
      { featureCode: 'CASE_TRUST_ACCOUNTS', enabled: true, limitValue: null },
      { featureCode: 'MAX_CASES', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_CASE_MATTERS', enabled: true, limitValue: -1 },
    ],
  };

  for (const [planCode, features] of Object.entries(planAssignments)) {
    const plan = await prisma.plan.findFirst({
      where: { code: planCode, tenantId: null },
    });

    if (!plan) {
      console.log(`  ⚠️ Plan "${planCode}" not found — skipping feature assignment`);
      continue;
    }

    for (const feat of features) {
      const featureId = featureMap[feat.featureCode];
      if (!featureId) continue;

      const existing = await prisma.planFeature.findUnique({
        where: { planId_featureId: { planId: plan.id, featureId } },
      });

      if (!existing) {
        await prisma.planFeature.create({
          data: {
            planId: plan.id,
            featureId,
            enabled: feat.enabled,
            limitValue: feat.limitValue,
          },
        });
      }
    }
    console.log(`  ✅ Plan "${planCode}": ${features.length} case/matter features assigned`);
  }

  console.log('✅ Case/Matter Management Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedCaseMatterFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding case/matter feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
