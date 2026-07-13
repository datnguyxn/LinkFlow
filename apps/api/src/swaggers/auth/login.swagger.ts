import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const loginSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Login',

  description: 'Authenticate a user and return tokens.',

  body: {
    type: 'object',

    required: ['email', 'password', 'rememberMe'],

    properties: {
      email: Type.String({
        description: 'The email address of the user',
        format: 'email',
      }),

      password: Type.String({
        description: 'The password for the user account',
        minLength: 8,
        maxLength: 100,
      }),

      rememberMe: Type.Boolean({
        description: 'Indicates whether the user wants to stay logged in',
        default: false,
      }),
    },
  },

  response: createSwaggerResponse(
    200,
    Type.Object({
      accessToken: Type.String({
        description: 'Access token for authenticated requests',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      }),
      refreshToken: Type.String({
        description: 'Refresh token for obtaining new access tokens',
        example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4gZXhhbXBsZQ==',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
