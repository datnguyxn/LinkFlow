import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rolePermissions = {
  ADMIN: [
    'workspace.read',
    'workspace.update',

    'workspace.member.read',
    'workspace.member.invite',
    'workspace.member.update',
    'workspace.member.remove',

    'workspace.invitation.read',
    'workspace.invitation.create',
    'workspace.invitation.cancel',

    'url.read',
    'url.create',
    'url.update',
    'url.delete',

    'qrcode.read',
    'qrcode.create',
    'qrcode.delete',

    'tag.read',
    'tag.create',
    'tag.update',
    'tag.delete',

    'analytics.read',

    'apikey.read',
    'apikey.create',
    'apikey.update',
    'apikey.delete',

    'audit.read',
  ],

  MEMBER: [
    'workspace.read',

    'workspace.member.read',

    'workspace.invitation.read',

    'url.read',
    'url.create',
    'url.update',
    'url.delete',

    'qrcode.read',
    'qrcode.create',
    'qrcode.delete',

    'tag.read',
    'tag.create',
    'tag.update',
    'tag.delete',

    'analytics.read',
  ],
} as const;

export async function seedRolePermissions() {
  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: ['OWNER', 'ADMIN', 'MEMBER'],
      },
    },
  });

  const permissions = await prisma.permission.findMany();

  const permissionMap = new Map(permissions.map((permission) => [permission.name, permission.id]));

  const roleMap = new Map(roles.map((role) => [role.name, role.id]));

  // OWNER
  const ownerRoleId = roleMap.get('OWNER');

  if (ownerRoleId) {
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRoleId,
            permissionId: permission.id,
          },
        },

        update: {},

        create: {
          roleId: ownerRoleId,
          permissionId: permission.id,
        },
      });
    }
  }

  // ADMIN + MEMBER
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    if (roleName === 'OWNER') {
      continue;
    }

    const roleId = roleMap.get(roleName);

    if (!roleId) {
      continue;
    }

    for (const permissionName of permissionNames) {
      const permissionId = permissionMap.get(permissionName);

      if (!permissionId) {
        console.warn(`Permission not found: ${permissionName}`);

        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },

        update: {},

        create: {
          roleId,
          permissionId,
        },
      });
    }
  }
}
