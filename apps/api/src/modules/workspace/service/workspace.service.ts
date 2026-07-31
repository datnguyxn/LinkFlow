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
import type { MultipartFile } from '@fastify/multipart';
import { validateImage } from '../../users/validator/image.validator.ts';
import { extname } from 'path/win32';
import { STORAGE_FOLDER } from '../../../infrastructure/storage/constants.ts';
import { MinioStorageService } from '../../../infrastructure/storage/index.ts';
import { BadRequestError } from '../../../common/errors/index.ts';
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
    private storageService = new MinioStorageService(),
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

    // Generate presigned URLs for workspace logos if they exist
    for (const workspace of workspaces) {
      if (workspace.logoUrl != null) {
        // Generate a presigned URL for the workspace logo using the storage service
        if (workspace.logoUrl.startsWith('http') || workspace.logoUrl.startsWith('https')) {
          break; // If the logoUrl is already a full URL, skip generating a presigned URL
        }
        workspace.logoUrl = await this.storageService.getPresignedUrl(workspace.logoUrl, 60 * 60);
      }
    }

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
    const workspace = await this.workspaceRepository.findByWorkspaceIdAndUserId(
      workspaceId,
      ownerId,
    );

    // If the workspace does not exist, return null
    if (!workspace) {
      throw new NotFoundError('workspace.notFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Check if the user is a member of the workspace
    await this.requireMember(workspaceId, ownerId);

    // Generate a presigned URL for the workspace logo if it exists
    if (
      workspace.logoUrl &&
      !workspace.logoUrl.startsWith('http') &&
      !workspace.logoUrl.startsWith('https')
    ) {
      workspace.logoUrl = await this.storageService.getPresignedUrl(workspace.logoUrl, 60 * 60);
    }

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
      status: WorkspaceStatus.SUSPENDED,
    });

    // Retrieve all members of the workspace to include in the workspace deleted event
    const members = await this.workspaceMemberRepository.findAllByWorkspaceId(workspaceId);

    // Create a workspace deleted event object to be published
    const workspaceDeletedEvent: WorkspaceDeletedEvent = {
      id: workspaceId,
      workspaceName: workspace.name,
      ownerId: ownerId,
      members: members.map((member) => ({
        id: member.userId,
        name: member.user.fullName,
        email: member.user.email,
      })),
      deletedBy: members.find((member) => member.userId === ownerId)?.user.fullName || '',
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

  /**
   * Update the logo of a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to update the logo for
   * @param logoUrl - The new logo URL (optional)
   * @param file - The new logo file (optional)
   * @param ownerId - The ID of the user who owns the workspace
   * @param ipAddress - The IP address of the user updating the workspace logo (optional)
   * @returns The updated workspace record with the new logo URL
   * @throws NotFoundError if the workspace does not exist
   * @throws ForbiddenError if the user is not the owner of the workspace
   * @throws BadRequestError if neither a logo URL nor a file is provided for update
   */
  async updateWorkspaceLogo(
    workspaceId: string,
    logoUrl: string | null,
    file: MultipartFile | null,
    ownerId: string,
    ipAddress?: string | null,
  ) {
    // 1. Validate workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // 2. Validate workspace owner
    await this.requireOwner(workspaceId, ownerId);

    // Keep the old logo URL for cleanup after update
    const oldLogoUrl = workspace.logoUrl;

    let newLogoUrl: string | null = null;

    // 3. Update logo from URL
    if (logoUrl) {
      newLogoUrl = logoUrl;
    }

    // 4. Upload logo from file
    if (file) {
      const buffer = await validateImage(file);

      const fileName = `workspace-${workspaceId}-logo${extname(file.filename)}`;

      const folder = `${STORAGE_FOLDER.WORKSPACE}/${STORAGE_FOLDER.LOGO}/${workspaceId}`;

      const { objectKey } = await this.storageService.uploadFile({
        folder,
        fileName,
        mimeType: file.mimetype,
        buffer,
      });

      newLogoUrl = objectKey;
    }

    // 5. Make sure there is something to update
    if (!newLogoUrl) {
      throw new BadRequestError('workspace.logoRequired', ERROR_CODE.INVALID_REQUEST);
    }

    // 6. Update workspace
    const updatedWorkspace = await this.workspaceRepository.update(workspaceId, {
      logoUrl: newLogoUrl,
      updatedAt: new Date(),
    });

    // 7. Delete old logo from storage
    if (oldLogoUrl && oldLogoUrl !== newLogoUrl) {
      const oldObjectKey = oldLogoUrl.split('/').slice(-2).join('/');

      await this.storageService.deleteFile(oldObjectKey);
    }

    // 8. Publish workspace updated event
    const event: WorkspaceUpdatedEvent = {
      id: workspaceId,
      updatedBy: ownerId,
      changedFields: ['logoUrl'],
      updatedAt: updatedWorkspace.updatedAt,
      ipAddress: ipAddress || null,
    };

    await this.publisher.workspaceUpdated(event);

    const presignedUrl = await this.storageService.getPresignedUrl(newLogoUrl, 60 * 60); // Generate a presigned URL for the new logo

    // 9. Return updated workspace
    return {
      ...updatedWorkspace,
      logoUrl: presignedUrl, // Generate a presigned URL for the new logo
    };
  }

  /**
   * Delete the logo of a specific workspace by its ID and the owner's ID
   * @param workspaceId - The ID of the workspace to delete the logo for
   * @param ownerId - The ID of the user who owns the workspace
   * @param ipAddress - The IP address of the user deleting the workspace logo (optional)
   * @returns The updated workspace record with the logo URL set to null
   * @throws NotFoundError if the workspace does not exist
   * @throws ForbiddenError if the user is not the owner of the workspace
   */
  async deleteWorkspaceLogo(workspaceId: string, ownerId: string, ipAddress?: string | null) {
    // 1. Validate workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // 2. Validate workspace owner
    await this.requireOwner(workspaceId, ownerId);

    // Keep the old logo URL
    const oldLogoUrl = workspace.logoUrl;

    // 3. Remove logo URL from database
    const updatedWorkspace = await this.workspaceRepository.update(workspaceId, {
      logoUrl: null,
      updatedAt: new Date(),
    });

    // 4. Delete uploaded logo from MinIO if applicable
    if (oldLogoUrl && !oldLogoUrl.startsWith('http') && !oldLogoUrl.startsWith('https')) {
      await this.storageService.deleteFile(oldLogoUrl);
    }

    // 5. Publish workspace updated event
    const event: WorkspaceUpdatedEvent = {
      id: workspaceId,
      updatedBy: ownerId,
      changedFields: ['logoUrl'],
      updatedAt: updatedWorkspace.updatedAt,
      ipAddress: ipAddress || null,
    };

    await this.publisher.workspaceUpdated(event);

    // 6. Return updated workspace
    return updatedWorkspace;
  }
}
