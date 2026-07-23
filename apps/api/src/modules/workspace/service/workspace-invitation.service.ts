import { WorkspaceRepository } from '../repository/workspace.repository.ts';
import { WorkspaceInvitationRepository } from '../repository/workspace-invitation.repository.ts';
import { WorkspaceMemberRepository } from '../repository/workspace-member.repository.ts';
import { RoleRepository } from '../../role/repository/role.repository.ts';
import { UserRepository } from '../../users/repository/user.repository.ts';
import type { CreateWorkspaceInvitationInput } from '../validator/workspace-invitation.validator.ts';
import { ConflictError, NotFoundError, GoneError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/error.constant.ts';
import { UserStatus, WorkspaceMemberStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';
import { WorkspaceInvitationPublisher } from '../../../publishers/workspace-invitation/workspace-invitation.publisher.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import type {
  WorkspaceInvitationCreatedEvent,
  WorkspaceInvitationUpdatedEvent,
} from '../../../events/index.ts';
import { InvitationStatus } from '@prisma/client';
import { TransactionService } from '../../../infrastructure/database/index.ts';

/**
 * WorkspaceInvitationService handles the business logic for creating workspace invitations.
 * It interacts with repositories to manage workspace, user, role, and invitation data, and publishes events when invitations are created.
 */
export class WorkspaceInvitationService {
  /**
   * Constructor initializes the service with required repositories and publishers.
   * @param workspaceRepository - Repository for workspace data.
   * @param workspaceInvitationRepository - Repository for workspace invitation data.
   * @param workspaceMemberRepository - Repository for workspace member data.
   * @param roleRepository - Repository for role data.
   * @param userRepository - Repository for user data.
   * @param workspaceInvitationPublisher - Publisher for workspace invitation events.
   * @param transactionService - Service for handling database transactions.
   */
  constructor(
    // Initialize repositories and publishers for handling workspace invitations
    private workspaceRepository: WorkspaceRepository = new WorkspaceRepository(),
    private workspaceInvitationRepository: WorkspaceInvitationRepository = new WorkspaceInvitationRepository(),
    private workspaceMemberRepository: WorkspaceMemberRepository = new WorkspaceMemberRepository(),
    private roleRepository: RoleRepository = new RoleRepository(),
    private userRepository: UserRepository = new UserRepository(),
    private workspaceInvitationPublisher: WorkspaceInvitationPublisher = new WorkspaceInvitationPublisher(
      new Publisher(),
    ),
    private transactionService: TransactionService = new TransactionService(),
  ) {}

  /**
   * Creates a new workspace invitation.
   * Flow:
   * 1. Validates the existence of the workspace and the inviter's permissions.
   * 2. Checks if the invitee is already a member or has a pending invitation.
   * 3. Creates a new invitation and publishes an event for notification.
   *
   * @param workspaceId - The ID of the workspace to which the invitation is being sent.
   * @param inviterId - The ID of the user sending the invitation.
   * @param input - The input data for creating the invitation, including invitee email and role ID.
   * @param ipAddress - The IP address from which the invitation request originated.
   * @returns The created workspace invitation or throws an error if creation fails.
   */
  async createInvitation(
    workspaceId: string,
    inviterId: string,
    input: CreateWorkspaceInvitationInput,
    ipAddress: string,
  ) {
    // Validate the existence of the workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, throw a NotFoundError indicating that the workspace was not found
    if (!workspace) {
      throw new NotFoundError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Validate the existence of the inviter in the user repository
    const inviterMember = await this.userRepository.findById(inviterId);

    // If the inviter does not exist, throw a NotFoundError indicating that the inviter was not found
    if (!inviterMember) {
      throw new NotFoundError('workspace.inviterNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Check if the invitee already exists in the user repository by email
    const invitee = await this.userRepository.findByEmail(input.email);

    // If the invitee exists, check if they are already a member of the workspace
    if (invitee?.status === UserStatus.ACTIVE) {
      // Check if the existing user is already an active member of the workspace
      const existingMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(
        workspaceId,
        invitee.id,
      );

      // If the existing member is active, throw a ConflictError indicating that the user is already a member of the workspace
      if (existingMember?.status === WorkspaceMemberStatus.ACTIVE) {
        throw new ConflictError(
          'workspace.userAlreadyMember',
          ERROR_CODE.WORKSPACE_MEMBER_ALREADY_EXISTS,
        );
      }
    } else {
      throw new NotFoundError('workspace.inviteeNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Check if there is already a pending invitation for the invitee's email in the workspace
    const existingInvitation = await this.workspaceInvitationRepository.findPendingByEmail(
      workspaceId,
      input.email,
    );

    // If there is an existing pending invitation, throw a ConflictError indicating that the invitation already exists
    if (existingInvitation) {
      if (existingInvitation.expiresAt < new Date()) {
        // If the existing invitation has expired, update its status to "EXPIRED"
        await this.handleInvitationExpired(
          {
            id: existingInvitation.id,
            workspaceId: existingInvitation.workspaceId,
            workspaceName: workspace.name,
            inviterId: existingInvitation.inviterId,
            inviterName: inviterMember.fullName || inviterMember.email,
            inviterEmail: inviterMember.email,
            inviteeId: invitee ? invitee.id : '',
            inviteeName: invitee ? invitee.fullName || invitee.email : '',
            inviteeEmail: existingInvitation.email,
            roleName: existingInvitation.role.name,
            previousStatus: existingInvitation.status,
          },
          ipAddress,
        );

        throw new GoneError('workspace.invitationExpired', ERROR_CODE.INVITATION_EXPIRED);
      } else {
        throw new ConflictError(
          'workspace.invitationAlreadyExists',
          ERROR_CODE.INVITATION_ALREADY_EXISTS,
        );
      }
    }

    // Validate the existence of the role specified in the invitation input
    const role = await this.roleRepository.findById(input.roleId);

    // If the role does not exist, throw a ConflictError indicating that the role was not found
    if (!role) {
      throw new ConflictError('workspace.roleNotFound', ERROR_CODE.ROLE_NOT_FOUND);
    }

    // Generate a unique token for the invitation
    const token = randomUUID();

    // Create the workspace invitation in the repository with the provided details
    const invitation = await this.workspaceInvitationRepository.create({
      workspace: {
        connect: {
          id: workspaceId, // Connect the invitation to the specified workspace
        },
      },
      inviter: {
        connect: {
          id: inviterId, // Connect the invitation to the inviter's user ID
        },
      },
      role: {
        connect: {
          id: input.roleId, // Connect the invitation to the specified role ID
        },
      },
      ...(invitee && {
        user: {
          connect: {
            id: invitee.id, // Connect the invitation to the existing user's ID if the user exists
          },
        },
      }),
      token: token, // Set the generated token for the invitation
      email: input.email, // Set the invitee's email for the invitation
      expiresAt: addDays(new Date(), 7), // Set the expiration date for the invitation to 7 days from now
    });

    // Prepare the event data for the workspace invitation created event
    const event: WorkspaceInvitationCreatedEvent = {
      invitationId: invitation.id, // Set the ID of the created invitation
      workspaceId: workspace.id, // Set the ID of the workspace associated with the invitation
      workspaceName: workspace.name, // Set the name of the workspace associated with the invitation
      inviterId: inviterId, // Set the ID of the inviter who created the invitation
      inviterName: inviterMember.fullName || inviterMember.email, // Set the name of the inviter, using full name if available, otherwise use email
      inviteeId: invitee ? invitee.id : '', // Set the ID of the invitee if the user exists, otherwise set it to an empty string
      inviteeEmail: input.email, // Set the email of the invitee for the invitation
      inviteeName: invitee ? invitee.fullName || invitee.email : '', // Set the name of the invitee if the user exists, using full name if available, otherwise use email; if user does not exist, set it to an empty string
      roleId: role.id, // Set the ID of the role associated with the invitation
      roleName: role.name, // Set the name of the role associated with the invitation
      ipAddress: ipAddress, // Set the IP address from which the invitation request originated
      token: token, // Set the generated token for the invitation
    };

    // Publish the workspace invitation created event to notify other services or components
    await this.workspaceInvitationPublisher.workspaceInvitationCreated(event);

    // Return the created invitation to the caller
    return invitation;
  }

  /**
   * Lists all invitations for a specific workspace.
   * Flow:
   * 1. Validates the existence of the workspace.
   * 2. Fetches and returns all invitations associated with the workspace.
   *
   * @param workspaceId - The ID of the workspace for which to list invitations.
   * @returns An array of workspace invitations or throws an error if the workspace does not exist.
   */
  async listInvitations(workspaceId: string) {
    // Validate the existence of the workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, throw a ConflictError indicating that the workspace was not found
    if (!workspace) {
      throw new ConflictError('workspace.workspaceNotFound', ERROR_CODE.WORKSPACE_NOT_FOUND);
    }

    // Fetch and return the list of invitations for the specified workspace
    const invitations = await this.workspaceInvitationRepository.findAllByWorkspaceId(workspaceId);

    // Return the list of invitations to the caller
    return invitations;
  }

  /**
   * Retrieves a specific invitation by its ID.
   * Flow:
   * 1. Fetches the invitation from the repository using the provided invitation ID.
   * 2. If the invitation does not exist, throws a ConflictError indicating that the invitation was not found.
   * 3. Returns the fetched invitation to the caller.
   *
   * @param invitationId - The ID of the invitation to retrieve.
   * @returns The workspace invitation if found, otherwise throws an error.
   */
  async getInvitationById(invitationId: string) {
    // Fetch the invitation by its ID from the repository
    const invitation = await this.workspaceInvitationRepository.findById(invitationId);

    // If the invitation does not exist, throw a ConflictError indicating that the invitation was not found
    if (!invitation) {
      throw new ConflictError('workspace.invitationNotFound', ERROR_CODE.INVITATION_NOT_FOUND);
    }

    // Return the fetched invitation to the caller
    return invitation;
  }

  /**
   * Accepts a workspace invitation for a user.
   * Flow:
   * 1. Validates the existence of the invitation and checks its status.
   * 2. If the invitation is valid, creates a new workspace member for the user.
   * 3. Updates the invitation status to "ACCEPTED" and publishes an event for notification.
   *
   * @param workspaceId - The ID of the workspace associated with the invitation.
   * @param invitationId - The ID of the invitation to accept.
   * @param userId - The ID of the user accepting the invitation.
   * @param ipAddress - The IP address from which the acceptance request originated.
   * @returns An object containing the created workspace member and updated invitation, or throws an error if acceptance fails.
   */
  async acceptInvitation(
    workspaceId: string,
    invitationId: string,
    userId: string,
    ipAddress: string | null,
    token: string,
  ) {
    // Validate the invitation for acceptance by checking its existence, status, and expiration
    const invitation = await this.validateInvitationForAccept(token);

    // If the invitation does not exist, throw a NotFoundError indicating that the invitation was not found
    if (!invitation) {
      throw new NotFoundError('workspace.invitationNotFound', ERROR_CODE.INVITATION_NOT_FOUND);
    }

    // Use a transaction to create a new workspace member and update the invitation status atomically
    const result = await this.transactionService.run(async (tx) => {
      const workspaceMember = await this.workspaceMemberRepository.create(
        {
          workspace: {
            connect: {
              id: workspaceId, // Connect the new workspace member to the specified workspace
            },
          },

          user: {
            connect: {
              id: userId, // Connect the new workspace member to the specified user
            },
          },

          role: {
            connect: {
              id: invitation.roleId, // Connect the new workspace member to the role specified in the invitation
            },
          },

          status: WorkspaceMemberStatus.ACTIVE, // Set the status of the new workspace member to ACTIVE
        },
        tx,
      );

      const updatedInvitation = await this.workspaceInvitationRepository.updateStatus(
        invitation.id, // Update the status of the invitation to ACCEPTED
        InvitationStatus.ACCEPTED, // Update the status of the invitation to ACCEPTED
        tx,
      );

      return {
        workspaceMember,
        updatedInvitation,
      };
    });

    // Prepare the event data for the workspace invitation updated event
    const event: WorkspaceInvitationUpdatedEvent = {
      invitationId: result.updatedInvitation.id,
      workspaceId: invitation.workspace.id,
      workspaceName: invitation.workspace.name,
      inviterId: invitation.inviter.id,
      inviterName: invitation.inviter.fullName || invitation.inviter.email,
      inviterEmail: invitation.inviter.email,
      inviteeId: invitation.user!.id,
      inviteeName: invitation.user!.fullName || invitation.user!.email,
      inviteeEmail: invitation.user!.email,
      roleName: invitation.role.name,
      previousStatus: invitation.status,
      status: InvitationStatus.ACCEPTED,
      updatedAt: result.updatedInvitation.updatedAt,
      acceptedAt: result.updatedInvitation.acceptedAt,
      ipAddress,
    };

    // Publish the workspace invitation updated event to notify other services or components
    await this.workspaceInvitationPublisher.workspaceInvitationAccepted(event);

    // Return the result containing the created workspace member and updated invitation to the caller
    return result;
  }

  /**
   * Validates a workspace invitation for acceptance.
   * Flow:
   * 1. Fetches the invitation by its token from the repository.
   * 2. Checks if the invitation exists, is in PENDING status, and has not expired.
   * 3. Throws appropriate errors if the invitation is invalid or has already been processed.
   *
   * @param token - The unique token associated with the workspace invitation.
   * @returns The valid workspace invitation if found, otherwise throws an error.
   */
  private async validateInvitationForAccept(token: string) {
    // Fetch the invitation by its token from the repository
    const invitation = await this.workspaceInvitationRepository.findByToken(token);

    // If the invitation does not exist, throw a NotFoundError indicating that the invitation was not found
    if (!invitation) {
      throw new NotFoundError('workspace.invitationNotFound', ERROR_CODE.INVITATION_NOT_FOUND);
    }

    // Check if the invitation has already been processed (i.e., not in PENDING status)
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictError(
        'workspace.invitationAlreadyProcessed',
        ERROR_CODE.INVITATION_ALREADY_PROCESSED,
      );
    }

    // Check if the invitation has expired by comparing its expiration date with the current date
    if (invitation.expiresAt < new Date()) {
      await this.handleInvitationExpired(
        {
          id: invitation.id,
          workspaceId: invitation.workspaceId,
          workspaceName: invitation.workspace.name,
          inviterId: invitation.inviterId,
          inviterName: invitation.inviter.fullName || invitation.inviter.email,
          inviterEmail: invitation.inviter.email,
          inviteeId: invitation.userId || '',
          inviteeName: invitation.user?.fullName || invitation.user?.email || '',
          inviteeEmail: invitation.email,
          roleName: invitation.role.name,
          previousStatus: invitation.status,
        },
        null,
      );

      throw new GoneError('workspace.invitationExpired', ERROR_CODE.INVITATION_EXPIRED);
    }

    // Return the valid invitation to the caller
    return invitation;
  }

  /**
   * Validates a workspace invitation for acceptance.
   * Flow:
   * 1. Fetches the invitation by its token from the repository.
   * 2. Checks if the invitation exists, is in PENDING status, and has not expired.
   * 3. Throws appropriate errors if the invitation is invalid or has already been processed.
   *
   * @param token - The unique token associated with the workspace invitation.
   * @returns The valid workspace invitation if found, otherwise throws an error.
   */
  async validateInvitation(token: string) {
    // Validate the invitation for acceptance by checking its existence, status, and expiration
    return this.validateInvitationForAccept(token);
  }

  /**
   * Handles the expiration of a workspace invitation.
   * Flow:
   * 1. Updates the status of the existing invitation to "EXPIRED" in the repository.
   * 2. Prepares the event data for the workspace invitation updated event with the new status "EXPIRED".
   * 3. Publishes the workspace invitation updated event to notify other services or components about the expiration.
   *
   * @param existingInvitation - The existing invitation object containing relevant details for expiration handling.
   * @param ipAddress - The IP address from which the expiration request originated.
   */
  private async handleInvitationExpired(
    existingInvitation: {
      id: string;
      workspaceId: string;
      workspaceName: string;
      inviterId: string;
      inviterName: string;
      inviterEmail: string;
      inviteeId: string;
      inviteeName: string;
      inviteeEmail: string;
      roleName: string;
      previousStatus: InvitationStatus;
    },
    ipAddress: string | null,
  ) {
    // Update the status of the existing invitation to "EXPIRED" in the repository
    const updatedInvitation = await this.workspaceInvitationRepository.updateStatus(
      existingInvitation.id,
      InvitationStatus.EXPIRED,
    );

    // Prepare the event data for the workspace invitation updated event with the new status "EXPIRED"
    const event: WorkspaceInvitationUpdatedEvent = {
      invitationId: existingInvitation.id, // Set the ID of the existing invitation
      workspaceId: existingInvitation.workspaceId, // Set the ID of the workspace associated with the invitation
      workspaceName: existingInvitation.workspaceName, // Set the name of the workspace associated with the invitation
      inviterId: existingInvitation.inviterId, // Set the ID of the inviter who created the invitation
      inviterName: existingInvitation.inviterName, // Set the name of the inviter who created the invitation
      inviterEmail: existingInvitation.inviterEmail, // Set the email of the inviter who created the invitation
      inviteeId: existingInvitation.inviteeId, // Set the ID of the invitee associated with the invitation
      inviteeName: existingInvitation.inviteeName, // Set the name of the invitee associated with the invitation
      inviteeEmail: existingInvitation.inviteeEmail, // Set the email of the invitee associated with the invitation
      roleName: existingInvitation.roleName, // Set the name of the role associated with the invitation
      previousStatus: existingInvitation.previousStatus, // Set the previous status of the invitation before it was updated
      status: InvitationStatus.EXPIRED, // Set the new status of the invitation to "EXPIRED"
      updatedAt: updatedInvitation.updatedAt, // Set the timestamp for when the invitation was updated
      expiresAt: updatedInvitation.expiresAt, // Set the expiration timestamp for the invitation to the current date and time
      ipAddress: ipAddress, // Set the IP address from which the expiration request originated
    };

    // Publish the workspace invitation updated event to notify other services or components about the expiration
    await this.workspaceInvitationPublisher.workspaceInvitationExpired(event);
  }

  /**
   * Revokes a workspace invitation.
   * Flow:
   * 1. Validates the existence of the workspace and the invitation.
   * 2. Updates the status of the invitation to "REVOKED" in the repository.
   * 3. Prepares the event data for the workspace invitation updated event with the new status "REVOKED".
   * 4. Publishes the workspace invitation updated event to notify other services or components about the revocation.
   *
   * @param workspaceId - The ID of the workspace associated with the invitation.
   * @param invitationId - The ID of the invitation to revoke.
   * @param ipAddress - The IP address from which the revocation request originated.
   */
  async revokeInvitation(workspaceId: string, invitationId: string, ipAddress: string | null) {
    // Validate the existence of the workspace
    const workspace = await this.workspaceRepository.findById(workspaceId);

    // If the workspace does not exist, throw a NotFoundError indicating that the workspace was not found
    const invitation = await this.workspaceInvitationRepository.findById(invitationId);

    // If the invitation does not exist, throw a NotFoundError indicating that the invitation was not found
    if (!invitation) {
      throw new NotFoundError('workspace.invitationNotFound', ERROR_CODE.INVITATION_NOT_FOUND);
    }

    // Update the status of the invitation to "REVOKED" in the repository
    const updatedInvitation = await this.workspaceInvitationRepository.updateStatus(
      invitationId,
      InvitationStatus.REVOKED,
    );

    // Prepare the event data for the workspace invitation updated event with the new status "REVOKED"
    const event: WorkspaceInvitationUpdatedEvent = {
      invitationId: invitation.id, // Set the ID of the invitation being revoked
      workspaceId: workspaceId, // Set the ID of the workspace associated with the invitation
      workspaceName: workspace == null ? '' : workspace.name, // Set the name of the workspace associated with the invitation, or an empty string if the workspace is null
      inviterId: invitation.inviter.id, // Set the ID of the inviter who created the invitation
      inviterName: invitation.inviter.fullName || invitation.inviter.email, // Set the name of the inviter who created the invitation, using full name if available, otherwise use email
      inviterEmail: invitation.inviter.email, // Set the email of the inviter who created the invitation
      inviteeId: invitation.userId || '', // Set the ID of the invitee associated with the invitation, or an empty string if the user ID is null
      inviteeName: invitation.user?.fullName || '', // Set the name of the invitee associated with the invitation, using full name if available, otherwise use an empty string
      inviteeEmail: invitation.email, // Set the email of the invitee associated with the invitation
      roleName: invitation.role.name, // Set the name of the role associated with the invitation
      previousStatus: invitation.status, // Set the previous status of the invitation before it was updated
      status: InvitationStatus.REVOKED, // Set the new status of the invitation to "REVOKED"
      updatedAt: updatedInvitation.updatedAt, // Set the timestamp for when the invitation was updated
      revokedAt: updatedInvitation.revokedAt, // Set the timestamp for when the invitation was revoked
      ipAddress,
    };

    // Publish the workspace invitation updated event to notify other services or components about the revocation
    await this.workspaceInvitationPublisher.workspaceInvitationRevoked(event);

    return updatedInvitation;
  }

  /**
   * Rejects a workspace invitation for a user.
   * Flow:
   * 1. Validates the existence of the invitation and checks its status.
   * 2. If the invitation is valid, updates the invitation status to "DECLINED".
   * 3. Prepares the event data for the workspace invitation updated event with the new status "DECLINED".
   * 4. Publishes the workspace invitation updated event to notify other services or components about the rejection.
   *
   * @param workspaceId - The ID of the workspace associated with the invitation.
   * @param invitationId - The ID of the invitation to reject.
   * @param userId - The ID of the user rejecting the invitation.
   * @param ipAddress - The IP address from which the rejection request originated.
   * @returns The updated workspace invitation or throws an error if rejection fails.
   */
  async rejectInvitation(token: string, ipAddress: string | null) {
    // Validate the invitation for acceptance by checking its existence, status, and expiration
    const invitation = await this.validateInvitationForAccept(token);

    // Update the status of the invitation to "DECLINED" in the repository
    const updatedInvitation = await this.workspaceInvitationRepository.updateStatus(
      invitation.id,
      InvitationStatus.DECLINED,
    );

    //  Prepare the event data for the workspace invitation updated event with the new status "DECLINED"
    const event: WorkspaceInvitationUpdatedEvent = {
      invitationId: invitation.id, // Set the ID of the invitation being rejected
      workspaceId: invitation.workspace.id, // Set the ID of the workspace associated with the invitation
      workspaceName: invitation.workspace.name, // Set the name of the workspace associated with the invitation
      inviterId: invitation.inviter.id, // Set the ID of the inviter who created the invitation
      inviterName: invitation.inviter.fullName || invitation.inviter.email, // Set the name of the inviter who created the invitation, using full name if available, otherwise use email
      inviterEmail: invitation.inviter.email, // Set the email of the inviter who created the invitation
      inviteeId: invitation.userId || '', // Set the ID of the invitee associated with the invitation, or an empty string if the user ID is null
      inviteeName: invitation.user?.fullName || '', // Set the name of the invitee associated with the invitation, using full name if available, otherwise use an empty string
      inviteeEmail: invitation.user?.email || '', // Set the email of the invitee associated with the invitation, or an empty string if the user email is null
      roleName: invitation.role.name, // Set the name of the role associated with the invitation
      previousStatus: invitation.status, // Set the previous status of the invitation before it was updated
      status: InvitationStatus.DECLINED, // Set the new status of the invitation to "DECLINED"
      updatedAt: updatedInvitation.updatedAt, // Set the timestamp for when the invitation was updated
      rejectedAt: updatedInvitation.rejectedAt, // Set the timestamp for when the invitation was rejected
      ipAddress,
    };

    // Publish the workspace invitation updated event to notify other services or components about the rejection
    await this.workspaceInvitationPublisher.workspaceInvitationRejected(event);

    // Return the updated invitation to the caller
    return updatedInvitation;
  }
}
