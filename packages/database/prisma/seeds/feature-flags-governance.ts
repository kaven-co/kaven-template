import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Governance module.
 *
 * Features added:
 *   GOVERNANCE         (BOOLEAN) — Access to governance module
 *   OKR               (BOOLEAN) — Access to OKR features
 *   MEETINGS           (BOOLEAN) — Access to meetings management
 *   BOARD_GOVERNANCE   (BOOLEAN) — Access to board governance features
 *   MAX_OBJECTIVES     (QUOTA)   — Maximum objectives per cycle
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   GOVERNANCE:       true / true / true
 *   OKR:              true / true / true
 *   MEETINGS:         false / true / true
 *   BOARD_GOVERNANCE: false / false / true
 *   MAX_OBJECTIVES:   5 / -1 / -1
 */
export async function seedGovernanceFeatureFlags() {
  console.log('\n🏛️ Seeding Governance Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'GOVERNANCE',
      name: 'Governance Module',
      description: 'Access to the Governance module (OKRs, meetings, decisions)',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'governance',
      sortOrder: 800,
    },
    {
      code: 'OKR',
      name: 'OKR Tracking',
      description: 'Access to OKR cycles, objectives, key results and check-ins',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'governance',
      sortOrder: 801,
    },
    {
      code: 'MEETINGS',
      name: 'Meetings Management',
      description: 'Access to meetings, agendas, decisions and action items',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'governance',
      sortOrder: 802,
    },
    {
      code: 'BOARD_GOVERNANCE',
      name: 'Board Governance',
      description: 'Access to board management, strategic pillars and mission statement',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'governance',
      sortOrder: 803,
    },
    {
      code: 'MAX_OBJECTIVES',
      name: 'Maximum Objectives',
      description: 'Maximum number of objectives per OKR cycle (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'objectives',
      category: 'governance',
      sortOrder: 804,
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
      { featureCode: 'GOVERNANCE', enabled: true, limitValue: null },
      { featureCode: 'OKR', enabled: true, limitValue: null },
      { featureCode: 'MEETINGS', enabled: false, limitValue: null },
      { featureCode: 'BOARD_GOVERNANCE', enabled: false, limitValue: null },
      { featureCode: 'MAX_OBJECTIVES', enabled: true, limitValue: 5 },
    ],
    pro: [
      { featureCode: 'GOVERNANCE', enabled: true, limitValue: null },
      { featureCode: 'OKR', enabled: true, limitValue: null },
      { featureCode: 'MEETINGS', enabled: true, limitValue: null },
      { featureCode: 'BOARD_GOVERNANCE', enabled: false, limitValue: null },
      { featureCode: 'MAX_OBJECTIVES', enabled: true, limitValue: -1 },
    ],
    enterprise: [
      { featureCode: 'GOVERNANCE', enabled: true, limitValue: null },
      { featureCode: 'OKR', enabled: true, limitValue: null },
      { featureCode: 'MEETINGS', enabled: true, limitValue: null },
      { featureCode: 'BOARD_GOVERNANCE', enabled: true, limitValue: null },
      { featureCode: 'MAX_OBJECTIVES', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} governance features assigned`);
  }

  console.log('✅ Governance Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedGovernanceFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding governance feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
