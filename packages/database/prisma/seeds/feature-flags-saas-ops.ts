import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the SaaS Operations module.
 *
 * Features added:
 *   SAAS_OPS_MRR         (BOOLEAN) — MRR engine and revenue dashboards
 *   SAAS_OPS_CHURN       (BOOLEAN) — Churn tracking and dunning
 *   SAAS_OPS_COHORTS     (BOOLEAN) — Cohort retention analysis
 *   SAAS_OPS_HEALTH      (BOOLEAN) — Customer health scoring
 *   SAAS_OPS_EXPANSION   (BOOLEAN) — Expansion revenue tracking
 *   SAAS_OPS_FEATURE_ADOPTION (BOOLEAN) — Feature adoption tracking
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   SAAS_OPS_MRR:              false / true / true
 *   SAAS_OPS_CHURN:            false / true / true
 *   SAAS_OPS_COHORTS:          false / false / true
 *   SAAS_OPS_HEALTH:           false / false / true
 *   SAAS_OPS_EXPANSION:        false / true / true
 *   SAAS_OPS_FEATURE_ADOPTION: false / false / true
 */
export async function seedSaasOpsFeatureFlags() {
  console.log('\n📊 Seeding SaaS Operations Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'SAAS_OPS_MRR',
      name: 'MRR Engine',
      description: 'Monthly Recurring Revenue calculation engine with Stripe webhook integration',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 310,
    },
    {
      code: 'SAAS_OPS_CHURN',
      name: 'Churn Tracking',
      description: 'Churn event tracking with categorized reasons and dunning automation',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 311,
    },
    {
      code: 'SAAS_OPS_COHORTS',
      name: 'Cohort Analysis',
      description: 'Cohort retention analysis with NRR and GRR tracking',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 312,
    },
    {
      code: 'SAAS_OPS_HEALTH',
      name: 'Customer Health Score',
      description: 'Customer health scoring for churn prediction (0-100 score)',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 313,
    },
    {
      code: 'SAAS_OPS_EXPANSION',
      name: 'Expansion Revenue',
      description: 'Expansion/contraction revenue event tracking and analysis',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 314,
    },
    {
      code: 'SAAS_OPS_FEATURE_ADOPTION',
      name: 'Feature Adoption Tracking',
      description: 'Granular feature usage tracking per tenant for product analytics',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'saas_ops',
      sortOrder: 315,
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
      { featureCode: 'SAAS_OPS_MRR', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_CHURN', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_COHORTS', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_HEALTH', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_EXPANSION', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_FEATURE_ADOPTION', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'SAAS_OPS_MRR', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_CHURN', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_COHORTS', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_HEALTH', enabled: false, limitValue: null },
      { featureCode: 'SAAS_OPS_EXPANSION', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_FEATURE_ADOPTION', enabled: false, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'SAAS_OPS_MRR', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_CHURN', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_COHORTS', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_HEALTH', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_EXPANSION', enabled: true, limitValue: null },
      { featureCode: 'SAAS_OPS_FEATURE_ADOPTION', enabled: true, limitValue: null },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} SaaS ops features assigned`);
  }

  console.log('✅ SaaS Operations Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedSaasOpsFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding SaaS ops feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
