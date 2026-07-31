import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const createWorkspaceSwagger: FastifySchema = {
  summary: 'Create Workspace',
  description: 'Create a new workspace for the authenticated user.',
  tags: ['Workspace Management'],
  security: [
    {
      bearerAuth: [],
    },
  ],

  body: Type.Object({
    name: Type.String(),
    slug: Type.Optional(Type.String()),
    logoUrl: Type.Optional(Type.String({ format: 'uri' })),
  }),

  response: createSwaggerResponse(
    201,
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      ownerId: Type.String({ format: 'uuid' }),

      name: Type.String(),
      slug: Type.String(),

      status: Type.Union([
        Type.Literal('ACTIVE'),
        Type.Literal('INACTIVE'),
        Type.Literal('SUSPENDED'),
      ]),

      logoUrl: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),

      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
      deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

      members: Type.Array(
        Type.Object({
          id: Type.String({ format: 'uuid' }),
          workspaceId: Type.String({ format: 'uuid' }),
          userId: Type.String({ format: 'uuid' }),
          roleId: Type.String({ format: 'uuid' }),

          status: Type.Union([Type.Literal('ACTIVE'), Type.Literal('INACTIVE')]),

          createdAt: Type.String({ format: 'date-time' }),
          joinedAt: Type.String({ format: 'date-time' }),
          updatedAt: Type.String({ format: 'date-time' }),
          deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),

          role: Type.Object({
            id: Type.String({ format: 'uuid' }),
            name: Type.String(),
            description: Type.String(),
            createdAt: Type.String({ format: 'date-time' }),
            updatedAt: Type.String({ format: 'date-time' }),
          }),
        }),
      ),
    }),
    [400, 401, 403, 404, 500],
  ),
};
