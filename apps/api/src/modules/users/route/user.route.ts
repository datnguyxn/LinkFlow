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

  // Bind controller context for fetching a specific user by ID
  app.get(
    '/me',
    {
      schema: getMyProfileSwagger,
    },
    controller.getMyProfile.bind(controller),
  );

  // Bind controller context for updating a specific user by ID
  app.patch(
    '/me',
    {
      schema: updateProfileSwagger,
    },
    controller.updateProfile.bind(controller),
  );

  // Bind controller context for deleting a specific user by ID
  app.delete(
    '/me',
    {
      schema: deleteProfileSwagger,
    },
    controller.deleteMyAccount.bind(controller),
  );

  // Bind controller context for changing user password
  app.patch(
    '/me/password',
    {
      schema: changePasswordSwagger,
    },
    controller.changePassword.bind(controller),
  );
};
