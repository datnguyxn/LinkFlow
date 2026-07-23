// import { Prisma, PrismaClient } from '@prisma/client';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../common/errors/index.ts';
import { WorkspaceRepository } from '../repository/workspace.repository.ts';
import type { WorkspaceInput } from '../validator/workspace.validator.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { WorkspacePublisher } from '../../../publishers/workspace/workspace.publisher.ts';
import type {
  WorkspaceCreatedEvent,
  WorkspaceUpdatedEvent,
  WorkspaceDeletedEvent,
} from '../../../events/index.ts';
import { WorkspaceStatus } from '@prisma/client';
import { WorkspaceMemberRepository } from '../repository/workspace-member.repository.ts';

/**
 * WorkspaceService class provides methods to interact with the workspace data in the database.
 * It includes methods for finding, creating, updating, and deleting workspaces, as well as
 * handling workspace-related operations.
 */
export class WorkspaceService {
  // The WorkspaceRepository instance is injected into the WorkspaceService class, allowing it to access the repository methods for workspace-related database operations.
  constructor(
    private workspaceRepository = new WorkspaceRepository(),
    private workspaceMemberRepository = new WorkspaceMemberRepository(),
    private publisher = new WorkspacePublisher(new Publisher()),
  ) {}

  /**
   * Create a new workspace and assign the owner inside a transaction
   * Transaction flow:
   * 1. Check if the workspace slug already exists in the database
   * 2. Create workspace record
   * 3. Create workspace-member mapping for the owner
   * 4. Publish a workspace created event
   * 5. Ensure all operations succeed or all rollback
   *
   * @param workspaceData - The data for the new workspace
   * @param ownerId - The ID of the user who will be the owner of the workspace
   * @param ipAddress - The IP address of the user creating the workspace (optional)
   * @returns The created workspace record with its members
   */
  async createWorkspace(workspaceData: WorkspaceInput, ownerId: string, ipAddress?: string | null) {
    // Check if the workspace slug already exists in the database
    if (workspaceData.slug) {
      // If a slug is provided, check if it already exists in the database
      const existed = await this.workspaceRepository.findBySlug(workspaceData.slug);

      // If the slug already exists, throw a ConflictError to indicate that the workspace slug is already taken
      if (existed) {
        throw new ConflictError(
          'workspace.slugAlreadyExists',
          ERROR_CODE.WORKSPACE_SLUG_ALREADY_EXISTS,
        );
      }
    }

    // Create a new workspace using the repository method
    const newWorkspace = await this.workspaceRepository.create({
      name: workspaceData.name,
      ownerId,
      logoUrl: workspaceData.logoUrl,
    });

    // Create a workspace created event object to be published
    const workspaceCreatedEvent: WorkspaceCreatedEvent = {
      workspaceId: newWorkspace.id,
      ownerId: newWorkspace.ownerId,
      name: newWorkspace.name,
      slug: newWorkspace.slug,
      createdAt: newWorkspace.createdAt,
      ipAddress: ipAddress || null,
    };

    // Publish the workspace created event
    await this.publisher.workspaceCreated(workspaceCreatedEvent);

    // Return the newly created workspace
    return newWorkspace;
  }

  /**
   * Retrieve all workspaces for a specific user
   * @param ownerId - The ID of the user whose workspaces are to be retrieved
   * @returns An array of workspaces owned by the specified user
   */
  async getAllWorkspaces(ownerId: string) {
    // Retrieve all workspaces for the given ownerId using the repository method
    const workspaces = await this.workspaceRepository.findAllByUserId(ownerId);

    // Return the list of workspaces
    return workspaces;
  }

