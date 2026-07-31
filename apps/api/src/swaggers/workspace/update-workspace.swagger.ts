import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const updateWorkspaceSwagger: FastifySchema = {
  summary: 'Update Workspace',
  description: 'Update an existing workspace.',
  tags: ['Workspace Management'],
  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    workspaceId: Type.String({ format: 'uuid' }),
  }),

  body: Type.Object({
    name: Type.Optional(Type.String()),
    slug: Type.Optional(Type.String()),
    logoUrl: Type.Optional(
      Type.Union([
        Type.String({ format: 'uri' }),
        Type.Null(),
      ]),
    ),
  }),

  response: createSwaggerResponse(
    200,
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
    [400, 401, 403, 404, 500],
  ),
};