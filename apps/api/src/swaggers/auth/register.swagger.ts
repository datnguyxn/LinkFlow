import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const registerSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Register',

  description: 'Create a new user account.',

  body: {
    type: 'object',

    required: ['fullName', 'email', 'password'],

    properties: {
      fullName: Type.String({
        description: 'The full name of the user',
        minLength: 1,
        maxLength: 100,
      }),
      email: Type.String({
        description: 'The email address of the user',
        format: 'email',
      }),
      password: Type.String({
        description: 'The password for the user account',
        minLength: 8,
        maxLength: 100,
      }),
    },
  },

  response: createSwaggerResponse(201, Type.Null(), [400, 401, 403, 404, 500]),
};
