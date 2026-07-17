import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const verifyEmailSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Verify Email',

  description: "Verify a user's email address using a verification token.",

  querystring: Type.Object({
    token: Type.String({
      description: "The verification token sent to the user's email",
      minLength: 1,
    }),
  }),

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
