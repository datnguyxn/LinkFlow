import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * UrlRepository class provides methods to interact with the URL data in the database.
 * It includes methods for finding, creating, updating, and deleting URLs, as well as
 * handling pagination and other URL-related operations.
 */
export class UrlRepository {

    /**
     * Find a URL by its unique ID
     * @param id - The unique identifier of the URL to find
     * @returns The URL object if found, otherwise null
     */
    async findById(id: string) {
        // Use Prisma to find a unique URL record by its ID
        return prisma.url.findUnique({
            where: {
                id,
            },
        });
    }

    /**
     * Create a new URL record in the database
     * @param data - An object containing the URL data, workspace ID, and user ID
     * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client)
     * @returns The created URL record
     */
    async createUrl(
        data: Prisma.UrlCreateInput,
        db: PrismaClient | Prisma.TransactionClient = prisma,
    ) {
        // Use a transaction to ensure atomicity
        return await db.url.create({
            data: {
                shortCode: data.shortCode,
                originalUrl: data.originalUrl,
                title: data.title,
                description: data.description,
                faviconUrl: data.faviconUrl,
                redirectType: data.redirectType,
                passwordHash: data.passwordHash,
                expiresAt: data.expiresAt,
                maxClicks: data.maxClicks,
                clickCount: data.clickCount,
                user: {
                    connect: {
                        id: data.user.connect?.id,
                    },
                },
                workspace: {
                    connect: {
                        id: data.workspace.connect?.id,
                    },
                },
            },
        });
    }

    /**
     * Find a URL by its short code
     * @param shortCode - The short code of the URL to find
     * @returns The URL object if found, otherwise null
     */
    async findByShortCode(shortCode: string) {
        // Use Prisma to find a unique URL record by its short code
        return prisma.url.findUnique({
            where: {
                shortCode,
            },
        });
    }
}