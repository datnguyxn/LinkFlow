import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient, UrlStatus } from '@prisma/client';
import { buildPagination, buildPaginationMeta } from '../../../utils/pagination.util.ts';

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
      data
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

  /**
   * Find all URLs in a workspace with pagination and optional search
   * @param workspaceId - The ID of the workspace to find URLs for
   * @param page - The page number for pagination
   * @param limit - The number of items per page for pagination
   * @param search - Optional search term to filter URLs by original URL, short code, title, or description
   * @returns An object containing the list of URLs, summary of URL statuses, and pagination metadata
   */
  async findAllByWorkspaceIdWithPagination(
    workspaceId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const { skip, take } = buildPagination(page, limit);

    const where: Prisma.UrlWhereInput = {
      workspaceId,
      ...(search && {
        OR: [
          {
            originalUrl: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            shortCode: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    return prisma.$transaction(async (tx) => {
      const [
        urls,
        totalItems,
        activeUrls,
        expiredUrls,
        disabledUrls,
      ] = await Promise.all([
        tx.url.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            qrCode: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        }),

        tx.url.count({
          where,
        }),

        tx.url.count({
          where: {
            ...where,
            status: UrlStatus.ACTIVE,
          },
        }),

        tx.url.count({
          where: {
            ...where,
            status: UrlStatus.EXPIRED,
          },
        }),

        tx.url.count({
          where: {
            ...where,
            status: UrlStatus.DISABLED,
          },
        }),
      ]);

      return {
        urls,

        summary: {
          total: totalItems,
          active: activeUrls,
          expired: expiredUrls,
          disabled: disabledUrls,
        },

        pagination: buildPaginationMeta(
          page,
          limit,
          totalItems,
        ),
      };
    });
  }

  /**
   * Update a URL record in the database
   * @param id - The unique identifier of the URL to update
   * @param data - An object containing the updated URL data
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client)
   * @returns The updated URL record
   */
  async update(id: string, data: Prisma.UrlUpdateInput, db: PrismaClient | Prisma.TransactionClient = prisma) {
    // Use a transaction to ensure atomicity
    return await db.url.update({
      where: { id },
      data,
    });
  }
}
