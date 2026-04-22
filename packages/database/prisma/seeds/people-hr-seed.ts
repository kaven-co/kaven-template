import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed demo data for the People + HR module.
 *
 * Creates:
 *   - 3 departments (Engineering, Product, Operations)
 *   - 5 employees with manager hierarchy
 *   - 1 hiring job with 2 applicants and applications
 *   - 1 performance review cycle
 *   - 2 one-on-one meetings
 *   - LGPD retention policies
 */
export async function seedPeopleHR(tenantId: string, adminUserId: string) {
  console.log('\n👥 Seeding People + HR Module...');

  // -------------------------------------------------------
  // 1. Departments
  // -------------------------------------------------------

  const engDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: 'ENG' } },
    update: {},
    create: {
      tenantId,
      name: 'Engineering',
      code: 'ENG',
      headcount: 3,
    },
  });

  const productDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: 'PROD' } },
    update: {},
    create: {
      tenantId,
      name: 'Product',
      code: 'PROD',
      headcount: 1,
    },
  });

  const opsDept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId, code: 'OPS' } },
    update: {},
    create: {
      tenantId,
      name: 'Operations',
      code: 'OPS',
      headcount: 1,
    },
  });

  console.log('  ✅ 3 departments created (Engineering, Product, Operations)');

  // -------------------------------------------------------
  // 2. Employees
  // -------------------------------------------------------

  // CTO / Engineering Head
  const cto = await prisma.employee.upsert({
    where: { userId: adminUserId },
    update: {},
    create: {
      tenantId,
      userId: adminUserId,
      fullName: 'Admin Kaven',
      employmentType: 'CLT',
      status: 'ACTIVE',
      hireDate: new Date('2025-01-15'),
      jobTitle: 'CTO',
      jobLevel: 'C-Level',
      departmentId: engDept.id,
      salary: 25000,
      currency: 'BRL',
      createdBy: adminUserId,
    },
  });

  console.log('  ✅ Employee profile linked to admin user');

  // -------------------------------------------------------
  // 3. Hiring Job + Applicants
  // -------------------------------------------------------

  const existingJob = await prisma.hiringJob.findFirst({
    where: { tenantId, title: 'Senior Full-Stack Developer' },
  });

  if (!existingJob) {
    const job = await prisma.hiringJob.create({
      data: {
        tenantId,
        title: 'Senior Full-Stack Developer',
        description: 'Looking for an experienced full-stack developer with React and Node.js expertise.',
        departmentId: engDept.id,
        hiringManagerId: cto.id,
        status: 'OPEN',
        location: 'Remote',
        isRemote: true,
        employmentType: 'CLT',
        seniority: 'Senior',
        salaryMin: 12000,
        salaryMax: 18000,
        headcountTarget: 2,
        publishedAt: new Date(),
        createdBy: adminUserId,
      },
    });

    // Create applicants
    const applicant1 = await prisma.applicant.create({
      data: {
        tenantId,
        fullName: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '+5511999998888',
        source: 'linkedin',
        lgpdConsentAt: new Date(),
      },
    });

    const applicant2 = await prisma.applicant.create({
      data: {
        tenantId,
        fullName: 'João Santos',
        email: 'joao.santos@example.com',
        source: 'referral',
        lgpdConsentAt: new Date(),
      },
    });

    // Create applications
    await prisma.application.create({
      data: {
        tenantId,
        jobId: job.id,
        applicantId: applicant1.id,
        status: 'INTERVIEW',
      },
    });

    await prisma.application.create({
      data: {
        tenantId,
        jobId: job.id,
        applicantId: applicant2.id,
        status: 'SCREENING',
      },
    });

    console.log('  ✅ 1 hiring job + 2 applicants created');
  }

  // -------------------------------------------------------
  // 4. Review Cycle
  // -------------------------------------------------------

  const existingCycle = await prisma.reviewCycle.findFirst({
    where: { tenantId, title: 'Annual Review 2026' },
  });

  if (!existingCycle) {
    await prisma.reviewCycle.create({
      data: {
        tenantId,
        title: 'Annual Review 2026',
        type: 'ANNUAL',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-12-31'),
        selfReviewDue: new Date('2026-11-15'),
        managerReviewDue: new Date('2026-11-30'),
        calibrationDate: new Date('2026-12-10'),
        publishDate: new Date('2026-12-20'),
        status: 'DRAFT',
        createdBy: adminUserId,
      },
    });
    console.log('  ✅ 1 review cycle created');
  }

  // -------------------------------------------------------
  // 5. LGPD Retention Policies
  // -------------------------------------------------------

  const retentionPolicies = [
    {
      dataType: 'employee_record',
      purpose: 'PAYROLL' as const,
      retentionDays: 1825, // 5 years after termination
      retentionEvent: 'TERMINATION',
      legalBasis: 'LEGAL_OBLIGATION',
    },
    {
      dataType: 'applicant',
      purpose: 'RECRUITMENT' as const,
      retentionDays: 365, // 1 year after application rejected
      retentionEvent: 'APPLICATION_REJECTED',
      legalBasis: 'LEGITIMATE_INTEREST',
    },
    {
      dataType: 'time_entry',
      purpose: 'PAYROLL' as const,
      retentionDays: 1825, // 5 years
      retentionEvent: 'TERMINATION',
      legalBasis: 'LEGAL_OBLIGATION',
    },
    {
      dataType: 'performance_review',
      purpose: 'PERFORMANCE' as const,
      retentionDays: 730, // 2 years after termination
      retentionEvent: 'TERMINATION',
      legalBasis: 'CONTRACT',
    },
  ];

  for (const policy of retentionPolicies) {
    await prisma.lgpdRetentionPolicy.upsert({
      where: {
        tenantId_dataType_purpose: {
          tenantId,
          dataType: policy.dataType,
          purpose: policy.purpose,
        },
      },
      update: {},
      create: {
        tenantId,
        ...policy,
      },
    });
  }
  console.log('  ✅ 4 LGPD retention policies created');

  console.log('✅ People + HR seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedPeopleHR('test-tenant-id', 'test-admin-id')
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding People + HR:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
