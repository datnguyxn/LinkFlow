import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const forgotPasswordSwagger: FastifySchema = {
  tags: ['Authentication'],

  summary: 'Forgot Password',

  description: 'Initiate the password reset process by sending a password reset email to the user.',

  body: Type.Object({
    email: Type.String({
      description: 'The email address of the user requesting a password reset',
      format: 'email',
    }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      message: Type.String({
        description: 'A message indicating that the password reset email has been sent',
        example: 'Password reset email sent successfully.',
      }),
    }),
  ),
};