import { PrismaClient, WorkspaceRole } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedWorkspaceMember() {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@linkflow.dev",
    },
  });

  const workspace = await prisma.workspace.findUnique({
    where: {
      slug: "linkflow",
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
      role: WorkspaceRole.OWNER,
      joinedAt: new Date(),
    },
  });
}