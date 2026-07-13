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
      message: Type.String({
        description: 'A message indicating the result of the verification process',
        example: 'Email verified successfully.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
