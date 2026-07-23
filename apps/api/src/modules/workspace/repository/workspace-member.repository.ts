import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient } from '@prisma/client';

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
    ) {

        // Use Prisma to find the workspace member record by workspace ID and user ID
        return prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
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
    async create(data: Prisma.WorkspaceMemberCreateInput, db: PrismaClient | Prisma.TransactionClient = prisma) {
        // Use Prisma to create a new workspace member record in the database
        return db.workspaceMember.create({
            data,
        });
    }
}