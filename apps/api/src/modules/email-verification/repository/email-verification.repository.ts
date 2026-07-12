import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

/**
 * Repository for managing email verification tokens in the database.
 * Provides methods to create, find, and delete email verification tokens.
 */
export class EmailVerificationRepository {

    /**
     * Create a new email verification token for a user.
     * @param transaction - The Prisma transaction client for database operations.
     * @param data - An object containing the verification token and user ID.
     * @returns The created email verification token record.
     */
    async create(transaction: Prisma.TransactionClient, data: { verifyToken: string, userId: string }) {
        // Use the provided transaction client to create a new email verification token in the database
        return await transaction.emailVerificationToken.create({
            data: {
                tokenHash: data.verifyToken,
                userId: data.userId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Token expires in 10 minutes
            }
        });
    }

    /**
     * Find email verification tokens by the provided token.
     * @param verifyToken - The verification token to search for.
     * @returns An array of email verification token records matching the provided token.
     */
    async findByToken(verifyToken: string) {
        // Use the Prisma client to find email verification tokens in the database that match the provided token
        return await prisma.emailVerificationToken.findFirst({
            where: {
                tokenHash: verifyToken
            }
        });
    }

    /**
     * Delete an email verification token by its ID.
     * @param id - The ID of the email verification token to delete.
     * @returns The deleted email verification token record.
     */
    async delete(id: string) {
        // Use the Prisma client to delete an email verification token from the database by its ID
        return await prisma.emailVerificationToken.delete({
            where: {
                id: id
            }
        });
    }

    /**
     * Delete all email verification tokens associated with a specific user ID.
     * @param userId - The ID of the user whose email verification tokens should be deleted.
     * @returns The result of the delete operation, including the count of deleted records.
     */
    async deleteByUserId(userId: string, tx?: Prisma.TransactionClient) {
        // Use the Prisma client to delete all email verification tokens from the database that are associated with the provided user ID
        return await (tx || prisma).emailVerificationToken.deleteMany({
            where: {
                userId: userId
            }
        });
    }
}