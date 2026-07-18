import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Repository for managing refresh tokens in the database.
 * Provides methods to create, find, revoke, and delete refresh tokens.
 */
export class RefreshTokenRepository {
  /**
   * Create a new refresh token for a user.
   * @param data - An object containing the token, user ID, and optional metadata.
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client).
   * @returns The created refresh token record.
   */
  async create(
    data: {
      id: string;
      token: Prisma.RefreshTokenCreateInput;
      userId: string;
      ipAddress?: string;
      userAgent?: string;
      rememberMe?: boolean;
    },
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    // Use the provided transaction client or Prisma client to create a new refresh token in the database
    return db.refreshToken.create({
      data: {
        id: data.id,
        tokenHash: data.token.tokenHash,
        userId: data.userId,
        expiresAt: data.token.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        rememberMe: data.rememberMe,
      },
    });
  }

  /**
   * Find refresh tokens by user ID and revoked status.
   * @param userId - The ID of the user whose refresh tokens to find.
   * @param revoked - The revoked status to filter by (true or false).
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client).
   * @returns An array of found refresh token records.
   */
  async findByUserIdAndRevoked(
    userId: string,
    revoked: boolean,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    // Use the provided transaction client or Prisma client to find refresh tokens in the database by user ID and revoked status
    return db.refreshToken.findMany({
      where: {
        userId,
        revoked,
      },
    });
  }

  /**
   * Find a refresh token by its token hash.
   * @param tokenHash - The token hash to search for.
   * @returns The found refresh token record, or null if not found.
   */
  async findByTokenHash(tokenHash: string) {
    // Use the Prisma client to find a refresh token in the database by its token hash
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
      },
    });
  }

  /**
   * Revoke a refresh token by its ID.
   * @param id - The ID of the refresh token to revoke.
   * @returns The updated refresh token record with revoked status set to true.
   */
  async revoke(id: string, db: Prisma.TransactionClient | PrismaClient = prisma) {
    // Use the Prisma client to update the refresh token in the database, setting its revoked status to true and recording the revocation time
    return db.refreshToken.update({
      where: {
        id,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all refresh tokens associated with a specific user ID.
   * @param userId - The ID of the user whose refresh tokens should be revoked.
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client).
   * @returns The result of the update operation, including the count of revoked records.
   */
  async revokeAllByUserId(userId: string, db: Prisma.TransactionClient | PrismaClient = prisma) {
    // Use the provided transaction client or Prisma client to update all refresh tokens in the database that are associated with the provided user ID, setting their revoked status to true and recording the revocation time
    return db.refreshToken.updateMany({
      where: {
        userId,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all refresh tokens associated with a specific user ID, except for a specified token ID.
   * @param userId - The ID of the user whose refresh tokens should be revoked.
   * @param exceptTokenId - The ID of the refresh token that should not be revoked.
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client).
   * @returns The result of the update operation, including the count of revoked records.
   */
  async revokeAllByUserIdExcept(
    userId: string,
    exceptTokenId: string,
    db: Prisma.TransactionClient | PrismaClient = prisma,
  ) {
    // Use the provided transaction client or Prisma client to update all refresh tokens in the database that are associated with the provided user ID, except for the specified token ID, setting their revoked status to true and recording the revocation time
    return db.refreshToken.updateMany({
      where: {
        userId,
        NOT: {
          id: exceptTokenId,
        },
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Delete all expired refresh tokens.
   * @returns The result of the delete operation, including the count of deleted records.
   */
  async deleteExpired() {
    // Use the Prisma client to delete all refresh tokens from the database that have expired (i.e., their expiration date is less than the current date)
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Delete all refresh tokens associated with a specific user ID.
   * @param userId - The ID of the user whose refresh tokens should be deleted.
   * @param db - The Prisma transaction client or Prisma client for database operations (default is the main Prisma client).
   * @returns The result of the delete operation, including the count of deleted records.
   */
  async deleteByUserId(userId: string, db: Prisma.TransactionClient | PrismaClient = prisma) {
    // Use the provided transaction client or Prisma client to delete all refresh tokens from the database that are associated with the provided user ID
    return db.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  /**
   * Find all active (not revoked and not expired) refresh tokens for a specific user ID.
   * @param userId - The ID of the user whose active refresh tokens to find.
   * @returns An array of found active refresh token records.
   */
  async findActiveByUserId(userId: string) {
    // Use the Prisma client to find all active refresh tokens in the database for the provided user ID (i.e., tokens that are not revoked and have not expired)
    return prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find an active (not revoked and not expired) refresh token by its ID and associated user ID.
   * @param id - The ID of the refresh token to find.
   * @param userId - The ID of the user associated with the refresh token.
   * @returns The found active refresh token record, or null if not found.
   */
  async findActiveByIdAndUserId(id: string, userId: string) {
    // Use the Prisma client to find an active refresh token in the database by its ID and associated user ID (i.e., token that is not revoked and has not expired)
    return prisma.refreshToken.findFirst({
      where: {
        id,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }
}
