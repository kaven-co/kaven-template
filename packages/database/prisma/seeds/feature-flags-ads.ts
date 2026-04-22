import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Ads Management module.
 *
 * Features added:
 *   ADS_MANAGEMENT      (BOOLEAN) — Access to ads module
 *   ADS_ATTRIBUTION     (BOOLEAN) — Attribution tracking
 *   ADS_RULES           (BOOLEAN) — Automated ad rules
 *   MAX_AD_ACCOUNTS     (QUOTA)   — Maximum ad accounts per tenant
 *   MAX_AD_CAMPAIGNS    (QUOTA)   — Maximum campaigns per tenant
 *   MAX_AD_CREATIVES    (QUOTA)   — Maximum creatives per tenant
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   ADS_MANAGEMENT:     false / true / true
 *   ADS_ATTRIBUTION:    false / true / true
 *   ADS_RULES:          false / false / true
 *   MAX_AD_ACCOUNTS:    0 / 5 / -1
 *   MAX_AD_CAMPAIGNS:   0 / 50 / -1
 *   MAX_AD_CREATIVES:   0 / 200 / -1
 */
export async function seedAdsFeatureFlags() {
  console.log('\n📢 Seeding Ads Management Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'ADS_MANAGEMENT',
      name: 'Ads Management',
      description: 'Access to the Ads Management module for managing advertising campaigns',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ads',
      sortOrder: 200,
    },
    {
      code: 'ADS_ATTRIBUTION',
      name: 'Attribution Tracking',
      description: 'Cross-platform attribution tracking for ad conversions',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ads',
      sortOrder: 201,
    },
    {
      code: 'ADS_RULES',
      name: 'Automated Ad Rules',
      description: 'Automated rules for pausing, enabling, and adjusting ad campaigns',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ads',
      sortOrder: 202,
    },
    {
      code: 'MAX_AD_ACCOUNTS',
      name: 'Maximum Ad Accounts',
      description: 'Maximum number of ad platform accounts per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'accounts',
      category: 'ads',
      sortOrder: 203,
    },
    {
      code: 'MAX_AD_CAMPAIGNS',
      name: 'Maximum Ad Campaigns',
      description: 'Maximum number of ad campaigns per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'campaigns',
      category: 'ads',
      sortOrder: 204,
    },
    {
      code: 'MAX_AD_CREATIVES',
      name: 'Maximum Ad Creatives',
      description: 'Maximum number of ad creatives per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'creatives',
      category: 'ads',
      sortOrder: 205,
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
      { featureCode: 'ADS_MANAGEMENT', enabled: false, limitValue: null },
      { featureCode: 'ADS_ATTRIBUTION', enabled: false, limitValue: null },
      { featureCode: 'ADS_RULES', enabled: false, limitValue: null },
      { featureCode: 'MAX_AD_ACCOUNTS', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_AD_CAMPAIGNS', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_AD_CREATIVES', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'ADS_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'ADS_ATTRIBUTION', enabled: true, limitValue: null },
      { featureCode: 'ADS_RULES', enabled: false, limitValue: null },
      { featureCode: 'MAX_AD_ACCOUNTS', enabled: true, limitValue: 5 },
      { featureCode: 'MAX_AD_CAMPAIGNS', enabled: true, limitValue: 50 },
      { featureCode: 'MAX_AD_CREATIVES', enabled: true, limitValue: 200 },
    ],
    enterprise: [
      { featureCode: 'ADS_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'ADS_ATTRIBUTION', enabled: true, limitValue: null },
      { featureCode: 'ADS_RULES', enabled: true, limitValue: null },
      { featureCode: 'MAX_AD_ACCOUNTS', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_AD_CAMPAIGNS', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_AD_CREATIVES', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} ads features assigned`);
  }

  console.log('✅ Ads Management Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedAdsFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding ads feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
