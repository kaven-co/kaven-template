import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Operations module (SOPs & Vendors).
 *
 * Features added:
 *   OPERATIONS     (BOOLEAN) — Access to operations module
 *   MAX_SOPS       (QUOTA)   — Maximum SOPs per tenant
 *   MAX_VENDORS    (QUOTA)   — Maximum vendors per tenant
 *   TOOL_REGISTRY  (BOOLEAN) — Access to tool registry
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   OPERATIONS:    true / true / true
 *   MAX_SOPS:      20 / 200 / -1
 *   MAX_VENDORS:   10 / 100 / -1
 *   TOOL_REGISTRY: false / true / true
 */
export async function seedOperationsFeatureFlags() {
  console.log('\n⚙️ Seeding Operations Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'OPERATIONS',
      name: 'Operations Module',
      description: 'Access to the Operations module for SOPs, vendors and tool registry',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'operations',
      sortOrder: 600,
    },
    {
      code: 'MAX_SOPS',
      name: 'Maximum SOPs',
      description: 'Maximum number of SOPs per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'sops',
      category: 'operations',
      sortOrder: 601,
    },
    {
      code: 'MAX_VENDORS',
      name: 'Maximum Vendors',
      description: 'Maximum number of vendors per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'vendors',
      category: 'operations',
      sortOrder: 602,
    },
    {
      code: 'TOOL_REGISTRY',
      name: 'Tool Registry',
      description: 'Access to the tool registry for tracking internal tools and ROI',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'operations',
      sortOrder: 603,
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
      { featureCode: 'OPERATIONS', enabled: true, limitValue: null },
      { featureCode: 'MAX_SOPS', enabled: true, limitValue: 20 },
      { featureCode: 'MAX_VENDORS', enabled: true, limitValue: 10 },
      { featureCode: 'TOOL_REGISTRY', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'OPERATIONS', enabled: true, limitValue: null },
      { featureCode: 'MAX_SOPS', enabled: true, limitValue: 200 },
      { featureCode: 'MAX_VENDORS', enabled: true, limitValue: 100 },
      { featureCode: 'TOOL_REGISTRY', enabled: true, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'OPERATIONS', enabled: true, limitValue: null },
      { featureCode: 'MAX_SOPS', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_VENDORS', enabled: true, limitValue: -1 },
      { featureCode: 'TOOL_REGISTRY', enabled: true, limitValue: null },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} operations features assigned`);
  }

  console.log('✅ Operations Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedOperationsFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding operations feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
