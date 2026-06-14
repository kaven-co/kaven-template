/**
 * Prisma Client Instance
 * Singleton pattern for Prisma 7 with Neon Adapter support
 */

import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import ws from 'ws';

// Configuração obrigatória para WebSockets no Node.js (Next.js Server Side)
if (typeof window === 'undefined' && !neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

const createPrismaClient = () => {
  const url = process.env.DATABASE_URL || '';
  const log: ('query' | 'error' | 'warn' | 'info')[] = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

  if (url.includes('neon.tech')) {
    const pool = new Pool({ connectionString: url });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter, log });
  } else {
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter, log });
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
