import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed sample data for the Governance module.
 * Creates sample OKR cycle, objectives, key results, meetings, and boards.
 */
export async function seedGovernance(tenantId: string, userId: string) {
  console.log('\n🏛️ Seeding Governance Module...');

  // 1. Create OKR Cycle
  const cycle = await prisma.oKRCycle.upsert({
    where: { id: 'seed-okr-cycle-1' },
    update: {},
    create: {
      id: 'seed-okr-cycle-1',
      tenantId,
      name: 'Q2 2026',
      description: 'Second quarter objectives and key results',
      type: 'QUARTERLY',
      status: 'ACTIVE',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-06-30'),
      createdById: userId,
    },
  });
  console.log(`  ✅ OKR Cycle: ${cycle.name}`);

  // 2. Create Company-level Objective
  const companyObjective = await prisma.objective.upsert({
    where: { id: 'seed-objective-company-1' },
    update: {},
    create: {
      id: 'seed-objective-company-1',
      tenantId,
      cycleId: cycle.id,
      title: 'Achieve sustainable revenue growth',
      description: 'Grow MRR to R$50K while maintaining healthy unit economics',
      level: 'COMPANY',
      status: 'ON_TRACK',
      privacy: 'PUBLIC',
      progress: 45,
      ownerId: userId,
    },
  });
  console.log(`  ✅ Objective (Company): ${companyObjective.title}`);

  // 3. Create Team-level Objective (child)
  const teamObjective = await prisma.objective.upsert({
    where: { id: 'seed-objective-team-1' },
    update: {},
    create: {
      id: 'seed-objective-team-1',
      tenantId,
      cycleId: cycle.id,
      parentId: companyObjective.id,
      title: 'Scale product-led growth engine',
      description: 'Increase organic signups and improve activation funnel',
      level: 'TEAM',
      status: 'ON_TRACK',
      privacy: 'PUBLIC',
      progress: 55,
      ownerId: userId,
    },
  });
  console.log(`  ✅ Objective (Team): ${teamObjective.title}`);

  // 4. Create Key Results
  const keyResults = [
    {
      id: 'seed-kr-1',
      title: 'Increase MRR from R$20K to R$50K',
      type: 'CURRENCY' as const,
      dataSource: 'FINANCE' as const,
      startValue: 20000,
      currentValue: 32000,
      targetValue: 50000,
      unit: 'BRL',
      progress: 40,
      objectiveId: companyObjective.id,
    },
    {
      id: 'seed-kr-2',
      title: 'Reach 500 active users',
      type: 'NUMERIC' as const,
      dataSource: 'MANUAL' as const,
      startValue: 100,
      currentValue: 280,
      targetValue: 500,
      unit: 'users',
      progress: 45,
      objectiveId: companyObjective.id,
    },
    {
      id: 'seed-kr-3',
      title: 'Improve trial-to-paid conversion to 15%',
      type: 'PERCENT' as const,
      dataSource: 'SALES' as const,
      startValue: 5,
      currentValue: 11,
      targetValue: 15,
      unit: '%',
      progress: 60,
      objectiveId: teamObjective.id,
    },
  ];

  for (const kr of keyResults) {
    await prisma.keyResult.upsert({
      where: { id: kr.id },
      update: {},
      create: {
        id: kr.id,
        tenantId,
        objectiveId: kr.objectiveId,
        title: kr.title,
        type: kr.type,
        dataSource: kr.dataSource,
        startValue: kr.startValue,
        currentValue: kr.currentValue,
        targetValue: kr.targetValue,
        unit: kr.unit,
        progress: kr.progress,
        status: 'ON_TRACK',
        ownerId: userId,
      },
    });
    console.log(`  ✅ Key Result: ${kr.title}`);
  }

  // 5. Create Check-In for first KR
  const existingCheckIn = await prisma.oKRCheckIn.findFirst({
    where: { id: 'seed-checkin-1' },
  });
  if (!existingCheckIn) {
    await prisma.oKRCheckIn.create({
      data: {
        id: 'seed-checkin-1',
        tenantId,
        keyResultId: 'seed-kr-1',
        value: 32000,
        previousValue: 28000,
        confidence: 'HIGH',
        notes: 'Strong month with 3 new enterprise deals closing',
        createdById: userId,
      },
    });
    console.log('  ✅ OKR Check-In created');
  }

  // 6. Create Board
  const board = await prisma.board.upsert({
    where: { id: 'seed-board-1' },
    update: {},
    create: {
      id: 'seed-board-1',
      tenantId,
      name: 'Board of Directors',
      description: 'Main governance board for strategic decisions',
      type: 'BOARD',
      quorumMin: 3,
      isActive: true,
    },
  });
  console.log(`  ✅ Board: ${board.name}`);

  // 7. Create Board Member
  const existingMember = await prisma.boardMember.findFirst({
    where: { boardId: board.id, userId },
  });
  if (!existingMember) {
    await prisma.boardMember.create({
      data: {
        tenantId,
        boardId: board.id,
        userId,
        role: 'CHAIR',
      },
    });
    console.log('  ✅ Board Member (Chair) added');
  }

  // 8. Create Meeting
  const meeting = await prisma.meeting.upsert({
    where: { id: 'seed-meeting-1' },
    update: {},
    create: {
      id: 'seed-meeting-1',
      tenantId,
      title: 'Q2 OKR Review Meeting',
      description: 'Monthly review of Q2 objectives and key results',
      type: 'ALL_HANDS',
      status: 'SCHEDULED',
      location: 'VIRTUAL',
      locationUrl: 'https://meet.google.com/abc-defg-hij',
      scheduledAt: new Date('2026-05-15T14:00:00Z'),
      durationMin: 60,
      organizerId: userId,
    },
  });
  console.log(`  ✅ Meeting: ${meeting.title}`);

  // 9. Create Decision
  const existingDecision = await prisma.decision.findFirst({
    where: { id: 'seed-decision-1' },
  });
  if (!existingDecision) {
    await prisma.decision.create({
      data: {
        id: 'seed-decision-1',
        tenantId,
        meetingId: meeting.id,
        title: 'Approve Q2 marketing budget increase',
        context: 'Current marketing spend is below industry average for our growth stage',
        description: 'Increase Q2 marketing budget from R$10K to R$25K to accelerate user acquisition',
        type: 'FINANCIAL',
        outcome: 'APPROVED',
        votesFor: 4,
        votesAgainst: 1,
        abstentions: 0,
        impact: 'Marketing team can proceed with paid acquisition campaigns',
        participants: [userId],
        createdById: userId,
      },
    });
    console.log('  ✅ Decision: Approve Q2 marketing budget increase');
  }

  // 10. Create Strategic Pillar
  await prisma.strategicPillar.upsert({
    where: { id: 'seed-pillar-1' },
    update: {},
    create: {
      id: 'seed-pillar-1',
      tenantId,
      title: 'Product-Led Growth',
      description: 'Build a self-serve product experience that drives organic acquisition and expansion',
      horizon: 'MID_TERM',
      color: '#3B82F6',
      position: 1,
      isActive: true,
      ownerId: userId,
    },
  });
  console.log('  ✅ Strategic Pillar: Product-Led Growth');

  // 11. Create Mission Statement
  await prisma.missionStatement.upsert({
    where: { tenantId },
    update: {},
    create: {
      tenantId,
      mission: 'Empower developers to build and launch SaaS products in days, not months.',
      vision: 'Every developer can turn their idea into a profitable business.',
      values: ['Ship fast', 'Developer experience first', 'Transparency', 'Continuous improvement'],
      purpose: 'Democratize SaaS creation by providing enterprise-grade infrastructure as a commodity.',
      updatedById: userId,
    },
  });
  console.log('  ✅ Mission Statement created');

  console.log('✅ Governance Module seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedGovernance('seed-tenant-id', 'seed-user-id')
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding governance:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
