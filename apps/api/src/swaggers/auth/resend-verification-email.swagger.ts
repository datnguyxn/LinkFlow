import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const resendVerificationEmailSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Resend Verification Email',

  description: 'Resend the verification email to a user who has not yet verified their email address.',

  body: Type.Object({
    email: Type.String({
      description: 'The email address of the user to resend the verification email to',
      format: 'email',
    }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'A message indicating that the verification email has been resent',
        example: 'Verification email resent successfully.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};