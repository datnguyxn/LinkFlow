import type { FastifyInstance } from 'fastify';
import { authRoutes } from '../modules/auth/index.ts';
import { ROUTE } from '../common/constants/index.ts';
import { adminUserRoutes } from '../modules/admin/index.ts';
import { userRoutes } from '../modules/users/index.ts';
import { workspaceRoutes } from '../modules/workspace/index.ts';
import { roleRoutes } from '../modules/role/index.ts';
import { auditLogRoutes } from '../modules/audit-log/index.ts';

export async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, {
    prefix: ROUTE.AUTH,
  });

  fastify.register(adminUserRoutes, {
    prefix: ROUTE.ADMIN_USERS,
  });

  fastify.register(userRoutes, {
    prefix: ROUTE.USER,
  });

  fastify.register(workspaceRoutes, {
    prefix: ROUTE.WORKSPACE,
  });

  fastify.register(roleRoutes, {
    prefix: ROUTE.ROLE,
  });

  fastify.register(auditLogRoutes, {
    prefix: ROUTE.ACTIVITY_LOG,
  });
}
