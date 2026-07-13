import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const getAllUsersSchema: FastifySchema = {
  tags: ['Admin'],

  summary: 'Get All Users',

  description: 'Retrieve a list of all users in the system.',

  response: createSwaggerResponse(
    200,
    Type.Array(
      Type.Object({
        email: Type.String({ format: 'email' }),
        fullName: Type.String(),
        avatarUrl: Type.String({ format: 'uri' }),
        status: Type.String(),
        emailVerified: Type.Boolean(),
        language: Type.String(),
        timezone: Type.String(),
      }),
    ),
    [400, 401, 403, 404, 500],
  ),
};
