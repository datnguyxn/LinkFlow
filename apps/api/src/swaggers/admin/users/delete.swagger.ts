import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const deleteUserSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Delete User',

  description: 'Delete a user from the system.',

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
        description: 'Confirmation message indicating the user has been deleted',
        example: 'User has been successfully deleted.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
