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
};
