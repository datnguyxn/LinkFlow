import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const getWorkspaceInvitationByIdSwagger: FastifySchema = {
  summary: 'Get Workspace Invitation By ID',
  description: 'Retrieve a workspace invitation by its ID.',
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

      revokedAt: Type.Union([
        Type.String({ format: 'date-time' }),
        Type.Null(),
      ]),

      rejectedAt: Type.Union([
        Type.String({ format: 'date-time' }),
        Type.Null(),
      ]),

      acceptedAt: Type.Union([
        Type.String({ format: 'date-time' }),
        Type.Null(),
      ]),

      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),

      workspace: Type.Object({
        slug: Type.String(),
      }),

      inviter: Type.Object({
        id: Type.String({ format: 'uuid' }),
        fullName: Type.String(),
        email: Type.String({ format: 'email' }),
      }),

      user: Type.Object({
        id: Type.String({ format: 'uuid' }),
        fullName: Type.String(),
      }),

      role: Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};