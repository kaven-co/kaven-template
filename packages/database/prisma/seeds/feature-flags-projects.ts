import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Projects + PM module.
 *
 * Features added:
 *   PROJECTS_PM     (BOOLEAN) — Access to projects/PM module
 *   MAX_PROJECTS    (QUOTA)   — Maximum projects per tenant
 *   TIME_TRACKING   (BOOLEAN) — Access to time tracking features
 *   MILESTONES      (BOOLEAN) — Access to milestones + auto-invoicing
 *
 * Plan assignment (free / pro / enterprise — alinhado ao seed principal):
 *   PROJECTS_PM:    true / true / true
 *   MAX_PROJECTS:   1 / 3 / 10
 *   TIME_TRACKING:  false / true / true
 *   MILESTONES:     false / true / true
 */
export async function seedProjectFeatureFlags() {
  console.log('\n🏗️ Seeding Projects + PM Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'PROJECTS_PM',
      name: 'Projects & PM Module',
      description: 'Access to the Projects & Project Management module',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'projects',
      sortOrder: 300,
    },
    {
      code: 'MAX_PROJECTS',
      name: 'Maximum Projects',
      description: 'Maximum number of active projects per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'projects',
      category: 'projects',
      sortOrder: 301,
    },
    {
      code: 'TIME_TRACKING',
      name: 'Time Tracking',
      description: 'Access to time tracking with timer, billing rates, and reports',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'projects',
      sortOrder: 302,
    },
    {
      code: 'MILESTONES',
      name: 'Milestones & Auto-Invoicing',
      description: 'Access to milestone tracking with auto-invoice on completion',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'projects',
      sortOrder: 303,
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
      { featureCode: 'PROJECTS_PM', enabled: true, limitValue: null },
      { featureCode: 'MAX_PROJECTS', enabled: true, limitValue: 1 },
      { featureCode: 'TIME_TRACKING', enabled: false, limitValue: null },
      { featureCode: 'MILESTONES', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'PROJECTS_PM', enabled: true, limitValue: null },
      { featureCode: 'MAX_PROJECTS', enabled: true, limitValue: 3 },
      { featureCode: 'TIME_TRACKING', enabled: true, limitValue: null },
      { featureCode: 'MILESTONES', enabled: true, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'PROJECTS_PM', enabled: true, limitValue: null },
      { featureCode: 'MAX_PROJECTS', enabled: true, limitValue: 10 },
      { featureCode: 'TIME_TRACKING', enabled: true, limitValue: null },
      { featureCode: 'MILESTONES', enabled: true, limitValue: null },
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

      await prisma.planFeature.upsert({
        where: { planId_featureId: { planId: plan.id, featureId } },
        update: {
          enabled: feat.enabled,
          limitValue: feat.limitValue,
        },
        create: {
          planId: plan.id,
          featureId,
          enabled: feat.enabled,
          limitValue: feat.limitValue,
        },
      });
    }
    console.log(`  ✅ Plan "${planCode}": ${features.length} project features assigned`);
  }

  console.log('✅ Projects + PM Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedProjectFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding project feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
