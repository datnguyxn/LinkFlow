import type { FastifyReply, FastifyRequest } from 'fastify';
import { HealthService } from './health.service.js';

const healthService = new HealthService();

export class HealthController {
    async getHealth(
        request: FastifyRequest,
        reply: FastifyReply,
      ) {
        return reply.send(healthService.getHealth());
      }
}