import type { FastifyInstance } from 'fastify';
import { WorkspaceController } from '../controller/workspace.controller.ts';
import { roleGuard, requireWorkspacePermission } from '../../../common/guards/index.ts';
import { UserRole } from '@prisma/client';
import { authMiddleware } from '../../../common/middleware/index.ts';
import { workspaceValidator, type WorkspaceInput } from '../validator/workspace.validator.ts';
import { validate } from '../../../utils/validator.util.ts';
import { WorkspaceInvitationController } from '../controller/workspace-invitation.controller.ts';
import {
  type CreateWorkspaceInvitationInput,
  createWorkspaceInvitationSchema,
} from '../validator/workspace-invitation.validator.ts';
import { WORKSPACE_PERMISSION } from '../../../common/enums/workspace-permission.enum.ts';

// Initialize controller instance
const controller = new WorkspaceController();
const workspaceInvitationController = new WorkspaceInvitationController();

/**
 * Workspace management routes
 */
export const workspaceRoutes = async (app: FastifyInstance) => {
  // Add authentication and authorization hooks for workspace management routes
  app.addHook('preHandler', app.authenticate);

  // Ensure user is authenticated before accessing workspace management routes
  app.addHook('preHandler', authMiddleware);

  // Ensure user has either ADMIN or USER role before accessing workspace management routes
  app.addHook('preHandler', roleGuard(UserRole.ADMIN, UserRole.USER));

  /**
   * POST /workspaces
   *
   * Features:
   * - Create a new workspace
   * - Rate limiting to prevent abuse
   */
  app.post<{ Body: WorkspaceInput }>(
    '/',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(workspaceValidator)], // Validate workspace input before processing the request
    },
    controller.createWorkspace.bind(controller),
  );

  app.get(
    '/',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.getAllWorkspaces.bind(controller),
  );

  /**
   * GET /workspaces/:id
   *
   * Features:
   * - Retrieve a workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/:id',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.getWorkspaceById.bind(controller),
  );

  /**
   * PATCH /workspaces/:id
   *
   * Features:
   * - Update a workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.patch<{ Params: { id: string }; Body: WorkspaceInput }>(
    '/:id',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preValidation: [validate(workspaceValidator)], // Validate workspace input before processing the request
    },
    controller.updateWorkspace.bind(controller),
  );

  /**
   * DELETE /workspaces/:id
   *
   * Features:
   * - Delete a workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.delete(
    '/:id',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.deleteWorkspace.bind(controller),
  );

  /**
   * PATCH /workspaces/:id/restore
   *
   * Features:
   * - Restore a deleted workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.patch(
    '/:id/restore',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    controller.restoreWorkspace.bind(controller),
  );

  /**
   * POST /workspaces/:id/invitations
   *
   * Features:
   * - Create a new workspace invitation
   * - Rate limiting to prevent abuse
   */
  app.post<{ Body: CreateWorkspaceInvitationInput; Params: { id: string } }>(
    '/:id/invitations',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.INVITATION_CREATE)], // Ensure user is authenticated before processing the request
      preValidation: [validate(createWorkspaceInvitationSchema)], // Validate workspace input before processing the request
    },
    workspaceInvitationController.createInvitation.bind(workspaceInvitationController),
  );

  /**
   * GET /workspaces/:id/invitations
   *
   * Features:
   * - List all invitations for a specific workspace
   * - Rate limiting to prevent abuse
   */
  app.get<{ Params: { id: string } }>(
    '/:id/invitations',
    {
      config: {
        rateLimit: {
          max: 60, // Maximum 60 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.INVITATION_READ)], // Ensure user is authenticated before processing the request
    },
    workspaceInvitationController.listInvitations.bind(workspaceInvitationController),
  );

  /**
   * GET /workspaces/:id/invitations/:invitationId
   *
   * Features:
   * - Retrieve a specific invitation by its ID for a specific workspace
   * - Rate limiting to prevent abuse
   */
  app.get<{ Params: { id: string; invitationId: string } }>(
    '/:id/invitations/:invitationId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.INVITATION_READ)], // Ensure user is authenticated before processing the request
    },
    workspaceInvitationController.getInvitationById.bind(workspaceInvitationController),
  );

  /**
   * GET /workspaces/:id/invitations/:invitationId/accept
   *
   * Features:
   * - Accept a specific invitation by its ID for a specific workspace
   * - Rate limiting to prevent abuse
   */
  app.get<{ Params: { id: string; invitationId: string }; Querystring: { token: string } }>(
    '/:id/invitations/:invitationId/accept',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    workspaceInvitationController.acceptInvitation.bind(workspaceInvitationController),
  );

  /**
   * GET /workspaces/invitations/validate
   *
   * Features:
   * - Validate a workspace invitation by its token
   * - Rate limiting to prevent abuse
   */
  app.get<{ Querystring: { token: string } }>(
    '/:id/invitations/validate',
    {
      config: {
        rateLimit: {
          max: 60, // Maximum 60 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    workspaceInvitationController.validateInvitation.bind(workspaceInvitationController),
  );

  /**
   * DELETE /workspaces/:id/invitations/:invitationId
   *
   * Features:
   * - Revoke a specific invitation by its ID for a specific workspace
   * - Rate limiting to prevent abuse
   */
  app.delete<{ Params: { id: string; invitationId: string } }>(
    '/:id/invitations/:invitationId',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.INVITATION_CANCEL)], // Ensure user is authenticated before processing the request
    },
    workspaceInvitationController.revokeInvitation.bind(workspaceInvitationController),
  );

  /**
   * GET /workspaces/:id/invitations/reject
   *
   * Features:
   * - Reject a workspace invitation by its token
   * - Rate limiting to prevent abuse
   */
  app.get<{ Querystring: { token: string } }>(
    '/:id/invitations/reject',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
    },
    workspaceInvitationController.rejectInvitation.bind(workspaceInvitationController),
  );
};
