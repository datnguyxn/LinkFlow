import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";
import { generateWorkspaceSlug } from "../../../utils/slug.util.ts";
import { ROLE } from "../../../common/constants/index.ts";

export class WorkspaceRepository {
    async create(transaction: Prisma.TransactionClient, data: {
        name: string,
        ownerId: string
    }) {
        return transaction.workspace.create({
            data: {
                name: `${data.name} Workspace`,
                ownerId: data.ownerId,
                slug: generateWorkspaceSlug(`${data.name}-workspace`),

                members: {
                    create: {
                        userId: data.ownerId,
                        role: ROLE.OWNER,
                        joinedAt: new Date()
                    },
                },
            },

            include: {
                members: true,
            }
        });
    }

    async addMember(workspaceId: string, userId: string) {
        return prisma.workspace.update({
            where: {
                id: workspaceId
            },
            data: {
                members: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
    }

    async findById(id: string) {
        return prisma.workspace.findUnique({
            where: {
                id
            }
        });
    }

    async update(id: string, data: Prisma.WorkspaceUpdateInput) {
        return prisma.workspace.update({
            where: {
                id
            },
            data
        });
    }

    async delete(id: string) {
        return prisma.workspace.delete({
            where: {
                id
            }
        });
    }
}