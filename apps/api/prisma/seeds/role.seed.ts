import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRoles() {
  const roles = [
    {
      name: "OWNER",
      description: "Workspace Owner",
    },
    {
      name: "ADMIN",
      description: "Workspace Administrator",
    },
    {
      name: "MEMBER",
      description: "Workspace Member",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {},
      create: role,
    });
  }
}