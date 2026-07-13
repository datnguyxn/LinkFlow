import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const restoreUserSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Restore User',

  description: 'Restore a deleted user in the system.',

  params: {
    type: 'object',

    required: ['id'],

    properties: {
      id: Type.String({
        description: 'The ID of the user whose role is to be changed',
        format: 'uuid',
      }),
    },
  },

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'Confirmation message indicating the user has been restored',
        example: 'User has been successfully restored.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
