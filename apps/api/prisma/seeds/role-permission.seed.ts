import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRolePermissions() {
  const owner = await prisma.role.findUnique({
    where: { name: 'OWNER' },
  });

  if (!owner) return;

  const permissions = await prisma.permission.findMany();

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: owner.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: owner.id,
        permissionId: permission.id,
      },
    });
  }
}
