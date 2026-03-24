import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed default Chart of Accounts tree for the Finance module.
 *
 * Creates a standard chart of accounts hierarchy:
 *   1. Revenue (services, products, other)
 *   2. Fixed Expenses (payroll, rent, software)
 *   3. Variable Expenses (marketing, supplies)
 *   4. Investments (equipment)
 *   5. Financial Movements (transfers)
 */
export async function seedFinance(tenantId: string) {
  console.log('\n💰 Seeding Finance Module...');

  // Default Chart of Accounts tree
  const accountTree = [
    {
      code: '1',
      name: 'Revenue',
      type: 'revenue',
      children: [
        { code: '1.1', name: 'Services Revenue', type: 'revenue' },
        { code: '1.2', name: 'Products Revenue', type: 'revenue' },
        { code: '1.3', name: 'Other Revenue', type: 'revenue' },
      ],
    },
    {
      code: '2',
      name: 'Fixed Expenses',
      type: 'fixed_expense',
      children: [
        { code: '2.1', name: 'Payroll', type: 'fixed_expense', subtype: 'recurring' },
        { code: '2.2', name: 'Rent', type: 'fixed_expense', subtype: 'recurring' },
        { code: '2.3', name: 'Software & Tools', type: 'fixed_expense', subtype: 'recurring' },
        { code: '2.4', name: 'Insurance', type: 'fixed_expense', subtype: 'recurring' },
        { code: '2.5', name: 'Accounting & Legal', type: 'fixed_expense', subtype: 'recurring' },
      ],
    },
    {
      code: '3',
      name: 'Variable Expenses',
      type: 'variable_expense',
      children: [
        { code: '3.1', name: 'Marketing & Advertising', type: 'variable_expense' },
        { code: '3.2', name: 'Supplies', type: 'variable_expense' },
        { code: '3.3', name: 'Travel & Meals', type: 'variable_expense' },
        { code: '3.4', name: 'Freelancers & Contractors', type: 'variable_expense' },
      ],
    },
    {
      code: '4',
      name: 'Investments',
      type: 'investment',
      children: [
        { code: '4.1', name: 'Equipment', type: 'investment' },
        { code: '4.2', name: 'Technology', type: 'investment' },
      ],
    },
    {
      code: '5',
      name: 'Financial Movements',
      type: 'financial_movement',
      children: [
        { code: '5.1', name: 'Transfers In', type: 'financial_movement' },
        { code: '5.2', name: 'Transfers Out', type: 'financial_movement' },
        { code: '5.3', name: 'Bank Fees', type: 'financial_movement' },
        { code: '5.4', name: 'Interest Income', type: 'financial_movement' },
      ],
    },
  ];

  for (const parent of accountTree) {
    const parentAccount = await prisma.chartOfAccount.upsert({
      where: {
        id: `coa-${tenantId}-${parent.code}`,
      },
      update: {},
      create: {
        id: `coa-${tenantId}-${parent.code}`,
        tenantId,
        code: parent.code,
        name: parent.name,
        type: parent.type,
        isSystem: true,
        sortOrder: parseInt(parent.code) * 100,
      },
    });

    for (const child of parent.children) {
      await prisma.chartOfAccount.upsert({
        where: {
          id: `coa-${tenantId}-${child.code}`,
        },
        update: {},
        create: {
          id: `coa-${tenantId}-${child.code}`,
          tenantId,
          parentId: parentAccount.id,
          code: child.code,
          name: child.name,
          type: child.type,
          subtype: (child as any).subtype || null,
          isSystem: true,
          sortOrder: Math.round(parseFloat(child.code) * 100),
        },
      });
    }

    console.log(`  ✅ Chart of Account: ${parent.name} (${parent.children.length} children)`);
  }

  // Seed default KPI definitions (global, tenantId = null)
  const kpis = [
    {
      slug: 'gross_margin',
      name: 'Gross Margin',
      description: 'Revenue minus variable costs divided by revenue',
      unit: 'percent',
      formula: '(revenue - variable_expense) / revenue',
      thresholdGood: 0.40,
      thresholdWarning: 0.20,
    },
    {
      slug: 'net_margin',
      name: 'Net Margin',
      description: 'Net result divided by total revenue',
      unit: 'percent',
      formula: 'net_result / revenue',
      thresholdGood: 0.15,
      thresholdWarning: 0.05,
    },
    {
      slug: 'runway_days',
      name: 'Runway (Days)',
      description: 'Cash balance divided by average daily expense',
      unit: 'days',
      formula: 'cash_balance / (monthly_expenses / 30)',
      thresholdGood: 180,
      thresholdWarning: 60,
    },
    {
      slug: 'expense_ratio',
      name: 'Expense Ratio',
      description: 'Total expenses divided by revenue',
      unit: 'percent',
      formula: '(fixed_expense + variable_expense) / revenue',
      thresholdGood: 0.70,
      thresholdWarning: 0.90,
    },
  ];

  for (const kpi of kpis) {
    await prisma.kPIDefinition.upsert({
      where: { id: `kpi-global-${kpi.slug}` },
      update: {},
      create: {
        id: `kpi-global-${kpi.slug}`,
        tenantId: null,
        slug: kpi.slug,
        name: kpi.name,
        description: kpi.description,
        unit: kpi.unit,
        formula: kpi.formula,
        thresholdGood: kpi.thresholdGood,
        thresholdWarning: kpi.thresholdWarning,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ KPI Definitions: ${kpis.length} global KPIs seeded`);

  console.log('✅ Finance Module seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  const tenantId = process.argv[2] || 'admin-tenant-id';
  seedFinance(tenantId)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding finance:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
