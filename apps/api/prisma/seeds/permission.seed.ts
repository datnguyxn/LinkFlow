import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  "auth.login",
  "auth.logout",
  "auth.refresh",

  "user.read",
  "user.create",
  "user.update",
  "user.delete",

  "workspace.read",
  "workspace.create",
  "workspace.update",
  "workspace.delete",
  "workspace.invite",

  "url.read",
  "url.create",
  "url.update",
  "url.delete",

  "analytics.read",

  "dashboard.read",

  "search.read",

  "notification.read",
  "notification.update",

  "apikey.read",
  "apikey.create",
  "apikey.update",
  "apikey.delete",

  "admin.dashboard",
  "admin.user",
  "admin.audit",
];

export async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission,
      },
      update: {},
      create: {
        name: permission,
      },
    });
  }
}