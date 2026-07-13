import type { FastifyPluginAsync } from 'fastify';
import { HealthController } from './health.controller.js';

const controller = new HealthController();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', controller.getHealth.bind(controller));

  app.get(
    '/health-swagger',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',

        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async () => {
      return {
        success: true,
        message: 'Server is running',
      };
    },
  );

  app.get('/health-database', async () => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        message: 'Database is reachable',
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        success: false,
        message: 'Database is not reachable',
      };
    }
  });
};
