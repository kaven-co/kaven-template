import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed sample data for the Projects + PM module.
 * Creates sample projects, tasks, milestones for the admin tenant.
 */
export async function seedProjectsPM(tenantId: string, userId: string) {
  console.log('\n🏗️ Seeding Projects + PM Module...');

  // 1. Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      tenantId,
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with new branding',
      code: 'PRJ-001',
      type: 'FIXED_SCOPE',
      status: 'ACTIVE',
      color: '#3B82F6',
      budgetType: 'FIXED',
      budgetAmount: 25000,
      currency: 'BRL',
      hoursEstimated: 200,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-06-30'),
      createdById: userId,
      managerId: userId,
    },
  });
  console.log(`  ✅ Project: ${project.name}`);

  // 2. Create project member
  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: project.id, userId } },
  });
  if (!existingMember) {
    await prisma.projectMember.create({
      data: {
        tenantId,
        projectId: project.id,
        userId,
        role: 'OWNER',
        hourlyRate: 150,
      },
    });
    console.log('  ✅ Project member (owner) added');
  }

  // 3. Create milestones
  const milestones = [
    {
      id: 'seed-milestone-1',
      title: 'Design Phase Complete',
      description: 'All wireframes and mockups approved',
      status: 'COMPLETED' as const,
      dueDate: new Date('2026-03-31'),
      completedAt: new Date('2026-03-28'),
      position: 1,
      triggerInvoice: true,
      invoicePercentage: 30,
    },
    {
      id: 'seed-milestone-2',
      title: 'Development Phase Complete',
      description: 'Frontend and backend implementation done',
      status: 'IN_PROGRESS' as const,
      dueDate: new Date('2026-05-31'),
      position: 2,
      triggerInvoice: true,
      invoicePercentage: 50,
    },
    {
      id: 'seed-milestone-3',
      title: 'Launch',
      description: 'Website goes live',
      status: 'PENDING' as const,
      dueDate: new Date('2026-06-30'),
      position: 3,
      triggerInvoice: true,
      invoicePercentage: 20,
    },
  ];

  for (const ms of milestones) {
    await prisma.milestone.upsert({
      where: { id: ms.id },
      update: {},
      create: {
        ...ms,
        tenantId,
        projectId: project.id,
      },
    });
  }
  console.log(`  ✅ ${milestones.length} milestones created`);

  // 4. Create tasks
  const tasks = [
    {
      id: 'seed-task-1',
      title: 'Create wireframes',
      description: 'Design wireframes for all main pages',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      position: 1,
      milestoneId: 'seed-milestone-1',
      assigneeId: userId,
      estimatedHours: 20,
      completedAt: new Date('2026-03-15'),
    },
    {
      id: 'seed-task-2',
      title: 'Design system setup',
      description: 'Configure colors, typography, and components',
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      position: 2,
      milestoneId: 'seed-milestone-1',
      assigneeId: userId,
      estimatedHours: 15,
      completedAt: new Date('2026-03-20'),
    },
    {
      id: 'seed-task-3',
      title: 'Implement homepage',
      description: 'Build the new homepage with hero, features, and pricing sections',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      position: 3,
      milestoneId: 'seed-milestone-2',
      assigneeId: userId,
      estimatedHours: 30,
      tags: ['frontend', 'priority'],
    },
    {
      id: 'seed-task-4',
      title: 'Implement API endpoints',
      description: 'Build REST API for contact forms and newsletter signup',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      position: 4,
      milestoneId: 'seed-milestone-2',
      estimatedHours: 25,
      tags: ['backend'],
    },
    {
      id: 'seed-task-5',
      title: 'QA and testing',
      description: 'Cross-browser testing and bug fixes',
      status: 'BACKLOG' as const,
      priority: 'MEDIUM' as const,
      position: 5,
      milestoneId: 'seed-milestone-3',
      estimatedHours: 20,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
        tenantId,
        projectId: project.id,
        createdById: userId,
        tags: task.tags || [],
      },
    });
  }
  console.log(`  ✅ ${tasks.length} tasks created`);

  // 5. Create a second project (retainer)
  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-2' },
    update: {},
    create: {
      id: 'seed-project-2',
      tenantId,
      name: 'Monthly Maintenance',
      description: 'Ongoing website maintenance and support',
      code: 'PRJ-002',
      type: 'RETAINER',
      status: 'ACTIVE',
      color: '#10B981',
      budgetType: 'MONTHLY_RETAINER',
      budgetAmount: 5000,
      hourlyRate: 120,
      currency: 'BRL',
      hoursEstimated: 40,
      startDate: new Date('2026-01-01'),
      createdById: userId,
      managerId: userId,
    },
  });
  console.log(`  ✅ Project: ${project2.name}`);

  console.log('✅ Projects + PM seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  const tenantId = process.argv[2] || 'admin-tenant-id';
  const userId = process.argv[3] || 'admin-user-id';

  seedProjectsPM(tenantId, userId)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding projects:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
