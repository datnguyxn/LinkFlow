import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma } from '@prisma/client';

export class AuditLogRepository {
  create(data: Prisma.AuditLogCreateInput) {
    return prisma.auditLog.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.auditLog.findMany({
      where: {
        userId,
      },
    });
  }

  async findAllInWorkspaceByWorkspaceId(workspaceId: string) {
    return prisma.auditLog.findMany({
      where: {
        resourceId: workspaceId,
        resource: {
          in: ['WORKSPACE', 'WORKSPACE_MEMBER', 'WORKSPACE_INVITATION'],
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });
  }

  async deleteOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
  }
}