  /**
   * Retrieve a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to retrieve
   * @param ownerId - The ID of the user who owns the workspace
   * @returns The workspace record if found, otherwise null
   * @throws ConflictError if the workspace does not exist
   * @throws ForbiddenError if the user is not a member of the workspace
   */
  async getWorkspaceById(workspaceId: string, ownerId: string) {
    // Retrieve the workspace by its ID using the repository method
    const workspace = await this.workspaceRepository.findWorkspaceAndMemberById(
      workspaceId,
      ownerId,
    );

    // If the workspace does not exist, return null
    if (!workspace) {
      throw new NotFoundError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Check if the user is a member of the workspace
    await this.requireMember(workspaceId, ownerId);

    // Return the workspace along with the user's role in it
    return workspace;
  }

  /**
   * Update a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to update
   * @param workspaceData - The data to update for the workspace
   * @param ownerId - The ID of the user who owns the workspace
   * @param ipAddress - The IP address of the user updating the workspace (optional)
   * @returns The updated workspace record
   * @throws ConflictError if the workspace does not exist
   * @throws ForbiddenError if the user is not a member of the workspace
   */
  async updateWorkspace(
    workspaceId: string,
    workspaceData: WorkspaceInput,
    ownerId: string,
    ipAddress?: string | null,
  ) {
    // Retrieve the workspace by its ID using the repository method
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, return null
    if (!workspace) {
      throw new ConflictError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Check if the user is a member of the workspace
    await this.requireMember(workspaceId, ownerId);

    // Update the workspace using the repository method
    const updatedWorkspace = await this.workspaceRepository.update(workspaceId, {
      name: workspaceData.name,
      logoUrl: workspaceData.logoUrl,
    });

    // Create a workspace updated event object to be published
    const workspaceUpdatedEvent: WorkspaceUpdatedEvent = {
      id: updatedWorkspace.id,
      updatedBy: ownerId,
      changedFields: Object.keys(workspaceData),
      updatedAt: updatedWorkspace.updatedAt,
      ipAddress: ipAddress || null,
    };

    // Publish the workspace updated event
    await this.publisher.workspaceUpdated(workspaceUpdatedEvent);

    // Return the updated workspace
    return updatedWorkspace;
  }

  /**
   * Delete a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to delete
   * @param ownerId - The ID of the user who owns the workspace
   * @param ipAddress - The IP address of the user deleting the workspace (optional)
   * @returns The deleted workspace record
   * @throws ConflictError if the workspace does not exist
   * @throws ForbiddenError if the user is not the owner of the workspace
   */
  async deleteWorkspace(workspaceId: string, ownerId: string, ipAddress?: string | null) {
    // Retrieve the workspace by its ID using the repository method
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, return null
    if (!workspace) {
      throw new ConflictError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Check if the user is the owner of the workspace
    await this.requireOwner(workspaceId, ownerId);

    // Delete the workspace using the repository method
    const updatedWorkspace = await this.workspaceRepository.update(workspaceId, {
      status: WorkspaceStatus.ARCHIVED,
    });

    // Create a workspace deleted event object to be published
    const workspaceDeletedEvent: WorkspaceDeletedEvent = {
      id: workspaceId,
      deletedBy: ownerId,
      deletedAt: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the workspace deleted event
    await this.publisher.workspaceDeleted(workspaceDeletedEvent);

    // Return the deleted workspace
    return updatedWorkspace;
  }

  /**
   * Restore a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to restore
   * @param ownerId - The ID of the user who owns the workspace
   * @param ipAddress - The IP address of the user restoring the workspace (optional)
   * @returns The restored workspace record
   * @throws ConflictError if the workspace does not exist
   * @throws ForbiddenError if the user is not the owner of the workspace
   */
  async restoreWorkspace(workspaceId: string, ownerId: string, ipAddress?: string | null) {
    // Retrieve the workspace by its ID using the repository method
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, return null
    if (!workspace) {
      throw new ConflictError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Check if the user is the owner of the workspace
    await this.requireOwner(workspaceId, ownerId);

    // Restore the workspace using the repository method
    const updatedWorkspace = await this.workspaceRepository.update(workspaceId, {
      status: WorkspaceStatus.ACTIVE,
    });

    // Create a workspace restored event object to be published
    const workspaceRestoredEvent: WorkspaceUpdatedEvent = {
      id: updatedWorkspace.id,
      updatedBy: ownerId,
      changedFields: ['status'],
      updatedAt: updatedWorkspace.updatedAt,
      ipAddress: ipAddress || null,
    };

    // Publish the workspace restored event
    await this.publisher.workspaceUpdated(workspaceRestoredEvent);

    // Return the restored workspace
    return updatedWorkspace;
  }

  /**
   * Require the user to be a member of the workspace
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user
   * @returns The role of the user in the workspace
   * @throws ForbiddenError if the user is not a member of the workspace
   */
  private async requireMember(workspaceId: string, userId: string) {
    // Check if the user is a member of the workspace by finding their role using the WorkspaceMemberRepository
    const role = await this.workspaceMemberRepository.findRoleByUserId(workspaceId, userId);

    // If the user is not a member of the workspace, throw a ForbiddenError to indicate that access is denied
    if (!role) {
      throw new ForbiddenError('workspace.accessDenied', ERROR_CODE.WORKSPACE_ACCESS_DENIED);
    }

    // Return the role of the user in the workspace
    return role;
  }

  /**
   * Require the user to be the owner of the workspace
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user
   * @returns The workspace record if the user is the owner
   * @throws ConflictError if the workspace does not exist
   * @throws ForbiddenError if the user is not the owner of the workspace
   */
  private async requireOwner(workspaceId: string, userId: string) {
    // Check if the workspace exists by finding it using the WorkspaceRepository
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, throw a ConflictError to indicate that the workspace was not found
    if (!workspace) {
      throw new ConflictError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // If the user is not the owner of the workspace, throw a ForbiddenError to indicate that only the owner can perform this action
    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('workspace.ownerOnly', ERROR_CODE.WORKSPACE_OWNER_ONLY);
    }

    // Return the workspace record if the user is the owner
    return workspace;
  }
}
