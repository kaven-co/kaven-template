import { prisma } from './apps/api/src/lib/prisma';

async function benchmark() {
  console.log('🏁 Starting Prisma 7 Latency Benchmark...');
  
  const start = performance.now();
  try {
    // Warm up
    await prisma.$queryRaw`SELECT 1`;
    
    const queryStart = performance.now();
    const result = await prisma.tenant.findMany({ take: 1 });
    const queryEnd = performance.now();
    
    console.log('✅ Connection successful!');
    console.log(`⏱️ Latency (findMany): ${(queryEnd - queryStart).toFixed(2)}ms`);
    console.log(`🚀 Total setup + query time: ${(queryEnd - start).toFixed(2)}ms`);
    
    if (queryEnd - queryStart < 100) {
      console.log('🌟 PERFORMANCE GATE: PASS (< 100ms)');
    } else {
      console.log('⚠️ PERFORMANCE GATE: CONCERNS (> 100ms)');
    }
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

benchmark();
