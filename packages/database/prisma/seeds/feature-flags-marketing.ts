import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Marketing module.
 *
 * Features added:
 *   MARKETING      (BOOLEAN) — Access to marketing module
 *   MAX_CAMPAIGNS  (QUOTA)   — Maximum campaigns per tenant
 *   LEAD_SCORING   (BOOLEAN) — Access to lead scoring engine
 *   AUTOMATIONS    (BOOLEAN) — Access to automation workflows
 *   AB_TESTING     (BOOLEAN) — Access to A/B testing
 *   FORMS          (QUOTA)   — Maximum lead capture forms
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   MARKETING:     true / true / true
 *   MAX_CAMPAIGNS: 3 / 50 / -1
 *   LEAD_SCORING:  false / false / true
 *   AUTOMATIONS:   false / true / true
 *   AB_TESTING:    false / false / true
 *   FORMS:         1 / 10 / -1
 */
export async function seedMarketingFeatureFlags() {
  console.log('\n📣 Seeding Marketing Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'MARKETING',
      name: 'Marketing Module',
      description: 'Access to the Marketing module for campaigns, forms and automation',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'marketing',
      sortOrder: 700,
    },
    {
      code: 'MAX_CAMPAIGNS',
      name: 'Maximum Campaigns',
      description: 'Maximum number of campaigns per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'campaigns',
      category: 'marketing',
      sortOrder: 701,
    },
    {
      code: 'LEAD_SCORING',
      name: 'Lead Scoring',
      description: 'Access to the lead scoring engine with 4-dimension scoring',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'marketing',
      sortOrder: 702,
    },
    {
      code: 'AUTOMATIONS',
      name: 'Marketing Automations',
      description: 'Access to marketing automation workflows',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'marketing',
      sortOrder: 703,
    },
    {
      code: 'AB_TESTING',
      name: 'A/B Testing',
      description: 'Access to campaign A/B testing with variant management',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'marketing',
      sortOrder: 704,
    },
    {
      code: 'FORMS',
      name: 'Lead Capture Forms',
      description: 'Maximum number of lead capture forms per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'forms',
      category: 'marketing',
      sortOrder: 705,
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
      { featureCode: 'MARKETING', enabled: true, limitValue: null },
      { featureCode: 'MAX_CAMPAIGNS', enabled: true, limitValue: 3 },
      { featureCode: 'LEAD_SCORING', enabled: false, limitValue: null },
      { featureCode: 'AUTOMATIONS', enabled: false, limitValue: null },
      { featureCode: 'AB_TESTING', enabled: false, limitValue: null },
      { featureCode: 'FORMS', enabled: true, limitValue: 1 },
    ],
    pro: [
      { featureCode: 'MARKETING', enabled: true, limitValue: null },
      { featureCode: 'MAX_CAMPAIGNS', enabled: true, limitValue: 50 },
      { featureCode: 'LEAD_SCORING', enabled: false, limitValue: null },
      { featureCode: 'AUTOMATIONS', enabled: true, limitValue: null },
      { featureCode: 'AB_TESTING', enabled: false, limitValue: null },
      { featureCode: 'FORMS', enabled: true, limitValue: 10 },
    ],
    enterprise: [
      { featureCode: 'MARKETING', enabled: true, limitValue: null },
      { featureCode: 'MAX_CAMPAIGNS', enabled: true, limitValue: -1 },
      { featureCode: 'LEAD_SCORING', enabled: true, limitValue: null },
      { featureCode: 'AUTOMATIONS', enabled: true, limitValue: null },
      { featureCode: 'AB_TESTING', enabled: true, limitValue: null },
      { featureCode: 'FORMS', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} marketing features assigned`);
  }

  console.log('✅ Marketing Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedMarketingFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding marketing feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
