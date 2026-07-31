import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';
import { WorkspaceStatus } from '@prisma/client';

export const updateWorkspaceLogoSwagger: FastifySchema = {
  summary: 'Update Workspace Logo',
  description: 'Upload a new workspace logo or update it using an image URL.',
  tags: ['Workspace Management'],

  security: [
    {
      bearerAuth: [],
    },
  ],

  consumes: ['multipart/form-data'],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  body: Type.Object({
    file: Type.Optional(
      Type.Unsafe({
        type: 'string',
        format: 'binary',
      }),
    ),

    logoUrl: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()])),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      ownerId: Type.String({ format: 'uuid' }),

      name: Type.String(),
      slug: Type.String(),

      status: Type.Enum(WorkspaceStatus),

      logoUrl: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),

      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
      deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    }),
    [400, 401, 403, 404, 413, 415, 500],
  ),
};
