
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.update({
    where: { email: 'testadmin@kaven.com' },
    data: { role: 'SUPER_ADMIN' },
  });
  console.log('User promoted to SUPER_ADMIN');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
