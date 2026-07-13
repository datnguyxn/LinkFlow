import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const banUserSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Ban User',

  description: 'Ban a user from the system.',

  params: {
    type: 'object',

    required: ['userId'],

    properties: {
      userId: Type.String({
        description: 'The ID of the user to be banned',
        format: 'uuid',
      }),
    },
  },

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'Confirmation message indicating the user has been banned',
        example: 'User has been successfully banned.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
