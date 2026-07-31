import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const removeWorkspaceMemberSwagger: FastifySchema = {
  summary: 'Remove Workspace Member',
  description: 'Remove a member from a workspace.',
  tags: ['Workspace Member Management'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(200, Type.Null(), [400, 401, 403, 404, 500]),
};
