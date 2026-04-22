import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Clients + CRM module.
 *
 * Features added:
 *   CLIENTS_CRM    (BOOLEAN) — Access to clients/CRM module
 *   MAX_CONTACTS   (QUOTA)   — Maximum contacts per tenant
 *   HEALTH_SCORE   (BOOLEAN) — Access to health score features
 *   SEGMENTS       (BOOLEAN) — Access to dynamic segments
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   CLIENTS_CRM:   true / true / true
 *   MAX_CONTACTS:   500 / 5000 / -1
 *   HEALTH_SCORE:  false / true / true
 *   SEGMENTS:      false / true / true
 */
export async function seedClientFeatureFlags() {
  console.log('\n👥 Seeding Clients + CRM Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'CLIENTS_CRM',
      name: 'Clients & CRM Module',
      description: 'Access to the Clients & CRM module for contact management',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'clients',
      sortOrder: 200,
    },
    {
      code: 'MAX_CONTACTS',
      name: 'Maximum Contacts',
      description: 'Maximum number of contacts per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'contacts',
      category: 'clients',
      sortOrder: 201,
    },
    {
      code: 'HEALTH_SCORE',
      name: 'Health Score',
      description: 'Access to client health score calculation and tracking',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'clients',
      sortOrder: 202,
    },
    {
      code: 'SEGMENTS',
      name: 'Dynamic Segments',
      description: 'Access to dynamic contact segmentation with query definitions',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'clients',
      sortOrder: 203,
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
      { featureCode: 'CLIENTS_CRM', enabled: true, limitValue: null },
      { featureCode: 'MAX_CONTACTS', enabled: true, limitValue: 500 },
      { featureCode: 'HEALTH_SCORE', enabled: false, limitValue: null },
      { featureCode: 'SEGMENTS', enabled: false, limitValue: null },
    ],
    pro: [
      { featureCode: 'CLIENTS_CRM', enabled: true, limitValue: null },
      { featureCode: 'MAX_CONTACTS', enabled: true, limitValue: 5000 },
      { featureCode: 'HEALTH_SCORE', enabled: true, limitValue: null },
      { featureCode: 'SEGMENTS', enabled: true, limitValue: null },
    ],
    enterprise: [
      { featureCode: 'CLIENTS_CRM', enabled: true, limitValue: null },
      { featureCode: 'MAX_CONTACTS', enabled: true, limitValue: -1 },
      { featureCode: 'HEALTH_SCORE', enabled: true, limitValue: null },
      { featureCode: 'SEGMENTS', enabled: true, limitValue: null },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} client features assigned`);
  }

  console.log('✅ Clients + CRM Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedClientFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding client feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
