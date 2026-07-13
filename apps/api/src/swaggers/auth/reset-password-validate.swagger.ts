import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const resetPasswordValidateSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Validate Reset Password Token',

  description: "Validate the password reset token sent to the user's email.",

  querystring: Type.Object({
    token: Type.String({
      description: "The password reset token sent to the user's email",
      minLength: 1,
    }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'A message indicating the result of the token validation process',
        example: 'Password reset token is valid.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
