import type { FastifyPluginAsync } from 'fastify';
import { HealthController } from './health.controller.js';

const controller = new HealthController();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', controller.getHealth.bind(controller));
};