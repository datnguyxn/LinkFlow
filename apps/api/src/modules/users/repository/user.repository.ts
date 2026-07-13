import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient } from '@prisma/client';
import { buildPagination, buildPaginationMeta } from '../../../utils/pagination.util.ts';

export class UserRepository {
  /**
   * Find a user by their email address
   * @param email - The email address of the user to find
   * @returns The user object if found, otherwise null
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  /**
   * Create a new user and assign role inside a transaction
   *
   * Transaction flow:
   * 1. Create user record
   * 2. Create user-role mapping
   * 3. Ensure both operations succeed or both rollback
   */
  async createUser(
    data: Prisma.UserCreateInput,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    // Use a transaction to ensure atomicity
    return await db.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        status: data.status,
        language: data.language,
        timezone: data.timezone,
      },
    });
  }

  /**
   * Find a user by their unique ID
   * @param id
   * @returns
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Update a user's information by their unique ID
   * @param id - The unique ID of the user to update
   * @param data - The data to update for the user
   * @returns The updated user object
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput,
    db: PrismaClient | Prisma.TransactionClient = prisma,
  ) {
    return db.user.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedAt: new Date(), // Update the updatedAt timestamp
      },
    });
  }

  /**
   * Delete a user by their unique ID
   * @param id - The unique ID of the user to delete
   * @returns The deleted user object
   */
  async delete(id: string, db: PrismaClient | Prisma.TransactionClient = prisma) {
    return db.user.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Find all users with pagination support
   * @param page - The page number to retrieve
   * @param limit - The number of users per page
   * @returns An object containing the users and pagination metadata
   */
  async findAll(page: number, limit: number) {
    const { skip, take } = buildPagination(page, limit);

    const [users, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take,
        where: {
          email: {
            not: 'admin@linkflow.dev',
          },
        },
      }),
      prisma.user.count({
        where: {
          email: {
            not: 'admin@linkflow.dev',
          },
        },
      }),
    ]);

    return {
      data: users,
      pagination: buildPaginationMeta(page, limit, totalItems),
    };
  }

  /**
   * Update the last login timestamp for a user
   * @param userId - The unique ID of the user
   * @returns The updated user object with the new last login timestamp
   */
  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Create a new OAuth user in the database.
   * @param data - The data for the new OAuth user.
   * @param tx - Optional transaction client for database operations.
   * @returns The created OAuth user.
   */
  async createOAuthUser(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;

    return db.user.create({
      data,
    });
  }
}
