import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const changeRoleSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Change User Role',

  description: 'Change the role of a user in the system.',

  body: {
    type: 'object',

    required: ['newRole'],

    properties: {
      newRole: Type.String({
        description: 'The new role to be assigned to the user',
        enum: ['user', 'admin', 'moderator'],
      }),
    },
  },

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
        description: "Confirmation message indicating the user's role has been changed",
        example: 'User role has been successfully updated.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
