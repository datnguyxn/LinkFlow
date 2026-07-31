import type { FastifyInstance } from 'fastify';
import { roleGuard } from '../../../common/guards/index.ts';
import { UserRole } from '@prisma/client';
import { authMiddleware } from '../../../common/middleware/index.ts';
import { AuditLogController } from '../controller/audit-log.controller.ts';

const controller = new AuditLogController();

export const auditLogRoutes = async (app: FastifyInstance) => {
  // Add authentication and authorization hooks for user management routes
  app.addHook('preHandler', app.authenticate);

  // Ensure user is authenticated before accessing user management routes
  app.addHook('preHandler', authMiddleware); // Ensure user is authenticated before accessing user management routes

  // Ensure user has either ADMIN or USER role before accessing user management routes
  app.addHook('preHandler', roleGuard(UserRole.ADMIN, UserRole.USER));

  /**
   * GET /
   *
   * Features:
   * - Fetch all audit logs in the workspace with pagination
   * - Rate limiting to prevent abuse
   */
  app.get<{ Params: { workspaceId: string } }>(
    '/:workspaceId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.getAllInWorkspaceByWorkspaceId.bind(controller),
  );
};
