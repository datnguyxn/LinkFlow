import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const acceptWorkspaceInvitationSwagger: FastifySchema = {
  summary: 'Accept Workspace Invitation',
  description: 'Accept a workspace invitation using the invitation token.',
  tags: ['Workspace Invitation'],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
    invitationId: Type.String({ format: 'uuid' }),
  }),

  querystring: Type.Object({
    token: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      workspaceMember: Type.Object({
        id: Type.String({ format: 'uuid' }),
        workspaceId: Type.String({ format: 'uuid' }),
        userId: Type.String({ format: 'uuid' }),
        roleId: Type.String({ format: 'uuid' }),

        status: Type.Union([Type.Literal('ACTIVE'), Type.Literal('INACTIVE')]),

        createdAt: Type.String({ format: 'date-time' }),
        joinedAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),

        deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
      }),

      updatedInvitation: Type.Object({
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
    }),
    [400, 401, 403, 404, 409, 410, 500],
  ),
};
