import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedWorkspaceMember() {
  const admin = await prisma.user.findUnique({
    where: {
      email: 'admin@linkflow.dev',
    },
  });

  const role = await prisma.role.findUnique({
    where: {
      name: 'OWNER',
    },
  });

  if (!admin || !role) return;

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: 'linkflow',
    },
  });

  if (!admin || !workspace) return;

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: admin.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: admin.id,
      roleId: role.id,
      joinedAt: new Date(),
    },
  });
}
