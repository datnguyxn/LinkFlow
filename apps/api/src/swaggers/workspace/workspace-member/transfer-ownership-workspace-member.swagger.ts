import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../../common/swagger/swagger-response.ts';
import { WorkspaceMemberStatus, WorkspaceStatus } from '@prisma/client';

export const transferWorkspaceOwnershipSwagger: FastifySchema = {
  summary: 'Transfer Workspace Ownership',
  description: 'Transfer workspace ownership to another workspace member.',
  tags: ['Workspace Member'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  body: Type.Object({
    newOwnerId: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      previousOwnerMember: Type.Object({
        id: Type.String({ format: 'uuid' }),
        workspaceId: Type.String({ format: 'uuid' }),
        userId: Type.String({ format: 'uuid' }),
        roleId: Type.String({ format: 'uuid' }),

        status: Type.Enum(WorkspaceMemberStatus),

        createdAt: Type.String({ format: 'date-time' }),
        joinedAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),

        deletedAt: Type.Union([
          Type.String({ format: 'date-time' }),
          Type.Null(),
        ]),
      }),

      newOwnerMember: Type.Object({
        id: Type.String({ format: 'uuid' }),
        workspaceId: Type.String({ format: 'uuid' }),
        userId: Type.String({ format: 'uuid' }),
        roleId: Type.String({ format: 'uuid' }),

        status: Type.Enum(WorkspaceMemberStatus),

        createdAt: Type.String({ format: 'date-time' }),
        joinedAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),

        deletedAt: Type.Union([
          Type.String({ format: 'date-time' }),
          Type.Null(),
        ]),
      }),

      updatedWorkspace: Type.Object({
        id: Type.String({ format: 'uuid' }),
        ownerId: Type.String({ format: 'uuid' }),

        name: Type.String(),
        slug: Type.String(),

        status: Type.Enum(WorkspaceStatus),

        logoUrl: Type.Union([
          Type.String({ format: 'uri' }),
          Type.Null(),
        ]),

        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),

        deletedAt: Type.Union([
          Type.String({ format: 'date-time' }),
          Type.Null(),
        ]),
      }),
    }),
    [400, 401, 403, 404, 409, 500],
  ),
};