import { prisma } from '../../../infrastructure/database/index.ts';
import { Prisma } from '@prisma/client';

/**
 * Repository for managing password reset tokens in the database.
 * Provides methods to create, find, and delete password reset tokens.
 */
export class PasswordResetRepository {
  /**
   * Create a new password reset token for a user.
   * @param transaction - The Prisma transaction client for database operations.
   * @param data - An object containing the reset token and user ID.
   * @returns The created password reset token record.
   */
  async create(
    transaction: Prisma.TransactionClient,
    data: { resetToken: string; userId: string },
  ) {
    // Use the provided transaction client to create a new password reset token in the database
    return await transaction.passwordResetToken.create({
      data: {
        tokenHash: data.resetToken,
        userId: data.userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Token expires in 10 minutes
      },
    });
  }

  /**
   * Find a password reset token by its token hash.
   * @param token - The token hash to search for.
   * @returns The found password reset token record, or null if not found.
   */
  async findByToken(token: string) {
    // Use the Prisma client to find a password reset token in the database by its token hash
    return await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash: token,
      },
    });
  }

  /**
   * Delete a password reset token by its ID.
   * @param id - The ID of the password reset token to delete.
   * @returns The deleted password reset token record.
   */
  async delete(id: string) {
    // Use the Prisma client to delete a password reset token from the database by its ID
    return await prisma.passwordResetToken.delete({
      where: {
        id: id,
      },
    });
  }

  /**
   * Delete all password reset tokens associated with a specific user ID.
   * @param userId - The ID of the user whose password reset tokens should be deleted.
   * @returns The result of the delete operation, including the count of deleted records.
   */
  async deleteByUserId(userId: string, tx?: Prisma.TransactionClient) {
    // Use the Prisma client to delete all password reset tokens from the database that are associated with the provided user ID
    return await (tx || prisma).passwordResetToken.deleteMany({
      where: {
        userId: userId,
      },
    });
  }
}
