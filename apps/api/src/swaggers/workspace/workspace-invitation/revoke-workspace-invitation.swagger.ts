import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const revokeWorkspaceInvitationSwagger: FastifySchema = {
  summary: 'Revoke Workspace Invitation',
  description: 'Revoke a pending workspace invitation.',
  tags: ['Workspace Invitation'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
    invitationId: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Null(),
    [400, 401, 403, 404, 409, 500],
  ),
};