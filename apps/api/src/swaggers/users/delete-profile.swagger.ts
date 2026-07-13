import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const deleteProfileSwagger: FastifySchema = {
  summary: 'Delete My Profile',
  description: 'Delete the profile of the currently authenticated user.',
  tags: ['User Management'],
  security: [
    {
      bearerAuth: [],
    },
  ],
  response: createSwaggerResponse(200, Type.Null(), [400, 401, 403, 404, 500]),
};
