import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient, WorkspaceMemberStatus } from '@prisma/client';
import { generateWorkspaceSlug } from '../../../utils/slug.util.ts';

/**
 * WorkspaceRepository class provides methods to interact with the workspace data in the database.
 * It includes methods for creating, finding, updating, and deleting workspaces, as well as
 * managing workspace members and their roles.
 */
export class WorkspaceRepository {

  /**
   * Create a new workspace and assign the owner inside a transaction
   * Transaction flow:
   * 1. Create workspace record
   * 2. Create workspace-member mapping for the owner
   * 3. Ensure both operations succeed or both rollback
   * 
   * @param transaction - The Prisma transaction client for database operations
   * @param data - An object containing the workspace name and owner ID
   * @returns The created workspace record with its members
   */
  async create(
    data: {
      name: string; // The name of the workspace to be created
      ownerId: string; // The ID of the user who will be the owner of the workspace
      logoUrl?: string; // Optional URL for the workspace logo
    },
    db: PrismaClient | Prisma.TransactionClient = prisma, // Use the provided transaction client or default to the main Prisma client
  ) {

    // Use a transaction to ensure atomicity
    return db.workspace.create({
      data: {
        name: `${data.name} Workspace`, // Append "Workspace" to the provided name for clarity
        ownerId: data.ownerId, // Set the owner ID for the workspace
        slug: generateWorkspaceSlug(`${data.name}-workspace`), // Generate a unique slug for the workspace based on its name
        logoUrl: data.logoUrl, // Set the optional logo URL if provided

        members: {
          create: {
            user: {
              connect: {
                id: data.ownerId, // Connect the owner user to the workspace members
              },
            },
            role: {
              connect: {
                name: 'OWNER', // Assign the "OWNER" role to the workspace owner
              },
            }
          },
        },
      },

      include: {
        members: {
          include: {
            role: true, // Include the role information for each member in the workspace
          },
        },
      },
    });
  }

  /**
   * Find a workspace and its member information by the workspace ID and user ID
   * @param workspaceId - The unique identifier of the workspace to find
   * @param userId - The unique identifier of the user
   * @returns The workspace object with member information if found, otherwise null
   */
  async findWorkspaceAndMemberById(
    workspaceId: string,
    userId: string,
  ) {
    return prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            id: userId, // Ensure the user is a member of the workspace
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find a workspace by its unique ID
   * @param workspaceId - The unique identifier of the workspace to find
   * @returns The workspace object if found, otherwise null
   */
  async findById(workspaceId: string) {
    // Use Prisma to find a unique workspace record by its ID
    return prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
  }

  /**
   * Update a workspace's information by its unique ID
   * @param id - The unique ID of the workspace to update
   * @param data - The data to update for the workspace
   * @returns The updated workspace object
   */
  async update(id: string, data: Prisma.WorkspaceUpdateInput) {

    // Use Prisma to update the workspace record in the database
    return prisma.workspace.update({
      where: {
        id,
      },
      data,
    });
  }

  /**
   * Delete a workspace by its unique ID
   * @param id - The unique ID of the workspace to delete
   * @returns The deleted workspace object
   */
  async delete(id: string) {

    // Use Prisma to delete the workspace record from the database
    return prisma.workspace.delete({
      where: {
        id,
      },
    });
  }

  /**
   * List all workspaces that a user is a member of
   * @param userId - The ID of the user whose workspaces to list
   * @returns An array of workspaces that the user is a member of
   */
  async listWorkspaces(userId: string) {
    // Use Prisma to find all workspaces where the user is a member
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  /**
   * Find all workspaces that a user is a member of, along with their roles
   * @param userId - The ID of the user whose workspaces to find
   * @returns An array of workspaces with the user's role in each workspace
   */
  async findAllByUserId(userId: string) {

    // Use Prisma to find all workspaces where the user is a member, including their roles
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find a workspace by its unique slug
   * @param slug - The unique slug of the workspace to find
   * @returns The workspace object if found, otherwise null
   */
  async findBySlug(slug: string) {
    // Use Prisma to find a unique workspace record by its slug
    return prisma.workspace.findUnique({
      where: {
        slug,
      },
    });
  }

  /** 
 * Check if a user has a specific permission in a workspace
 * @param workspaceId - The ID of the workspace
 * @param userId - The ID of the user whose permission to check
 * @param permissionName - The name of the permission to check
 * @returns A boolean indicating whether the user has the specified permission in the workspace
 */
  async hasPermission(
    workspaceId: string,
    userId: string,
    permissionName: string,
  ) {

    // Use Prisma to find the workspace member record and check if the user has the specified permission
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        status: WorkspaceMemberStatus.ACTIVE,
        role: {
          permissions: {
            some: {
              permission: {
                name: permissionName,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Return true if the user has the specified permission, otherwise false
    return Boolean(member);
  }
}
