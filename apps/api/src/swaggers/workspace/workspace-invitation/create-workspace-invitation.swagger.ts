import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const createWorkspaceInvitationSwagger: FastifySchema = {
  summary: 'Create Workspace Invitation',
  description: 'Invite a user to join a workspace.',
  tags: ['Workspace Invitation'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  body: Type.Object({
    email: Type.String({ format: 'email' }),
    roleId: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    201,
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      workspaceId: Type.String({ format: 'uuid' }),
      inviterId: Type.String({ format: 'uuid' }),
      userId: Type.String({ format: 'uuid' }),
      roleId: Type.String({ format: 'uuid' }),

      email: Type.String({ format: 'email' }),
      token: Type.String({ format: 'uuid' }),

      status: Type.Union([
        Type.Literal('PENDING'),
        Type.Literal('ACCEPTED'),
        Type.Literal('DECLINED'),
        Type.Literal('REVOKED'),
        Type.Literal('EXPIRED'),
      ]),

      expiresAt: Type.String({ format: 'date-time' }),

      revokedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

      rejectedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

      acceptedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
    }),
    [400, 401, 403, 404, 409, 500],
  ),
};
