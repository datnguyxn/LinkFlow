import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';
import { WorkspaceMemberStatus } from '@prisma/client';

export const getWorkspaceMemberByIdSwagger: FastifySchema = {
  summary: 'Get Workspace Member By ID',
  description: 'Retrieve a workspace member by its ID.',
  tags: ['Workspace Member'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
    memberId: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
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

      workspace: Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),
        ownerId: Type.String({ format: 'uuid' }),

        logoUrl: Type.Union([Type.String(), Type.Null()]),
      }),
    }),
    [400, 401, 403, 404, 500],
  ),
};
