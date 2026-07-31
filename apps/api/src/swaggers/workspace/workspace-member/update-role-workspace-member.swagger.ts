import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';
import { WorkspaceMemberStatus } from '@prisma/client';

export const updateWorkspaceMemberRoleSwagger: FastifySchema = {
  summary: 'Update Workspace Member Role',
  description: 'Update the role of a workspace member.',
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

  body: Type.Object({
    roleId: Type.String({ format: 'uuid' }),
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
    }),
    [400, 401, 403, 404, 409, 500],
  ),
};
