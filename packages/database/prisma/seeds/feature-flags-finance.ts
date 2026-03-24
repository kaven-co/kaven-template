import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Finance module.
 *
 * Features added:
 *   FINANCE        (BOOLEAN) — Access to finance module
 *   MAX_ENTRIES    (QUOTA)   — Maximum financial entries per month
 *   BUDGET         (BOOLEAN) — Access to budget features
 *   MULTI_CURRENCY (BOOLEAN) — Multi-currency support
 *   CREDIT_CARD    (BOOLEAN) — Credit card management
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   FINANCE:        true / true / true
 *   MAX_ENTRIES:    500 / -1 / -1
 *   BUDGET:         false / true / true
 *   MULTI_CURRENCY: false / false / true
 *   CREDIT_CARD:    false / true / true
 */
export async function seedFinanceFeatureFlags() {
  console.log('\n💰 Seeding Finance Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'FINANCE',
      name: 'Finance Module',
      description: 'Access to the Finance module for financial management',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'finance',
      sortOrder: 300,
    },
    {
      code: 'MAX_ENTRIES',
      name: 'Maximum Financial Entries',
      description: 'Maximum number of financial entries per month (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'entries',
      category: 'finance',
      sortOrder: 301,
    },
    {
      code: 'BUDGET',
      name: 'Budget Management',
      description: 'Access to budget creation, scenarios, and budget vs actual reports',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'finance',
      sortOrder: 302,
    },
    {
      code: 'MULTI_CURRENCY',
      name: 'Multi-Currency',
      description: 'Support for multiple currencies with exchange rates',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'finance',
      sortOrder: 303,
    },
    {
      code: 'CREDIT_CARD',
      name: 'Credit Card Management',
      description: 'Credit card statement lifecycle and payment tracking',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'finance',
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
      { featureCode: 'FINANCE', enabled: true, limitValue: null },
      { featureCode: 'MAX_ENTRIES', enabled: true, limitValue: 500 },
      { featureCode: 'BUDGET', enabled: false, limitValue: null },
      { featureCode: 'MULTI_CURRENCY', enabled: false, limitValue: null },
      { featureCode: 'CREDIT_CARD', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'FINANCE', enabled: true, limitValue: null },
      { featureCode: 'MAX_ENTRIES', enabled: true, limitValue: -1 },
      { featureCode: 'BUDGET', enabled: true, limitValue: null },
      { featureCode: 'MULTI_CURRENCY', enabled: false, limitValue: null },
      { featureCode: 'CREDIT_CARD', enabled: true, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'FINANCE', enabled: true, limitValue: null },
      { featureCode: 'MAX_ENTRIES', enabled: true, limitValue: -1 },
      { featureCode: 'BUDGET', enabled: true, limitValue: null },
      { featureCode: 'MULTI_CURRENCY', enabled: true, limitValue: null },
      { featureCode: 'CREDIT_CARD', enabled: true, limitValue: null },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} finance features assigned`);
  }

  console.log('✅ Finance Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedFinanceFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding finance feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
