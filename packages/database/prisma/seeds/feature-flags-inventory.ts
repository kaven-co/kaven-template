import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Inventory & Fulfillment module.
 *
 * Features added:
 *   INVENTORY            (BOOLEAN) — Access to inventory module
 *   PURCHASE_ORDERS      (BOOLEAN) — Access to purchase order management
 *   MAX_WAREHOUSES       (QUOTA)   — Maximum warehouses per tenant
 *   MAX_STOCK_ITEMS      (QUOTA)   — Maximum stock items (SKUs) per tenant
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   INVENTORY:           false / true / true
 *   PURCHASE_ORDERS:     false / true / true
 *   MAX_WAREHOUSES:      0 / 5 / -1
 *   MAX_STOCK_ITEMS:     0 / 1000 / -1
 */
export async function seedInventoryFeatureFlags() {
  console.log('\n📦 Seeding Inventory & Fulfillment Feature Flags...');

  const featureDefs = [
    {
      code: 'INVENTORY',
      name: 'Inventory Module',
      description: 'Access to the Inventory & Fulfillment module for managing warehouses, stock items and orders',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'inventory',
      sortOrder: 210,
    },
    {
      code: 'PURCHASE_ORDERS',
      name: 'Purchase Orders',
      description: 'Access to purchase order management for replenishing inventory',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'inventory',
      sortOrder: 211,
    },
    {
      code: 'MAX_WAREHOUSES',
      name: 'Maximum Warehouses',
      description: 'Maximum number of warehouses per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'warehouses',
      category: 'inventory',
      sortOrder: 212,
    },
    {
      code: 'MAX_STOCK_ITEMS',
      name: 'Maximum Stock Items',
      description: 'Maximum number of stock items (SKUs) per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'items',
      category: 'inventory',
      sortOrder: 213,
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
      { featureCode: 'INVENTORY', enabled: false, limitValue: null },
      { featureCode: 'PURCHASE_ORDERS', enabled: false, limitValue: null },
      { featureCode: 'MAX_WAREHOUSES', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_STOCK_ITEMS', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'INVENTORY', enabled: true, limitValue: null },
      { featureCode: 'PURCHASE_ORDERS', enabled: true, limitValue: null },
      { featureCode: 'MAX_WAREHOUSES', enabled: true, limitValue: 5 },
      { featureCode: 'MAX_STOCK_ITEMS', enabled: true, limitValue: 1000 },
    ],
    enterprise: [
      { featureCode: 'INVENTORY', enabled: true, limitValue: null },
      { featureCode: 'PURCHASE_ORDERS', enabled: true, limitValue: null },
      { featureCode: 'MAX_WAREHOUSES', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_STOCK_ITEMS', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} inventory features assigned`);
  }

  console.log('✅ Inventory & Fulfillment Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedInventoryFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding inventory feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
