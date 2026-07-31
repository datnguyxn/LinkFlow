import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';

export const listWorkspaceInvitationsSwagger: FastifySchema = {
  summary: 'List Workspace Invitations',
  description: 'Retrieve all invitations of a workspace.',
  tags: ['Workspace Invitation'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  querystring: Type.Object({
    page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
    search: Type.Optional(Type.String()),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      invitations: Type.Array(
        Type.Object({
          id: Type.String({ format: 'uuid' }),
          email: Type.String({ format: 'email' }),

          status: Type.Union([
            Type.Literal('PENDING'),
            Type.Literal('ACCEPTED'),
            Type.Literal('DECLINED'),
            Type.Literal('REVOKED'),
            Type.Literal('EXPIRED'),
          ]),

          token: Type.String({ format: 'uuid' }),
          expiresAt: Type.String({ format: 'date-time' }),
          createdAt: Type.String({ format: 'date-time' }),

          inviter: Type.Object({
            id: Type.String({ format: 'uuid' }),
            fullName: Type.String(),
            email: Type.String({ format: 'email' }),
          }),

          user: Type.Object({
            id: Type.String({ format: 'uuid' }),
            fullName: Type.String(),
            email: Type.String({ format: 'email' }),
          }),

          role: Type.Object({
            id: Type.String({ format: 'uuid' }),
            name: Type.String(),
          }),
        }),
      ),

      summary: Type.Object({
        total: Type.Integer(),
        pending: Type.Integer(),
        accepted: Type.Integer(),
        rejected: Type.Integer(),
        expired: Type.Integer(),
      }),

      pagination: Type.Object({
        page: Type.Integer(),
        limit: Type.Integer(),
        totalItems: Type.Integer(),
        totalPages: Type.Integer(),
        hasNext: Type.Boolean(),
        hasPrevious: Type.Boolean(),
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};