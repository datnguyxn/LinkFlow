import type { FastifyInstance } from 'fastify';
import { roleGuard } from '../../../common/guards/index.ts';
import { UserRole } from '@prisma/client';
import { authMiddleware } from '../../../common/middleware/index.ts';
import { UrlController } from './../controller/url.controller.ts';

const controller = new UrlController();

/**
 * URL management routes
 */
export const urlRoutes = async (app: FastifyInstance) => {
  // Add authentication and authorization hooks for URL management routes
  app.addHook('preHandler', app.authenticate);

  // Ensure user is authenticated before accessing URL management routes
  app.addHook('preHandler', authMiddleware);

  // Ensure user has either ADMIN or USER role before accessing URL management routes
  app.addHook('preHandler', roleGuard(UserRole.ADMIN, UserRole.USER));

  /**
   * POST /urls
   *
   * Features:
   * - Create a new URL record
   * - Rate limiting to prevent abuse
   */
  app.post(
    '/urls',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.createUrl.bind(controller),
  );
};
