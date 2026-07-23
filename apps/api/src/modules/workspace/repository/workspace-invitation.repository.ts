import { prisma } from '../../../infrastructure/database/index.ts';
import { InvitationStatus, Prisma, PrismaClient } from '@prisma/client';

/**
 * WorkspaceInvitationRepository class provides methods to interact with the workspace invitation data in the database.
 * It includes methods for creating invitations and finding pending invitations by email.
 */
export class WorkspaceInvitationRepository {
  /**
   * Create a new workspace invitation
   * @param data - The data for the new workspace invitation
   * @returns The created workspace invitation record
   */
  async create(data: Prisma.WorkspaceInvitationCreateInput) {
    // Use Prisma to create a new workspace invitation record in the database
    return prisma.workspaceInvitation.create({
      data, // The data for the new workspace invitation
    });
  }

  /**
   * Find a pending workspace invitation by workspace ID and email
   * @param workspaceId - The ID of the workspace
   * @param email - The email address of the invitee
   * @returns The pending workspace invitation record if found, otherwise null
   */
  async findPendingByEmail(workspaceId: string, email: string) {
    // Use Prisma to find a pending workspace invitation record by workspace ID and email
    return prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId, // Filter invitations by the specified workspace ID
        email, // Filter invitations by the specified email address
        status: InvitationStatus.PENDING, // Only consider invitations that are still pending
        expiresAt: {
          gt: new Date(), // Only consider invitations that have not expired
        },
      },
      include: {
        role: true, // Include the role associated with the invitation
      },
    });
  }

  /**
   * Find all workspace invitations by workspace ID
   * @param workspaceId - The ID of the workspace
   * @returns An array of workspace invitation records for the specified workspace
   */
  async findAllByWorkspaceId(workspaceId: string) {
    return prisma.workspaceInvitation.findMany({
      where: {
        workspaceId, // Filter invitations by the specified workspace ID
      },

      select: {
        id: true, // Include the ID of the invitation
        email: true, // Include the email address of the invitee
        status: true, // Include the status of the invitation (e.g., pending, accepted, declined)
        expiresAt: true, // Include the expiration date of the invitation
        createdAt: true, // Include the creation date of the invitation

        user: {
          select: {
            id: true, // Include the ID of the user who sent the invitation
            fullName: true, // Include the full name of the user who sent the invitation
            email: true, // Include the email address of the user who sent the invitation
          },
        },

        role: {
          select: {
            id: true, // Include the ID of the role associated with the invitation
            name: true, // Include the name of the role associated with the invitation
          },
        },
      },

      orderBy: {
        createdAt: 'desc', // Order the invitations by creation date in descending order (most recent first)
      },
    });
  }

  async findById(invitationId: string) {
    // Use Prisma to find a workspace invitation record by its ID
    return prisma.workspaceInvitation.findUnique({
      where: {
        id: invitationId, // Filter the invitation by its unique ID
      },
      include: {
        inviter: {
          select: {
            id: true, // Include the ID of the user who sent the invitation
            fullName: true, // Include the full name of the user who sent the invitation
            email: true, // Include the email address of the user who sent the invitation
          },
        },
        user: {
          select: {
            id: true, // Include the ID of the user who sent the invitation
            fullName: true, // Include the full name of the user who sent the invitation
          },
        },
        role: {
          select: {
            id: true, // Include the ID of the role associated with the invitation
            name: true, // Include the name of the role associated with the invitation
          },
        },
      },
    });
  }

  /**
   * Update the status of a workspace invitation by its ID
   * @param invitationId - The unique identifier of the invitation to update
   * @param status - The new status to set for the invitation (e.g., accepted, declined)
   * @returns The updated workspace invitation record
   */
  async updateStatus(
    invitationId: string,
    status: InvitationStatus,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to update the status of a workspace invitation record by its ID
    return db.workspaceInvitation.update({
      where: {
        id: invitationId, // Filter the invitation by its unique ID
      },
      data: {
        status, // Update the status of the invitation (e.g., accepted, declined)
        updatedAt: new Date(), // Update the "updatedAt" timestamp to the current date and time
        acceptedAt: status === InvitationStatus.ACCEPTED ? new Date() : null, // If the status is "accepted," set the "acceptedAt" timestamp to the current date and time; otherwise, set it to null
        expiresAt: status === InvitationStatus.EXPIRED ? new Date() : undefined, // If the status is "expired," set the "expiresAt" timestamp to the current date and time; otherwise, leave it unchanged
        revokedAt: status === InvitationStatus.REVOKED ? new Date() : undefined, // If the status is "revoked," set the "revokedAt" timestamp to the current date and time; otherwise, leave it unchanged
        rejectedAt: status === InvitationStatus.DECLINED ? new Date() : undefined, // If the status is "rejected," set the "rejectedAt" timestamp to the current date and time; otherwise, leave it unchanged
      },
    });
  }

  /**
   * Find a workspace invitation by its ID, workspace ID, and user ID (or null for user ID)
   * @param invitationId - The unique identifier of the invitation to find
   * @param workspaceId - The unique identifier of the workspace associated with the invitation
   * @param userId - The unique identifier of the user associated with the invitation (or null for no user)
   * @returns The workspace invitation record if found, otherwise null
   */
  async findByIdForChangeStatus(invitationId: string, workspaceId: string, userId: string) {
    return prisma.workspaceInvitation.findFirst({
      where: {
        id: invitationId, // Filter the invitation by its unique ID
        workspaceId, // Filter the invitation by the associated workspace ID
        OR: [
          {
            userId, // Filter the invitation by the associated user ID (if provided)
          },
          {
            userId: null, // Include invitations that are not associated with any user (userId is null)
          },
        ],
      },
      include: {
        workspace: {
          select: {
            id: true, // Include the ID of the workspace associated with the invitation
            name: true, // Include the name of the workspace associated with the invitation
          },
        },

        inviter: {
          select: {
            id: true, // Include the ID of the user who sent the invitation
            fullName: true, // Include the full name of the user who sent the invitation
            email: true, // Include the email address of the user who sent the invitation
          },
        },

        user: {
          select: {
            id: true, // Include the ID of the user associated with the invitation
            fullName: true, // Include the full name of the user associated with the invitation
            email: true, // Include the email address of the user associated with the invitation
          },
        },

        role: {
          select: {
            id: true, // Include the ID of the role associated with the invitation
            name: true, // Include the name of the role associated with the invitation
          },
        },
      },
    });
  }

  /**
   * Find a workspace invitation by its unique token
   * @param token - The unique token associated with the invitation
   * @returns The workspace invitation record if found, otherwise null
   */
  async findByToken(token: string) {
    // Use Prisma to find a workspace invitation record by its unique token
    return prisma.workspaceInvitation.findFirst({
      where: {
        token, // Filter the invitation by its unique token
      },
      include: {
        workspace: {
          select: {
            id: true, // Include the ID of the workspace associated with the invitation
            name: true, // Include the name of the workspace associated with the invitation
          },
        },

        inviter: {
          select: {
            id: true, // Include the ID of the user who sent the invitation
            fullName: true, // Include the full name of the user who sent the invitation
            email: true, // Include the email address of the user who sent the invitation
          },
        },

        user: {
          select: {
            id: true, // Include the ID of the user associated with the invitation
            fullName: true, // Include the full name of the user associated with the invitation
            email: true, // Include the email address of the user associated with the invitation
          },
        },

        role: {
          select: {
            id: true, // Include the ID of the role associated with the invitation
            name: true, // Include the name of the role associated with the invitation
          },
        },
      },
    });
  }

  /**
   * Expire all pending workspace invitations that have passed their expiration date
   * @returns The result of the update operation, including the count of expired invitations
   */
  async expirePendingInvitations() {
    // Use Prisma to update the status of all pending workspace invitations that have passed their expiration date
    return await prisma.workspaceInvitation.updateMany({
      where: {
        status: InvitationStatus.PENDING, // Only consider invitations that are still pending

        expiresAt: {
          lte: new Date(), // Only consider invitations that have expired (expiration date is less than or equal to the current date)
        },
      },

      data: {
        status: InvitationStatus.EXPIRED, // Update the status of the expired invitations to "expired"
        expiresAt: new Date(), // Update the "expiresAt" timestamp to the current date and time
        updatedAt: new Date(), // Update the "updatedAt" timestamp to the current date and time
      },
    });
  }

  /**
   * Find the next pending workspace invitation that is set to expire
   * @returns The workspace invitation record with the earliest expiration date, or null if none found
   */
  async findNextPendingExpiration() {
    // Use Prisma to find the next pending workspace invitation that is set to expire
    return prisma.workspaceInvitation.findFirst({
      where: {
        status: InvitationStatus.PENDING, // Only consider invitations that are still pending
        expiresAt: {
          gt: new Date(), // Only consider invitations that have not yet expired (expiration date is greater than the current date)
        },
      },
      orderBy: {
        expiresAt: 'asc', // Order the invitations by expiration date in ascending order (earliest expiration first)
      },
      select: {
        expiresAt: true, // Include the expiration date of the invitation
      },
    });
  }

  async findExpiredPendingInvitations() {
    return prisma.workspaceInvitation.findMany({
      where: {
        status: InvitationStatus.PENDING,
        expiresAt: {
          lte: new Date(),
        },
      },
      include: {
        workspace: true,
        inviter: true,
        user: true,
        role: true,
      },
    });
  }

  async expire(invitationId: string) {
    return prisma.workspaceInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: InvitationStatus.EXPIRED,
        expiresAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
