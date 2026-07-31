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
import { WorkspaceMemberController } from '../controller/workspace-member.controller.ts';
import type { MultipartFile } from '@fastify/multipart';
import {
  getAllWorkspacesSwagger,
  getWorkspaceByIdSwagger,
  createWorkspaceSwagger,
  updateWorkspaceSwagger,
  deleteWorkspaceSwagger,
  updateWorkspaceLogoSwagger,
  deleteWorkspaceLogoSwagger,
  createWorkspaceInvitationSwagger,
  listWorkspaceInvitationsSwagger,
  getWorkspaceInvitationByIdSwagger,
  revokeWorkspaceInvitationSwagger,
  rejectWorkspaceInvitationSwagger,
  acceptWorkspaceInvitationSwagger,
  getWorkspaceMemberByIdSwagger,
  listWorkspaceMembersSwagger,
  transferWorkspaceOwnershipSwagger,
  updateWorkspaceMemberRoleSwagger,
  leaveWorkspaceMemberSwagger,
  removeWorkspaceMemberSwagger,
} from '../../../swaggers/index.ts';

// Initialize controller instance
const controller = new WorkspaceController();
const workspaceInvitationController = new WorkspaceInvitationController();
const workspaceMemberController = new WorkspaceMemberController();

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
      schema: createWorkspaceSwagger, // Swagger schema for creating a workspace
    },
    controller.createWorkspace.bind(controller),
  );

  /**
   * GET /workspaces
   *
   * Features:
   * - Retrieve all workspaces
   * - Rate limiting to prevent abuse
   */
  app.get(
    '/',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: getAllWorkspacesSwagger, // Swagger schema for retrieving all workspaces
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
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: getWorkspaceByIdSwagger, // Swagger schema for retrieving a workspace by ID
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
      schema: updateWorkspaceSwagger, // Swagger schema for updating a workspace
    },
    controller.updateWorkspace.bind(controller),
  );

  /**
   * PATCH /workspaces/:id/logo
   *
   * Features:
   * - Update the logo of a workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.patch<{
    Params: { id: string };
    Body: { file: MultipartFile | null; logoUrl: string | null };
  }>(
    '/:id/logo',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: updateWorkspaceLogoSwagger, // Swagger schema for updating a workspace logo
    },
    controller.updateWorkspaceLogo.bind(controller),
  );

  /**
   * DELETE /workspaces/:id/logo
   *
   * Features:
   * - Delete the logo of a workspace by its ID
   * - Rate limiting to prevent abuse
   */
  app.delete<{ Params: { id: string } }>(
    '/:id/logo',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      schema: deleteWorkspaceLogoSwagger, // Swagger schema for deleting a workspace logo
    },
    controller.deleteWorkspaceLogo.bind(controller),
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
      schema: deleteWorkspaceSwagger, // Swagger schema for deleting a workspace
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
      schema: createWorkspaceInvitationSwagger, // Swagger schema for creating a workspace invitation
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
  app.get<{
    Params: { id: string };
    Querystring: { page: number; limit: number; search?: string };
  }>(
    '/:id/invitations',
    {
      config: {
        rateLimit: {
          max: 60, // Maximum 60 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.INVITATION_READ)], // Ensure user is authenticated before processing the request
      schema: listWorkspaceInvitationsSwagger, // Swagger schema for listing workspace invitations
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
      schema: getWorkspaceInvitationByIdSwagger, // Swagger schema for retrieving a workspace invitation by ID
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
      schema: acceptWorkspaceInvitationSwagger, // Swagger schema for accepting a workspace invitation
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
      schema: revokeWorkspaceInvitationSwagger, // Swagger schema for revoking a workspace invitation
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
      schema: rejectWorkspaceInvitationSwagger, // Swagger schema for rejecting a workspace invitation
    },
    workspaceInvitationController.rejectInvitation.bind(workspaceInvitationController),
  );

  /**
   * PATCH /workspaces/:id/members/ownership
   *
   * Features:
   * - Transfer ownership of a workspace to another member
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_UPDATE permission for the workspace
   * - The request body must contain the new owner's ID
   */
  app.patch<{ Params: { id: string }; Body: { newOwnerId: string } }>(
    '/:id/members/ownership',
    {
      config: {
        rateLimit: {
          max: 10, // Maximum 10 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.WORKSPACE_UPDATE)], // Ensure user is authenticated before processing the request
      schema: transferWorkspaceOwnershipSwagger, // Swagger schema for transferring workspace ownership
    },
    workspaceMemberController.transferOwnership.bind(workspaceMemberController),
  );

  /**
   * GET /workspaces/:id/members
   *
   * Features:
   * - List all members of a specific workspace
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_READ permission for the workspace
   */
  app.get<{
    Params: { id: string };
    Querystring: { page: number; limit: number; search?: string };
  }>(
    '/:id/members',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.MEMBER_READ)], // Ensure user is authenticated before processing the request
      schema: listWorkspaceMembersSwagger, // Swagger schema for listing workspace members
    },
    workspaceMemberController.listWorkspaceMembers.bind(workspaceMemberController),
  );

  /**
   * GET /workspaces/:workspaceId/members/:userId
   *
   * Features:
   * - Retrieve a specific member of a workspace by their user ID
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_READ permission for the workspace
   */
  app.get<{ Params: { id: string; userId: string } }>(
    '/:id/members/:userId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.MEMBER_READ)], // Ensure user is authenticated before processing the request
      schema: getWorkspaceMemberByIdSwagger, // Swagger schema for retrieving a workspace member by ID
    },
    workspaceMemberController.getWorkspaceMember.bind(workspaceMemberController),
  );

  /**
   * PATCH /workspaces/:workspaceId/members/:userId/role
   *
   * Features:
   * - Update the role of a specific member in a workspace
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_UPDATE permission for the workspace
   * - The request body must contain the new role ID for the member
   */
  app.patch<{ Params: { id: string; userId: string }; Body: { newRoleId: string } }>(
    '/:id/members/:userId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.MEMBER_UPDATE)], // Ensure user is authenticated before processing the request
      schema: updateWorkspaceMemberRoleSwagger, // Swagger schema for updating a workspace member's role
    },
    workspaceMemberController.updateWorkspaceMemberRole.bind(workspaceMemberController),
  );

  /**
   * DELETE /workspaces/:id/members/me
   *
   * Features:
   * - Allows the authenticated user to leave a specific workspace
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_MEMBER_REMOVE permission for the workspace
   */
  app.delete<{ Params: { id: string } }>(
    '/:id/members/me',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.MEMBER_LEAVE)], // Ensure user is authenticated before processing the request
      schema: leaveWorkspaceMemberSwagger, // Swagger schema for leaving a workspace
    },
    workspaceMemberController.leaveWorkspace.bind(workspaceMemberController),
  );

  /**
   * DELETE /workspaces/:id/members/:userId
   *
   * Features:
   * - Allows the authenticated user to remove a specific member from a workspace
   * - Rate limiting to prevent abuse
   * - Requires the user to have the WORKSPACE_MEMBER_REMOVE permission for the workspace
   */
  app.delete<{ Params: { id: string; userId: string } }>(
    '/:id/members/:userId',
    {
      config: {
        rateLimit: {
          max: 20, // Maximum 20 requests
          timeWindow: '1 minute', // Per minute
        },
      },
      preHandler: [requireWorkspacePermission(WORKSPACE_PERMISSION.MEMBER_REMOVE)], // Ensure user is authenticated before processing the request
      schema: removeWorkspaceMemberSwagger, // Swagger schema for removing a workspace member
    },
    workspaceMemberController.removeWorkspaceMember.bind(workspaceMemberController),
  );
};
