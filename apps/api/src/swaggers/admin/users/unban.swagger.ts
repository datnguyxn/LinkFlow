import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const unbanUserSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Unban User',

  description: 'Unban a user from the system.',

  params: {
    type: 'object',

    required: ['userId'],

    properties: {
      userId: Type.String({
        description: 'The ID of the user to be unbanned',
        format: 'uuid',
      }),
    },
  },

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'Confirmation message indicating the user has been unbanned',
        example: 'User has been successfully unbanned.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
