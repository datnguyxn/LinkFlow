import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@linkflow.com',
    },
    update: {},
    create: {
      email: 'admin@linkflow.com',
      username: 'admin',
      passwordHash,
      fullName: 'System Administrator',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      theme: false,
      language: 'en',
      timezone: 'UTC',
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
