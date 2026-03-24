import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the People + HR module.
 *
 * Features added:
 *   PEOPLE_HR            (BOOLEAN) — Access to People+HR module
 *   HIRING_PIPELINE      (BOOLEAN) — Access to hiring/ATS features
 *   MAX_EMPLOYEES        (QUOTA)   — Maximum employees per tenant
 *   PERFORMANCE_REVIEWS  (BOOLEAN) — Access to performance review features
 *   TIME_TRACKING_HR     (BOOLEAN) — Access to HR time tracking features
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   PEOPLE_HR:           true / true / true
 *   MAX_EMPLOYEES:       10 / 100 / -1
 *   HIRING_PIPELINE:     false / true / true
 *   PERFORMANCE_REVIEWS: false / true / true
 *   TIME_TRACKING_HR:    false / false / true
 */
export async function seedPeopleFeatureFlags() {
  console.log('\n👥 Seeding People + HR Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'PEOPLE_HR',
      name: 'People & HR Module',
      description: 'Access to the People & HR management module',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'people',
      sortOrder: 600,
    },
    {
      code: 'MAX_EMPLOYEES',
      name: 'Maximum Employees',
      description: 'Maximum number of employees per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'employees',
      category: 'people',
      sortOrder: 601,
    },
    {
      code: 'HIRING_PIPELINE',
      name: 'Hiring Pipeline (ATS)',
      description: 'Access to hiring pipeline with job postings, applicant tracking, and interview stages',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'people',
      sortOrder: 602,
    },
    {
      code: 'PERFORMANCE_REVIEWS',
      name: 'Performance Reviews',
      description: 'Access to performance review cycles, 9-box, and 1:1 meetings',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'people',
      sortOrder: 603,
    },
    {
      code: 'TIME_TRACKING_HR',
      name: 'HR Time Tracking',
      description: 'Access to HR time tracking with clock-in/out, overtime, and approval workflows',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'people',
      sortOrder: 604,
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
      { featureCode: 'PEOPLE_HR', enabled: true, limitValue: null },
      { featureCode: 'MAX_EMPLOYEES', enabled: true, limitValue: 10 },
      { featureCode: 'HIRING_PIPELINE', enabled: false, limitValue: null },
      { featureCode: 'PERFORMANCE_REVIEWS', enabled: false, limitValue: null },
      { featureCode: 'TIME_TRACKING_HR', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'PEOPLE_HR', enabled: true, limitValue: null },
      { featureCode: 'MAX_EMPLOYEES', enabled: true, limitValue: 100 },
      { featureCode: 'HIRING_PIPELINE', enabled: true, limitValue: null },
      { featureCode: 'PERFORMANCE_REVIEWS', enabled: true, limitValue: null },
      { featureCode: 'TIME_TRACKING_HR', enabled: false, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'PEOPLE_HR', enabled: true, limitValue: null },
      { featureCode: 'MAX_EMPLOYEES', enabled: true, limitValue: -1 },
      { featureCode: 'HIRING_PIPELINE', enabled: true, limitValue: null },
      { featureCode: 'PERFORMANCE_REVIEWS', enabled: true, limitValue: null },
      { featureCode: 'TIME_TRACKING_HR', enabled: true, limitValue: null },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} people features assigned`);
  }

  console.log('✅ People + HR Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedPeopleFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding people feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
