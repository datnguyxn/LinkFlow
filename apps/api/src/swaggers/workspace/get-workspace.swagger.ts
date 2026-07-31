import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const getWorkspaceByIdSwagger: FastifySchema = {
  summary: 'Get Workspace By ID',
  description: 'Retrieve a workspace by its ID.',
  tags: ['Workspace Management'],
  security: [
    {
      bearerAuth: [],
    },
  ],

  params: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),

  response: createSwaggerResponse(
    200,
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String(),
      slug: Type.String(),

      logoUrl: Type.Union([
        Type.String({ format: 'uri' }),
        Type.Null(),
      ]),

      role: Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
      }),

      permissions: Type.Array(Type.String()),

      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
    }),
    [400, 401, 403, 404, 500],
  ),
};