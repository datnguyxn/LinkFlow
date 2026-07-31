import { WorkspaceMemberRepository } from '../repository/workspace-member.repository.ts';
import { WorkspaceRepository } from '../repository/workspace.repository.ts';
import { ConflictError, NotFoundError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import { WorkspaceMemberStatus } from '@prisma/client';
import { RoleRepository } from '../../role/repository/role.repository.ts';
import { UserRepository } from '../../users/repository/user.repository.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import type { WorkspaceOwnershipTransferredEvent } from '../../../events/index.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { WorkspaceMemberPublisher } from '../../../publishers/workspace-member/workspace-member.publisher.ts';
import type {
  WorkspaceMemberRoleUpdatedEvent,
  WorkspaceMemberLeaveEvent,
  WorkspaceMemberRemoveEvent,
} from '../../../events/index.ts';
import { MinioStorageService } from '../../../infrastructure/storage/index.ts';

/**
 * WorkspaceMemberService is responsible for managing workspace members and their roles.
 * It provides methods to transfer ownership of a workspace from one member to another, ensuring that the necessary validations and business rules are enforced.
 *
 * The service interacts with various repositories to perform database operations and uses a transaction service to ensure atomicity of the ownership transfer process.
 * It also publishes events related to workspace ownership transfer for further processing or notifications.
 */
export class WorkspaceMemberService {
  // The constructor initializes the WorkspaceMemberService with the necessary repositories, transaction service, and publisher for handling workspace member operations.
  constructor(
    private workspaceRepository: WorkspaceRepository = new WorkspaceRepository(),
    private workspaceMemberRepository: WorkspaceMemberRepository = new WorkspaceMemberRepository(),
    private roleRepository: RoleRepository = new RoleRepository(),
    private userRepository: UserRepository = new UserRepository(), // Assuming you have a UserRepository for user-related operations
    private transactionService: TransactionService = new TransactionService(), // Assuming you have a TransactionService for handling transactions
    private workspaceMemberPublisher: WorkspaceMemberPublisher = new WorkspaceMemberPublisher(
      new Publisher(),
    ),
    private storageService: MinioStorageService = new MinioStorageService(), // Assuming you have a MinioStorageService for handling storage operations
  ) {}

  /**
   * Transfers ownership of a workspace from the current owner to a new owner.
   * Flow:
   * 1. Validate that the workspace exists and that the current owner is indeed the owner of the workspace.
   * 2. Validate that the new owner is a member of the workspace and is active.
   * 3. Update the roles of the current owner and the new owner in the workspace.
   * 4. Update the workspace's owner to the new owner.
   * 5. Publish an event indicating that the ownership has been transferred.
   *
   * @param workspaceId - The ID of the workspace for which ownership is being transferred.
   * @param currentOwnerId - The ID of the current owner of the workspace.
   * @param newOwnerId - The ID of the new owner of the workspace.
   * @param ipAddress - The IP address of the request.
   * @returns An object containing the updated workspace and member information after the ownership transfer.
   * @throws NotFoundError - If the workspace, current owner, new owner, or roles are not found.
   * @throws ConflictError - If the current owner is not the actual owner, if the new owner is the same as the current owner, or if the new owner is not active.
   */
  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    newOwnerId: string,
    ipAddress?: string | null,
  ) {
    // Find the workspace by ID
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // Validate that the workspace exists
    if (!workspace) {
      throw new NotFoundError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Validate that the current owner is indeed the owner of the workspace
    if (workspace.ownerId !== currentOwnerId) {
      throw new ConflictError(
        'workspace.onlyOwnerCanTransferOwnership',
        ERROR_CODE.WORKSPACE_OWNER_REQUIRED,
      );
    }

    // Validate that the new owner is not the same as the current owner
    if (currentOwnerId === newOwnerId) {
      throw new ConflictError(
        'workspace.cannotTransferOwnershipToSelf',
        ERROR_CODE.CANNOT_TRANSFER_OWNERSHIP_TO_SELF,
      );
    }

    // Find the new owner in the workspace members
    const targetMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(
      workspaceId,
      newOwnerId,
    );

    // Validate that the new owner is a member of the workspace and is active
    if (!targetMember) {
      throw new NotFoundError('workspace.memberNotFound', ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND);
    }

    // Validate that the new owner is active
    if (targetMember.status !== WorkspaceMemberStatus.ACTIVE) {
      throw new ConflictError('workspace.memberNotActive', ERROR_CODE.WORKSPACE_MEMBER_NOT_ACTIVE);
    }

    // Find the roles for OWNER
    const ownerRole = await this.roleRepository.findByName('OWNER');

    // Find the role for MEMBER
    const memberRole = await this.roleRepository.findByName('MEMBER');

    // Validate that both roles exist
    if (!ownerRole || !memberRole) {
      throw new NotFoundError('workspace.roleNotFound', ERROR_CODE.ROLE_NOT_FOUND);
    }

    // Find the current owner and new owner users
    const currentOwner = await this.userRepository.findById(currentOwnerId);

    // Validate that both the current owner and new owner exist
    const newOwner = await this.userRepository.findById(newOwnerId);

    // Validate that both the current owner and new owner exist
    if (!currentOwner || !newOwner) {
      throw new NotFoundError('user.userNotFound', ERROR_CODE.USER_UNAVAILABLE);
    }

    // Perform the ownership transfer within a transaction to ensure atomicity
    const result = await this.transactionService.run(async (tx) => {
      /**
       * Previous Owner
       * OWNER → MEMBER
       */
      const previousOwnerMember = await this.workspaceMemberRepository.updateRole(
        workspaceId,
        currentOwnerId,
        memberRole.id,
        tx,
      );

      /**
       * Target Member
       * MEMBER → OWNER
       */
      const newOwnerMember = await this.workspaceMemberRepository.updateRole(
        workspaceId,
        newOwnerId,
        ownerRole.id,
        tx,
      );

      // Update the workspace's owner to the new owner
      const updatedWorkspace = await this.workspaceRepository.updateOwner(
        workspaceId,
        newOwnerId,
        tx,
      );

      // Return the updated members and workspace after the ownership transfer
      return {
        previousOwnerMember,
        newOwnerMember,
        updatedWorkspace,
      };
    });

    // Prepare the event data for publishing the ownership transfer event
    const event: WorkspaceOwnershipTransferredEvent = {
      workspaceId: workspace.id, // The ID of the workspace for which ownership is being transferred
      workspaceName: workspace.name, // The name of the workspace for which ownership is being transferred

      // Details of the previous owner and new owner involved in the ownership transfer
      previousOwner: {
        userId: currentOwner.id, // The ID of the current owner of the workspace
        name: this.getUserName(currentOwner), // The name of the current owner of the workspace (either full name or email)
        email: currentOwner.email, // The email of the current owner of the workspace
        newRole: 'MEMBER', // The new role of the current owner after the ownership transfer (changed to MEMBER)
      },

      // Details of the new owner involved in the ownership transfer
      newOwner: {
        userId: newOwner.id, // The ID of the new owner of the workspace
        name: this.getUserName(newOwner), // The name of the new owner of the workspace (either full name or email)
        email: newOwner.email, // The email of the new owner of the workspace
        newRole: 'OWNER', // The new role of the new owner after the ownership transfer (changed to OWNER)
      },

      transferredAt: new Date(), // The timestamp indicating when the ownership transfer occurred

      ipAddress, // The IP address of the request that initiated the ownership transfer (optional)
    };

    // Publish the ownership transfer event to notify other parts of the system about the change
    await this.workspaceMemberPublisher.workspaceOwnershipTransferred(event);

    // Return the result of the ownership transfer operation, including the updated members and workspace
    return result;
  }

  /**
   * Lists all members of a specified workspace.
   * @param workspaceId - The ID of the workspace for which to list members.
   * @param page - The page number for pagination (1-based index).
   * @param limit - The number of items per page for pagination.
   * @param search - Optional search term to filter members by user full name or email.
   * @returns An array of workspace members belonging to the specified workspace.
   * @throws NotFoundError - If the workspace does not exist.
   */
  async listWorkspaceMembers(workspaceId: string, page: number, limit: number, search?: string) {
    // Validate that the workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // Validate that the workspace exists
    if (!workspace) {
      throw new NotFoundError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Retrieve and return all members of the specified workspace
    const result = await this.workspaceMemberRepository.findAllByWorkspaceIdWithPagination(
      workspaceId,
      page,
      limit,
      search,
    );

    await Promise.all(
      result.members.map(async (member) => {
        // Ensure that the member's user object has a valid avatarUrl, defaulting to null if not present
        if (
          member.user.avatarUrl &&
          !member.user.avatarUrl.startsWith('http') &&
          !member.user.avatarUrl.startsWith('https')
        ) {
          member.user.avatarUrl = await this.storageService.getPresignedUrl(
            member.user.avatarUrl,
            60 * 60,
          ); // Generate a presigned URL for the avatar with a 1-hour expiration
        }
      }),
    );

    return result;
  }
  /**
   * Retrieves a specific workspace member by workspace ID and user ID.
   * @param workspaceId - The ID of the workspace to which the member belongs.
   * @param userId - The ID of the user whose membership information is being retrieved.
   * @returns The workspace member object corresponding to the specified workspace and user.
   * @throws NotFoundError - If the workspace member does not exist.
   */
  async getWorkspaceMember(workspaceId: string, userId: string) {
    // Find the workspace member by workspace ID and user ID
    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);

    // Validate that the workspace member exists
    if (!member) {
      throw new NotFoundError('workspace.memberNotFound', ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND);
    }

    if (
      member.user.avatarUrl &&
      !member.user.avatarUrl.startsWith('http') &&
      !member.user.avatarUrl.startsWith('https')
    ) {
      member.user.avatarUrl = await this.storageService.getPresignedUrl(
        member.user.avatarUrl,
        60 * 60,
      ); // Generate a presigned URL for the avatar with a 1-hour expiration
    }

    // Return the workspace member object
    return member;
  }

  /**
   * Updates the role of a workspace member.
   * @param workspaceId - The ID of the workspace to which the member belongs.
   * @param userId - The ID of the user whose role is being updated.
   * @param newRoleId - The ID of the new role to be assigned to the workspace member.
   * @param ipAddress - The IP address of the request (optional).
   * @returns The updated workspace member object after the role update.  
   * @throws NotFoundError - If the workspace member or new role does not exist.
   * @throws ConflictError - If the new role is the same as the current role or if the new role is OWNER (ownership transfer should be used instead).
   */
  async updateWorkspaceMemberRole(
    workspaceId: string,
    userId: string,
    newRoleId: string,
    ipAddress: string | null,
  ) {
    // Find the workspace member
    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);

    // Validate that the member exists
    if (!member) {
      throw new NotFoundError('workspace.memberNotFound', ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND);
    }

    // Validate the new role
    const newRole = await this.roleRepository.findById(newRoleId);

    // Validate that the new role exists
    if (!newRole) {
      throw new NotFoundError('workspace.roleNotFound', ERROR_CODE.ROLE_NOT_FOUND);
    }

    // Prevent updating to the same role
    if (member.roleId === newRoleId) {
      throw new ConflictError('workspace.memberAlreadyHasRole', ERROR_CODE.MEMBER_ALREADY_HAS_ROLE);
    }

    // Prevent updating to OWNER role directly; ownership transfer should be used instead
    if (newRole.name === 'OWNER') {
      throw new ConflictError(
        'workspace.ownerRoleRequiresTransfer',
        ERROR_CODE.OWNER_ROLE_REQUIRES_TRANSFER,
      );
    }

    // Update member role
    const updatedMember = await this.workspaceMemberRepository.updateRole(
      workspaceId,
      userId,
      newRoleId,
    );

    // Publish event
    const event: WorkspaceMemberRoleUpdatedEvent = {
      workspaceId, // The ID of the workspace where the member's role is being updated
      workspaceName: member.workspace.name, // The name of the workspace where the member's role is being updated
      slug: member.workspace.slug, // The slug of the workspace where the member's role is being updated

      memberId: member.id, // The ID of the workspace member whose role is being updated
      userId: member.userId, // The ID of the user associated with the workspace member whose role is being updated

      memberName: this.getUserName(member.user), // The name of the workspace member whose role is being updated (either full name or email)

      memberEmail: member.user.email, // The email of the workspace member whose role is being updated

      previousRoleId: member.roleId, // The ID of the previous role of the workspace member before the role update
      previousRoleName: member.role.name, // The name of the previous role of the workspace member before the role update

      newRoleId: newRole.id, // The ID of the new role being assigned to the workspace member
      newRoleName: newRole.name, // The name of the new role being assigned to the workspace member

      updatedAt: updatedMember.updatedAt, // The timestamp indicating when the workspace member's role was updated

      ipAddress, // The IP address of the request that initiated the role update (optional)
    };

    // Publish the workspace member role updated event to notify other parts of the system about the role change
    await this.workspaceMemberPublisher.workspaceMemberRoleUpdated(event);

    // Return the updated member object after the role update
    return updatedMember;
  }

  /**
   * Allows a user to leave a workspace.
   * @param workspaceId - The ID of the workspace the user wants to leave.
   * @param userId - The ID of the user who wants to leave the workspace.
   * @param ipAddress - The IP address of the request (optional).
   * @returns The updated workspace member object after leaving the workspace.
   * @throws NotFoundError - If the workspace member does not exist.
   * @throws ConflictError - If the user is the owner of the workspace and cannot leave without transferring ownership first.
   */
  async leaveWorkspace(workspaceId: string, userId: string, ipAddress?: string | null) {
    // Find the workspace member by workspace ID and user ID
    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);

    // Validate that the workspace member exists
    if (!member) {
      throw new NotFoundError('workspace.memberNotFound', ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND);
    }

    // Prevent the owner from leaving the workspace without transferring ownership first
    if (member.role.name === 'OWNER') {
      throw new ConflictError(
        'workspace.transferOwnershipBeforeLeaving',
        ERROR_CODE.TRANSFER_OWNERSHIP_BEFORE_LEAVING,
      );
    }

    const owner = await this.userRepository.findById(member.workspace.ownerId);

    if (!owner) {
      throw new NotFoundError('user.userUnavailable', ERROR_CODE.USER_UNAVAILABLE);
    }

    // Update the workspace member's status to LEFT and set the deletedAt timestamp
    const deletedMember = await this.workspaceMemberRepository.update(workspaceId, userId, {
      status: WorkspaceMemberStatus.LEFT,
      deletedAt: new Date(),
    });

    // Prepare the event data for publishing the workspace member leave event
    const event: WorkspaceMemberLeaveEvent = {
      workspaceId: member.workspaceId, // The ID of the workspace from which the member is leaving
      workspaceName: member.workspace.name, // The name of the workspace from which the member is leaving
      userId: member.userId, // The ID of the user who is leaving the workspace
      memberId: member.id, // The ID of the workspace member record that is being updated to LEFT status
      ownerId: owner.id, // The ID of the owner of the workspace, used in the email template to inform the member about who is managing the workspace they are leaving.
      ownerName: owner.fullName || owner.email, // The name of the owner of the workspace, used in the email template to inform the member about who is managing the workspace they are leaving.
      ownerEmail: owner.email, // The email of the owner of the workspace, used in the email template to inform the member about who is managing the workspace they are leaving.
      email: member.user.email, // The email of the user who is leaving the workspace
      fullName: this.getUserName(member.user), // The full name of the user who is leaving the workspace (or email if full name is not available)
      role: member.role.name, // The role of the user in the workspace before leaving (e.g., MEMBER, OWNER)
      deleteAt: deletedMember.deletedAt || undefined, // The timestamp indicating when the member's status was updated to LEFT (or undefined if not set)
      ipAddress: ipAddress || undefined, // The IP address of the request that initiated the leave action (or undefined if not provided)
    };

    // Publish the workspace member leave event to notify other parts of the system about the member leaving the workspace
    await this.workspaceMemberPublisher.workspaceMemberLeave(event);

    // Return the updated workspace member object after the leave action
    return deletedMember;
  }

  /**
   * Removes a member from a workspace.
   * @param workspaceId - The ID of the workspace from which the member is being removed.
   * @param userId - The ID of the user who is being removed from the workspace.
   * @param ipAddress - The IP address of the request (optional).
   * @returns The updated workspace member object after the removal action.
   * @throws NotFoundError - If the workspace member does not exist.
   * @throws ConflictError - If the user is the owner of the workspace and cannot be removed without transferring ownership first.
   */
  async removeWorkspaceMember(workspaceId: string, userId: string, ipAddress?: string | null) {
    // Find the workspace member by workspace ID and user ID
    const member = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId);

    // Validate that the workspace member exists
    if (!member) {
      throw new NotFoundError('workspace.memberNotFound', ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND);
    }

    // Prevent the owner from being removed without transferring ownership first
    if (member.role.name === 'OWNER') {
      throw new ConflictError(
        'workspace.transferOwnershipBeforeRemoving',
        ERROR_CODE.TRANSFER_OWNERSHIP_BEFORE_REMOVING,
      );
    }

    const owner = await this.userRepository.findById(member.workspace.ownerId);

    if (!owner) {
      throw new NotFoundError('user.userUnavailable', ERROR_CODE.USER_UNAVAILABLE);
    }

    // Update the workspace member's status to LEFT and set the deletedAt timestamp
    const deletedMember = await this.workspaceMemberRepository.update(workspaceId, userId, {
      status: WorkspaceMemberStatus.REMOVED,
      deletedAt: new Date(),
    });

    // Prepare the event data for publishing the workspace member removal event
    const event: WorkspaceMemberRemoveEvent = {
      workspaceId: member.workspaceId, // The ID of the workspace from which the member is being removed
      workspaceName: member.workspace.name, // The name of the workspace from which the member is being removed
      userId: member.userId, // The ID of the user who is being removed from the workspace
      memberId: member.id, // The ID of the workspace member record that is being updated to REMOVED status
      ownerName: owner.fullName || owner.email, // The name of the owner of the workspace, used in the email template to inform the member about who is managing the workspace they are being removed from.
      email: member.user.email, // The email of the user who is being removed from the workspace
      fullName: this.getUserName(member.user), // The full name of the user who is being removed from the workspace (or email if full name is not available)
      role: member.role.name, // The role of the user in the workspace before removal (e.g., MEMBER, OWNER)
      deleteAt: deletedMember.deletedAt || undefined, // The timestamp indicating when the member's status was updated to REMOVED (or undefined if not set)
      ipAddress: ipAddress || undefined, // The IP address of the request that initiated the removal action (or undefined if not provided)
    };

    // Publish the workspace member removal event to notify other parts of the system about the member being removed from the workspace
    await this.workspaceMemberPublisher.workspaceMemberRemove(event);

    // Return the updated workspace member object after the removal action
    return deletedMember;
  }

  /**
   * Helper method to get the user's name. If the full name is available, it returns that; otherwise, it returns the email.
   * @param user - The user object containing fullName and email properties.
   * @returns The user's name (full name or email).
   */
  private getUserName(user: { fullName: string | null; email: string }) {
    // Return the user's full name if available; otherwise, return the email
    return user.fullName || user.email;
  }
}
