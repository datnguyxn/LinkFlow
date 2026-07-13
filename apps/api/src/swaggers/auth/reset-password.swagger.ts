import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const resetPasswordSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Reset Password',

  description: "Reset the user's password using a valid reset token.",

  body: Type.Object({
    token: Type.String({
      description: "The password reset token sent to the user's email",
      minLength: 1,
    }),
    newPassword: Type.String({
      description: 'The new password for the user',
      minLength: 8,
    }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'A message indicating the result of the password reset process',
        example: 'Password has been reset successfully.',
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
