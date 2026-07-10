import { prisma } from "../../../infrastructure/database/index.ts";
import { OAuthProvider, Prisma } from "@prisma/client";

/**
 * Repository for managing OAuth accounts in the database.
 * - Provides methods to find, create, update, and delete OAuth accounts.
 * - Supports transactions for database operations.
 * - Can check for the existence of an OAuth account.
 */
export class OAuthRepository {

    /**
     * Finds an OAuth account by provider and provider account ID.
     * @param provider - The OAuth provider (e.g., Google, GitHub).
     * @param providerAccountId - The unique account ID from the provider.
     * @returns The found OAuth account or null if not found.
     */
	 async findByProvider(
        provider: OAuthProvider,
        providerAccountId: string,
    ) {

        // Use Prisma to find the first OAuth account matching the provider and provider account ID
        return prisma.oAuthAccount.findFirst({
            where: {
                provider,
                providerAccountId,
            },
        });

    }

    /**
     * Finds all OAuth accounts associated with a user ID.
     * @param userId - The ID of the user.
     * @returns A list of OAuth accounts associated with the user.
     */
    async findByUserId(userId: string) {

        // Use Prisma to find all OAuth accounts for the given user ID
        return prisma.oAuthAccount.findMany({
            where: {
                userId,
            },
        });
    
    }

    /**
     * Creates a new OAuth account in the database.
     * @param data - The data for the new OAuth account.
     * @param tx - Optional transaction client for database operations.
     * @returns The created OAuth account.
     */
    async create(
        data: Prisma.OAuthAccountCreateInput,
        tx?: Prisma.TransactionClient,
    ) {

        // Use the provided transaction client or the default Prisma client
        const db = tx ?? prisma;

        // Create a new OAuth account in the database
        return db.oAuthAccount.create({
            data,
        });

    }

    /**
     * Updates an existing OAuth account in the database.
     * @param id - The ID of the OAuth account to update.
     * @param data - The data to update the OAuth account with.
     * @param tx - Optional transaction client for database operations.
     * @returns The updated OAuth account.
     */
    async update(
        id: string,
        data: Prisma.OAuthAccountUpdateInput,
        tx?: Prisma.TransactionClient,
    ) {

        // Use the provided transaction client or the default Prisma client
        const db = tx ?? prisma;

        // Update the OAuth account with the specified ID in the database
        return db.oAuthAccount.update({
            where: {
                id,
            },
            data,
        });

    }

    /**
     * Deletes an OAuth account from the database.
     * @param id - The ID of the OAuth account to delete.
     * @param tx - Optional transaction client for database operations.
     * @returns The deleted OAuth account.
     */
    async delete(
        id: string,
        tx?: Prisma.TransactionClient,
    ) {

        // Use the provided transaction client or the default Prisma client
        const db = tx ?? prisma;

        // Delete the OAuth account with the specified ID from the database
        return db.oAuthAccount.delete({
            where: {
                id,
            },
        });

    }

    /**
     * Deletes all OAuth accounts associated with a user ID.
     * @param userId - The ID of the user whose OAuth accounts should be deleted.
     * @param tx - Optional transaction client for database operations.
     * @returns The result of the delete operation.
     */
    async deleteByUserId(
        userId: string,
        tx?: Prisma.TransactionClient,
    ) {
        
        // Use the provided transaction client or the default Prisma client
        const db = tx ?? prisma;

        // Delete all OAuth accounts associated with the specified user ID from the database
        return db.oAuthAccount.deleteMany({
            where: {
                userId,
            },
        });

    }

    /**
     * Checks if an OAuth account exists in the database.
     * @param provider - The OAuth provider (e.g., Google, GitHub).
     * @param providerAccountId - The unique account ID from the provider.
     * @returns True if the OAuth account exists, false otherwise.
     */
    async exists(
        provider: OAuthProvider,
        providerAccountId: string,
    ) {
        
        // Count the number of OAuth accounts matching the provider and provider account ID
        const count = await prisma.oAuthAccount.count({
            where: {
                provider,
                providerAccountId,
            },
        });

        // Return true if at least one matching OAuth account exists, false otherwise
        return count > 0;

    }

    /**
     * Finds a Google OAuth account by provider account ID.
     * @param providerAccountId - The unique account ID from Google.
     * @returns The found Google OAuth account or null if not found.
     */
    async findGoogleAccount(providerAccountId: string) {
    
        // Use the findByProvider method to find a Google OAuth account by provider account ID
        return this.findByProvider(
            OAuthProvider.GOOGLE,
            providerAccountId,
        );
        
    }
}