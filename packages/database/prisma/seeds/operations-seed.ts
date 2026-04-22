import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed sample data for the Operations module.
 * Creates sample SOPs, vendors, and tool registry items for the admin tenant.
 */
export async function seedOperations(tenantId: string, userId: string) {
  console.log('\n⚙️ Seeding Operations module data...');

  // -------------------------------------------------------
  // 1. Sample SOPs
  // -------------------------------------------------------

  const sop1 = await prisma.sOP.upsert({
    where: { tenantId_slug_version: { tenantId, slug: 'employee-onboarding', version: '1.0' } },
    update: {},
    create: {
      tenantId,
      title: 'Employee Onboarding',
      slug: 'employee-onboarding',
      description: 'Standard operating procedure for onboarding new employees',
      category: 'HR',
      department: 'people',
      version: '1.0',
      ownerId: userId,
      status: 'ACTIVE',
      publishedAt: new Date(),
      estimatedMinutes: 120,
      tags: ['onboarding', 'hr', 'new-hire'],
      createdBy: userId,
      steps: {
        create: [
          {
            order: 1,
            title: 'Prepare workstation',
            instructions: 'Set up computer, email, and access credentials for the new employee.',
            estimatedMinutes: 30,
          },
          {
            order: 2,
            title: 'Send welcome email',
            instructions: 'Send the welcome email template with first-day instructions.',
            estimatedMinutes: 10,
          },
          {
            order: 3,
            title: 'Schedule orientation meetings',
            instructions: 'Book meetings with team lead, HR, and key stakeholders for the first week.',
            estimatedMinutes: 15,
          },
          {
            order: 4,
            title: 'Complete documentation',
            instructions: 'Ensure all employment contracts, NDAs, and tax forms are signed.',
            estimatedMinutes: 45,
          },
        ],
      },
    },
  });
  console.log(`  ✅ SOP: ${sop1.title}`);

  const sop2 = await prisma.sOP.upsert({
    where: { tenantId_slug_version: { tenantId, slug: 'vendor-evaluation', version: '1.0' } },
    update: {},
    create: {
      tenantId,
      title: 'Vendor Evaluation Process',
      slug: 'vendor-evaluation',
      description: 'Standard process for evaluating and approving new vendors',
      category: 'OPERATIONAL',
      department: 'operations',
      version: '1.0',
      ownerId: userId,
      status: 'ACTIVE',
      publishedAt: new Date(),
      estimatedMinutes: 240,
      tags: ['vendor', 'procurement', 'evaluation'],
      createdBy: userId,
      steps: {
        create: [
          {
            order: 1,
            title: 'Collect vendor information',
            instructions: 'Request and review vendor company profile, certifications, and references.',
            estimatedMinutes: 60,
          },
          {
            order: 2,
            title: 'Financial assessment',
            instructions: 'Review pricing proposal, payment terms, and compare with market benchmarks.',
            estimatedMinutes: 90,
          },
          {
            order: 3,
            title: 'Security and compliance check',
            instructions: 'Verify vendor compliance with data protection policies and security standards.',
            estimatedMinutes: 60,
          },
          {
            order: 4,
            title: 'Final approval',
            instructions: 'Present findings to stakeholders and obtain approval decision.',
            estimatedMinutes: 30,
          },
        ],
      },
    },
  });
  console.log(`  ✅ SOP: ${sop2.title}`);

  // -------------------------------------------------------
  // 2. Sample Vendors
  // -------------------------------------------------------

  const vendor1 = await prisma.vendor.upsert({
    where: { tenantId_taxId: { tenantId, taxId: '12345678000100' } },
    update: {},
    create: {
      tenantId,
      name: 'CloudTech Solutions',
      legalName: 'CloudTech Solutions Ltda',
      taxId: '12345678000100',
      website: 'https://cloudtech.example.com',
      category: 'TECHNOLOGY',
      status: 'ACTIVE',
      tier: 'STRATEGIC',
      onboardedAt: new Date('2025-06-01'),
      primaryContactName: 'Maria Silva',
      primaryContactEmail: 'maria@cloudtech.example.com',
      primaryContactPhone: '+55 11 99999-0001',
      paymentTermsDays: 30,
      currency: 'BRL',
      scoreOverall: 8.5,
      scoreQuality: 9.0,
      scorePontuality: 8.0,
      scoreCost: 8.0,
      scoreSupport: 9.0,
      lastScoredAt: new Date(),
      tags: ['cloud', 'infrastructure', 'strategic'],
      createdBy: userId,
    },
  });
  console.log(`  ✅ Vendor: ${vendor1.name}`);

  const vendor2 = await prisma.vendor.upsert({
    where: { tenantId_taxId: { tenantId, taxId: '98765432000100' } },
    update: {},
    create: {
      tenantId,
      name: 'DesignPro Agency',
      legalName: 'DesignPro Comunicacao Visual Ltda',
      taxId: '98765432000100',
      website: 'https://designpro.example.com',
      category: 'MARKETING',
      status: 'ACTIVE',
      tier: 'PREFERRED',
      onboardedAt: new Date('2025-09-15'),
      primaryContactName: 'Carlos Mendes',
      primaryContactEmail: 'carlos@designpro.example.com',
      paymentTermsDays: 15,
      currency: 'BRL',
      tags: ['design', 'marketing', 'creative'],
      createdBy: userId,
    },
  });
  console.log(`  ✅ Vendor: ${vendor2.name}`);

  // -------------------------------------------------------
  // 3. Sample Contracts
  // -------------------------------------------------------

  await prisma.vendorContract.create({
    data: {
      tenantId,
      vendorId: vendor1.id,
      title: 'Cloud Infrastructure Services',
      contractNumber: 'CT-2025-001',
      contractType: 'RECURRING',
      currency: 'BRL',
      monthlyValue: 4500.00,
      paymentFrequency: 'MONTHLY',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-06-01'),
      autoRenew: true,
      renewalNoticeDays: 60,
      status: 'ACTIVE',
      slaDescription: '99.9% uptime guarantee, 4h response time for critical issues',
      createdBy: userId,
    },
  });
  console.log('  ✅ Contract: Cloud Infrastructure Services');

  // -------------------------------------------------------
  // 4. Sample Tool Registry Items
  // -------------------------------------------------------

  await prisma.toolRegistryItem.upsert({
    where: { tenantId_name: { tenantId, name: 'Slack' } },
    update: {},
    create: {
      tenantId,
      name: 'Slack',
      vendorName: 'Salesforce',
      category: 'COMMUNICATION',
      website: 'https://slack.com',
      description: 'Team communication and collaboration platform',
      billingType: 'MONTHLY',
      currency: 'USD',
      costPerMonth: 12.50,
      seats: 25,
      costPerSeat: 12.50,
      ownerId: userId,
      department: 'engineering',
      activeUsers: 22,
      totalSeats: 25,
      status: 'ACTIVE',
      autoRenew: true,
      tags: ['communication', 'collaboration'],
      createdBy: userId,
    },
  });
  console.log('  ✅ Tool: Slack');

  await prisma.toolRegistryItem.upsert({
    where: { tenantId_name: { tenantId, name: 'Figma' } },
    update: {},
    create: {
      tenantId,
      name: 'Figma',
      vendorName: 'Figma Inc.',
      category: 'DESIGN',
      website: 'https://figma.com',
      description: 'Collaborative design and prototyping tool',
      billingType: 'ANNUAL',
      currency: 'USD',
      costPerMonth: 15.00,
      seats: 5,
      costPerSeat: 15.00,
      ownerId: userId,
      department: 'design',
      activeUsers: 4,
      totalSeats: 5,
      status: 'ACTIVE',
      autoRenew: true,
      tags: ['design', 'prototyping', 'collaboration'],
      createdBy: userId,
    },
  });
  console.log('  ✅ Tool: Figma');

  console.log('✅ Operations module seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  const tenantId = process.argv[2];
  const userId = process.argv[3];
  if (!tenantId || !userId) {
    console.error('Usage: ts-node operations-seed.ts <tenantId> <userId>');
    process.exit(1);
  }
  seedOperations(tenantId, userId)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding operations:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
