import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { config } from '../config/env/index.ts';
import type { FastifyRequest } from 'fastify';

export default fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: config.JWT_ACCESS_SECRET,
    sign: {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest) => {
    await request.jwtVerify();
  });
});
