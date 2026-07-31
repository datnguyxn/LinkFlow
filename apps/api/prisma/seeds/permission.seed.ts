import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // ===========================
  // Workspace
  // ===========================
  'workspace.read',
  'workspace.create',
  'workspace.update',
  'workspace.delete',

  // ===========================
  // Workspace Members
  // ===========================
  'workspace.member.read',
  'workspace.member.invite',
  'workspace.member.update',
  'workspace.member.remove',
  'workspace.member.leave',

  // ===========================
  // Workspace Invitation
  // ===========================
  'workspace.invitation.read',
  'workspace.invitation.create',
  'workspace.invitation.cancel',
  'workspace.invitation.accept',
  'workspace.invitation.reject',

  // ===========================
  // URL
  // ===========================
  'url.read',
  'url.create',
  'url.update',
  'url.delete',

  // ===========================
  // QR Code
  // ===========================
  'qrcode.read',
  'qrcode.create',
  'qrcode.delete',

  // ===========================
  // Tag
  // ===========================
  'tag.read',
  'tag.create',
  'tag.update',
  'tag.delete',

  // ===========================
  // Analytics
  // ===========================
  'analytics.read',
  'analytics.export',
  'analytics.delete',

  // ===========================
  // API Key
  // ===========================
  'apikey.read',
  'apikey.create',
  'apikey.update',
  'apikey.delete',

  // ===========================
  // Audit Log
  // ===========================
  'audit.read',

  // ===========================
  // Billing
  // ===========================
  'billing.read',
  'billing.update',
  'billing.cancel',
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
