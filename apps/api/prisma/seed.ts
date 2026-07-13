import { PrismaClient } from '@prisma/client';

import { seedRoles } from './seeds/role.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedRolePermissions } from './seeds/role-permission.seed';
import { seedAdminUser } from './seeds/user.seed';
import { seedWorkspace } from './seeds/workspace.seed';
import { seedWorkspaceMember } from './seeds/workspace-member.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  await seedRoles();
  await seedPermissions();
  await seedRolePermissions();

  await seedAdminUser();

  await seedWorkspace();
  await seedWorkspaceMember();

  console.log('✅ Seed completed.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
