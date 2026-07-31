import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';
import { WorkspaceMemberStatus } from '@prisma/client';

export const listWorkspaceMembersSwagger: FastifySchema = {
  summary: 'List Workspace Members',
  description: 'Retrieve all members of a workspace.',
  tags: ['Workspace Member'],

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
      members: Type.Array(
        Type.Object({
          id: Type.String({ format: 'uuid' }),
          workspaceId: Type.String({ format: 'uuid' }),
          userId: Type.String({ format: 'uuid' }),
          roleId: Type.String({ format: 'uuid' }),

          status: Type.Enum(WorkspaceMemberStatus),

          createdAt: Type.String({ format: 'date-time' }),
          joinedAt: Type.String({ format: 'date-time' }),
          updatedAt: Type.String({ format: 'date-time' }),

          deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

          user: Type.Object({
            id: Type.String({ format: 'uuid' }),
            fullName: Type.String(),
            email: Type.String({ format: 'email' }),

            avatarUrl: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
          }),

          role: Type.Object({
            id: Type.String({ format: 'uuid' }),
            name: Type.String(),
          }),
        }),
      ),

      summary: Type.Object({
        total: Type.Integer(),
        active: Type.Integer(),
        left: Type.Integer(),
        removed: Type.Integer(),
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
