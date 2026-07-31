import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient, WorkspaceMemberStatus } from '@prisma/client';
import { buildPagination, buildPaginationMeta } from '../../../utils/pagination.util.ts';

/**
 * WorkspaceMemberRepository class provides methods to interact with the workspace member data in the database.
 * It includes methods for finding workspace members by user ID and managing their roles.
 */
export class WorkspaceMemberRepository {
  /**
   * Find all workspace members by user ID
   * @param userId - The unique identifier of the user whose workspace memberships are to be retrieved
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns An array of workspace member objects associated with the specified user ID
   */
  async findAllByUserId(userId: string, db: PrismaClient | Prisma.TransactionClient = prisma) {
    // Use the Prisma client to find all workspace members associated with the specified user ID
    return db.workspaceMember.findMany({
      where: {
        userId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  /**
   * Find the role of a user in a specific workspace
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user whose role to find
   * @returns The role of the user in the workspace, or null if not found
   */
  async findRoleByUserId(workspaceId: string, userId: string) {
    // Use Prisma to find the workspace member record by workspace ID and user ID
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
      select: {
        role: true,
      },
    });

    // Return the role of the user in the workspace, or null if not found
    return member ? member.role : null;
  }

  /**
   * Find a workspace member by workspace ID and user ID
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user whose membership to find
   * @returns The workspace member object if found, otherwise null
   */
  async findByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to find the workspace member record by workspace ID and user ID
    return db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
        status: WorkspaceMemberStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  /**
   * Find a workspace member by workspace ID and user ID, including inactive members (LEFT or REMOVED)
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user whose membership to find
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns The workspace member object if found, otherwise null
   */
  async findInactiveByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    return db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        status: {
          in: [
            WorkspaceMemberStatus.LEFT,
            WorkspaceMemberStatus.REMOVED,
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  /**
   * Create a new workspace member record
   * @param data - The data for the new workspace member
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns The created workspace member object
   */
  async create(
    data: Prisma.WorkspaceMemberCreateInput,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to create a new workspace member record in the database
    return db.workspaceMember.create({
      data,
    });
  }

  /**
   * Update the role of a workspace member
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user whose role to update
   * @param newRoleId - The ID of the new role to assign to the user
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns The updated workspace member object
   */
  async updateRole(
    workspaceId: string,
    userId: string,
    newRoleId: string,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to update the role of a workspace member in the database
    return db.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        roleId: newRoleId,
        updatedAt: new Date(), // Update the timestamp for when the workspace member was last modified
      },
    });
  }

  /**
   * Find all workspace members by workspace ID
   * @param workspaceId - The ID of the workspace whose members to retrieve
   * @returns An array of workspace member objects associated with the specified workspace ID
   */
  async findAllByWorkspaceId(
    workspaceId: string,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to find all workspace members associated with the specified workspace ID
    return db.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find all workspace members by workspace ID with pagination and optional search
   * @param workspaceId - The ID of the workspace whose members to retrieve
   * @param page - The page number for pagination (1-based index)
   * @param limit - The number of items per page for pagination
   * @param search - Optional search term to filter members by user full name or email
   * @returns An object containing the array of workspace member objects and pagination metadata
   */
  async findAllByWorkspaceIdWithPagination(
    workspaceId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.WorkspaceMemberWhereInput = {
      workspaceId,
      ...(search
        ? {
          user: {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        }
        : {}),
    };

    return prisma.$transaction(async (tx) => {
      const [
        members,
        totalItems,
        active,
        left,
        removed,
      ] = await Promise.all([
        tx.workspaceMember.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          skip,
          take,
        }),

        tx.workspaceMember.count({
          where,
        }),

        tx.workspaceMember.count({
          where: {
            ...where,
            status: WorkspaceMemberStatus.ACTIVE,
          },
        }),

        tx.workspaceMember.count({
          where: {
            ...where,
            status: WorkspaceMemberStatus.LEFT,
          },
        }),

        tx.workspaceMember.count({
          where: {
            ...where,
            status: WorkspaceMemberStatus.REMOVED,
          },
        }),
      ]);

      return {
        members,

        summary: {
          total: totalItems,
          active,
          left,
          removed,
        },

        pagination: buildPaginationMeta(page, limit, totalItems),
      };
    });
  }


  /**
   * Update a workspace member's information
   * @param workspaceId - The ID of the workspace
   * @param userId - The ID of the user whose membership to update
   * @param data - The data to update for the workspace member
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns The updated workspace member object
   */
  async update(
    workspaceId: string,
    userId: string,
    data: Prisma.WorkspaceMemberUpdateInput,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to update the workspace member record in the database
    return db.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data,
    });
  }

  /**
   * Reactivate a workspace member by updating their role and status
   * @param memberId - The ID of the workspace member to reactivate
   * @param roleId - The ID of the new role to assign to the workspace member
   * @param db - The Prisma client or transaction client for database operations (default is the main Prisma client)
   * @returns The updated workspace member object with the new role and active status
   */
  async reactivate(
    memberId: string,
    roleId: string,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use Prisma to update the workspace member's role and status to active
    return db.workspaceMember.update({
      where: {
        id: memberId, // Filter the workspace member by their unique ID
      },

      data: {
        roleId, // Update the role of the workspace member to the specified new role ID

        status: WorkspaceMemberStatus.ACTIVE, // Set the status of the workspace member to "active"
        updatedAt: new Date(), // Update the timestamp for when the workspace member was last modified
        deletedAt: null, // Clear the "deletedAt" timestamp to indicate that the workspace member is no longer deleted
      },
    });
  }
}
