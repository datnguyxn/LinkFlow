import type { FastifyInstance } from 'fastify';
import { roleGuard } from '../../../common/guards/index.ts';
import { UserRole } from '@prisma/client';
import { authMiddleware } from '../../../common/middleware/index.ts';
import { UserController } from '../controller/user.controller.ts';
import {
  changePasswordSwagger,
  deleteProfileSwagger,
  updateProfileSwagger,
  getMyProfileSwagger,
} from '../../../swaggers/index.ts';

// Initialize controller instance
const controller = new UserController();

/**
 * User management routes
 */
export const userRoutes = async (app: FastifyInstance) => {
  // Add authentication and authorization hooks for user management routes
  app.addHook('preHandler', app.authenticate);

  // Ensure user is authenticated before accessing user management routes
  app.addHook('preHandler', authMiddleware); // Ensure user is authenticated before accessing user management routes

  // Ensure user has either ADMIN or USER role before accessing user management routes
  app.addHook('preHandler', roleGuard(UserRole.ADMIN, UserRole.USER));

  /**
   * GET /me
   *
   * Features:
   * - Fetch the profile of the currently authenticated user
   * - Rate limiting to prevent abuse
   * - Swagger documentation for this route
   */
  app.get(
    '/me',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: getMyProfileSwagger,
    },
    controller.getMyProfile.bind(controller),
  );

  /**
   * PATCH /me
   *
   * Features:
   * - Update the profile of the currently authenticated user
   * - Rate limiting to prevent abuse
   * - Swagger documentation for this route
   */
  app.patch(
    '/me',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: updateProfileSwagger,
    },
    controller.updateProfile.bind(controller),
  );

  /**
   * DELETE /me
   *
   * Features:
   * - Delete the account of the currently authenticated user
   * - Rate limiting to prevent abuse
   * - Swagger documentation for this route
   */
  app.delete(
    '/me',
    {
      config: {
        rateLimit: {
          max: 5, // Maximum 5 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: deleteProfileSwagger,
    },
    controller.deleteMyAccount.bind(controller),
  );

  /**
   * PATCH /me/password
   *
   * Features:
   * - Change the password of the currently authenticated user
   * - Rate limiting to prevent abuse
   * - Swagger documentation for this route
   */
  app.patch(
    '/me/password',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: changePasswordSwagger,
    },
    controller.changePassword.bind(controller),
  );

  /**
   * PATCH /me/avatar
   *
   * Features:
   * - Upload or update the avatar of the currently authenticated user
   * - Rate limiting to prevent abuse
   * - Swagger documentation for this route
   */
  app.patch(
    '/me/avatar',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.uploadAvatar.bind(controller),
  );

  /**
   * GET /me/avatar
   *
   * Features:
   * - Fetch the avatar of the currently authenticated user
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/me/avatar',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.getMyAvatar.bind(controller),
  );
};
