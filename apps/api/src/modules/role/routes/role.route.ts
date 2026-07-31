import type { FastifyInstance } from 'fastify';
import { RoleController } from '../controller/role.controller.ts';

const controller = new RoleController();

export const roleRoutes = async (app: FastifyInstance) => {
  /**
   * GET /roles
   *
   * Features:
   * - Retrieve all roles from the database
   */
  app.get(
    '/',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.getAllRoles.bind(controller), // Bind controller context
  );
};