import { PrismaClient, UserStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedAdminUser() {
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const ownerRole = await prisma.role.findUnique({
    where: {
      name: 'OWNER',
    },
  });

  if (!ownerRole) {
    throw new Error('OWNER role not found');
  }

  await prisma.user.upsert({
    where: {
      email: 'admin@linkflow.dev',
    },
    update: {},
    create: {
      email: 'admin@linkflow.dev',
      passwordHash,
      fullName: 'System Administrator',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      role: UserRole.ADMIN,
      language: 'en',
      timezone: 'UTC',
    },
  });
}
