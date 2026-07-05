import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedWorkspace() {
  const admin = await prisma.user.findUnique({
    where: {
      email: "admin@linkflow.dev",
    },
  });

  if (!admin) return;

  await prisma.workspace.upsert({
    where: {
      slug: "linkflow",
    },
    update: {},
    create: {
      ownerId: admin.id,
      name: "LinkFlow",
      slug: "linkflow",
    },
  });
}