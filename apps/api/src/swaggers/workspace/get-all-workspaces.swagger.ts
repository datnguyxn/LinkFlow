import type { FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import { createSwaggerResponse } from '../../common/swagger/swagger-response.ts';

export const getAllWorkspacesSwagger: FastifySchema = {
  summary: 'Get All Workspaces',
  description: 'Retrieve all workspaces associated with the authenticated user.',
  tags: ['Workspace Management'],
  security: [
    {
      bearerAuth: [],
    },
  ],

  response: createSwaggerResponse(
    200,
    Type.Array(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        name: Type.String(),
        slug: Type.String(),

        logoUrl: Type.Union([
          Type.String({ format: 'uri' }),
          Type.Null(),
        ]),

        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),

        role: Type.Object({
          id: Type.String({ format: 'uuid' }),
          name: Type.String(),
          description: Type.String(),
        }),
      }),
    ),
    [400, 401, 403, 404, 500],
  ),
};