import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Property Management module.
 *
 * Features added:
 *   PROPERTY_MANAGEMENT (BOOLEAN) — Access to property management module
 *   MAX_PROPERTIES      (QUOTA)   — Maximum properties per tenant
 *   MAX_LEASES          (QUOTA)   — Maximum active leases per tenant
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   PROPERTY_MANAGEMENT: false / true / true
 *   MAX_PROPERTIES:      0 / 50 / -1
 *   MAX_LEASES:          0 / 100 / -1
 */
export async function seedPropertyManagementFeatureFlags() {
  console.log('\n🏠 Seeding Property Management Feature Flags...');

  const featureDefs = [
    {
      code: 'PROPERTY_MANAGEMENT',
      name: 'Property Management Module',
      description: 'Access to the Property Management module for managing properties, units, renters and leases',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'property_management',
      sortOrder: 200,
    },
    {
      code: 'MAX_PROPERTIES',
      name: 'Maximum Properties',
      description: 'Maximum number of properties per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'properties',
      category: 'property_management',
      sortOrder: 201,
    },
    {
      code: 'MAX_LEASES',
      name: 'Maximum Active Leases',
      description: 'Maximum number of active leases per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'leases',
      category: 'property_management',
      sortOrder: 202,
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

  const planAssignments: Record<string, Array<{
    featureCode: string;
    enabled: boolean;
    limitValue: number | null;
  }>> = {
    free: [
      { featureCode: 'PROPERTY_MANAGEMENT', enabled: false, limitValue: null },
      { featureCode: 'MAX_PROPERTIES', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_LEASES', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'PROPERTY_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'MAX_PROPERTIES', enabled: true, limitValue: 50 },
      { featureCode: 'MAX_LEASES', enabled: true, limitValue: 100 },
    ],
    enterprise: [
      { featureCode: 'PROPERTY_MANAGEMENT', enabled: true, limitValue: null },
      { featureCode: 'MAX_PROPERTIES', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_LEASES', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} property management features assigned`);
  }

  console.log('✅ Property Management Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedPropertyManagementFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding property management feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
