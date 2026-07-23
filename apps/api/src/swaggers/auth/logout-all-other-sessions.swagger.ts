import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const logoutAllOtherSessionsSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Logout All Other Sessions',

  description: 'Logout all other active sessions for the authenticated user.',
  response: createSwaggerResponse(200, Type.Null(), [400, 401, 403, 404, 500]),
};
