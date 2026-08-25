import type { FastifyInstance } from 'fastify';
import { roleGuard, requireWorkspacePermission } from '../../../common/guards/index.ts';
import { UserRole } from '@prisma/client';
import { authMiddleware } from '../../../common/middleware/index.ts';
import { UrlController } from './../controller/url.controller.ts';
import { createUrlSchema, updateUrlSchema, type CreateUrlInput, type UpdateUrlInput } from '../validator/url.validator.ts';
import { WORKSPACE_PERMISSION } from '../../../common/enums/workspace-permission.enum.ts';
import { validate } from '../../../utils/validator.util.ts';

const controller = new UrlController();

/**
 * URL management routes
 */
export const urlRoutes = async (app: FastifyInstance) => {
  // Add authentication and authorization hooks for URL management routes
  app.addHook('preHandler', app.authenticate);

  // Ensure user is authenticated before accessing URL management routes
  app.addHook('preHandler', authMiddleware);

  // Ensure user has either ADMIN or USER role before accessing URL management routes
  app.addHook('preHandler', roleGuard(UserRole.ADMIN, UserRole.USER));

  /**
   * POST /urls
   *
   * Features:
   * - Create a new URL record
   * - Rate limiting to prevent abuse
   */
  app.post<{ Params: { id: string }; Body: CreateUrlInput }>(
    '/:id/urls',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(createUrlSchema)], // Ensure user has permission to create URLs in the workspace
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.URL_CREATE)], // Ensure user is authenticated before processing the request
    },
    controller.createUrl.bind(controller),
  );

  /**
   * GET /urls
   *
   * Features:
   * - List all URL records in a workspace with pagination and optional search
   * - Rate limiting to prevent abuse
   */
  app.get<{
    Params: { id: string };
    Querystring: { page: number; limit: number; search?: string };
  }>(
    '/:id/urls',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.URL_READ)], // Ensure user is authenticated before processing the request
    },
    controller.listUrls.bind(controller),
  );

  /**
   * GET /urls/:urlId
   *
   * Features:
   * - Retrieve a URL record by its unique ID in a workspace
   * - Rate limiting to prevent abuse
   */
  app.get<{ Params: { id: string; urlId: string } }>(
    '/:id/urls/:urlId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.URL_READ)], // Ensure user is authenticated before processing the request
    },
    controller.findById.bind(controller),
  );

  /**
   * PATCH /urls/:urlId
   *
   * Features:
   * - Update a URL record by its unique ID in a workspace
   * - Rate limiting to prevent abuse
   */
  app.patch<{ Params: { id: string; urlId: string }, Body: UpdateUrlInput }>(
    '/:id/urls/:urlId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(updateUrlSchema)],
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.URL_UPDATE)],
    },
    controller.updateUrl.bind(controller),
  );

  /**
   * DELETE /urls/:urlId
   *
   * Features:
   * - Delete a URL record by its unique ID in a workspace
   * - Rate limiting to prevent abuse
   */
  app.delete<{ Params: { id: string; urlId: string } }>(
    '/:id/urls/:urlId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.URL_DELETE)],
    },
    controller.deleteUrl.bind(controller),
  );
};
