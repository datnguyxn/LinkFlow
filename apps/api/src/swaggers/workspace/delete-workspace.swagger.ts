import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const deleteWorkspaceSwagger: FastifySchema = {
  summary: 'Delete Workspace',
  description: 'Soft delete a workspace.',
  tags: ['Workspace Management'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Null(),
    [400, 401, 403, 404, 500],
  ),
};