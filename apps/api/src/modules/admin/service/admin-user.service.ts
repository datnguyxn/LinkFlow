import { UserRepository } from '../../users/repository/user.repository.ts';
import { ConflictError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import { UserStatus, UserRole } from '@prisma/client';
import { RefreshTokenRepository } from '../../refresh-token/repository/refresh-token.repository.ts';
import { AdminUserPublisher } from '../../../publishers/admin/user/admin-user.publisher.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { UserAction } from '../../../common/enums/user-action.enum.ts';
import type { UserActionEvent } from '../../../events/index.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { OAuthRepository } from '../../users/repository/oauth.repository.ts';

/**
 * AdminUserService class provides methods for managing user accounts from an admin perspective.
 * It includes functionalities such as fetching all users, banning/unbanning users, changing user roles,
 * deleting/restoring users, and retrieving user details by ID.
 * It interacts with the UserRepository to perform database operations.
 */
export class AdminUserService {
  /**
   * Constructor for AdminUserService
   * @param userRepository - An instance of UserRepository for database operations
   */
  constructor(
    // Initialize the user repository for database interactions
    private userRepository: UserRepository = new UserRepository(),
    private refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository(),
    private adminUserPublisher: AdminUserPublisher = new AdminUserPublisher(new Publisher()),
    private transactionService: TransactionService = new TransactionService(),
    private oauthRepository: OAuthRepository = new OAuthRepository(),
  ) {}

  /**
   * Fetch all users with pagination
   * @param page - The page number for pagination
   * @param limit - The number of users to fetch per page
   * @returns An object containing the list of users and pagination metadata
   */
  async getAllUsers(page: number, limit: number) {
    // Logic to fetch all users with pagination
    return this.userRepository.findAll(page, limit);
  }

  /**
   * Ban a user by their unique ID
   * - This method updates the user's status to SUSPENDED and revokes all their refresh tokens.
   * - It also publishes a user action event to RabbitMQ for auditing purposes.
   *
   * @param adminId - The unique ID of the admin performing the action
   * @param ipAddress - The IP address of the admin performing the action (optional)
   * @param userId - The unique ID of the user to ban
   * @returns The updated user object with status set to SUSPENDED
   * @throws ConflictError if the user is not found
   */
  async banUser(userId: string, adminId: string, ipAddress: string = '') {
    // Check if the user exists before attempting to ban
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to ban the user by updating their status to SUSPENDED and revoking all refresh tokens
    const userUpdate = await this.transactionService.run(async (tx) => {
      // Update the user's status to SUSPENDED
      const userUpdated = await this.userRepository.update(
        userId,
        { status: UserStatus.SUSPENDED },
        tx,
      );

      // Revoke all refresh tokens for the banned user
      await this.refreshTokenRepository.revokeAllByUserId(userId, tx);

      const oauthAccounts = await this.oauthRepository.findByUserId(userId, tx);

      return { userUpdated, provider: oauthAccounts[0]?.provider || 'LOCAL' };
    });

    // Create a user action event for banning the user
    const event: UserActionEvent = {
      event: UserAction.USER_ACTION,
      action: UserAction.BAN,
      email: user.email,
      fullName: user.fullName || '',
      adminId: adminId,
      targetUserId: userId,
      reason: 'User has been banned by admin',
      changes: {
        status: { oldValue: user.status, newValue: UserStatus.SUSPENDED },
      },
      timestamp: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the user action event to RabbitMQ
    await this.adminUserPublisher.userAction(event);

    // Return the updated user object
    return userUpdate;
  }

  /**
   * Unban a user by their unique ID
   * - This method updates the user's status to ACTIVE.
   * - It also publishes a user action event to RabbitMQ for auditing purposes.
   *
   * @param adminId - The unique ID of the admin performing the action
   * @param ipAddress - The IP address of the admin performing the action (optional)
   * @param userId - The unique ID of the user to unban
   * @returns The updated user object with status set to ACTIVE
   * @throws ConflictError if the user is not found
   */
  async unbanUser(userId: string, adminId: string, ipAddress: string = '') {
    // Check if the user exists before attempting to ban
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to unban the user by updating their status to ACTIVE
    const updatedUser = await this.transactionService.run(async (tx) => {
      const userUpdated = await this.userRepository.update(
        userId,
        { status: UserStatus.ACTIVE },
        tx,
      );

      const oauthAccounts = await this.oauthRepository.findByUserId(userId, tx);

      return { userUpdated, provider: oauthAccounts[0]?.provider || 'LOCAL' };
    });

    // Create a user action event for unbanning the user
    const event: UserActionEvent = {
      event: UserAction.USER_ACTION,
      action: UserAction.UNBAN,
      email: user.email,
      fullName: user.fullName || '',
      adminId: adminId,
      targetUserId: userId,
      reason: 'User has been unbanned by admin',
      changes: {
        status: { oldValue: user.status, newValue: UserStatus.ACTIVE },
      },
      timestamp: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the user action event to RabbitMQ
    await this.adminUserPublisher.userAction(event);

    // Return the updated user object
    return updatedUser;
  }

  /**
   * Change a user's role
   * - This method updates the user's role in the database.
   * - It also publishes a user action event to RabbitMQ for auditing purposes.
   *
   * @param adminId - The unique ID of the admin performing the action
   * @param userId - The unique ID of the user whose role is to be changed
   * @param newRole - The new role to assign to the user
   * @param ipAddress - The IP address of the admin performing the action (optional)
   * @returns The updated user object with the new role
   * @throws ConflictError if the user is not found
   */
  async changeRole(adminId: string, userId: string, newRole: string, ipAddress: string = '') {
    // Check if the user exists before attempting to change the role
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }
    // Logic to change the user's role in the database
    const updatedUser = await this.transactionService.run(async (tx) => {
      const updatedUser = await this.userRepository.update(
        userId,
        {
          role: UserRole[newRole as keyof typeof UserRole],
        },
        tx,
      );

      const oauthAccounts = await this.oauthRepository.findByUserId(userId, tx);

      return { userUpdated: updatedUser, provider: oauthAccounts[0]?.provider || 'LOCAL' };
    });

    // Create a user action event for changing the user's role
    const event: UserActionEvent = {
      event: UserAction.USER_ACTION,
      action: UserAction.CHANGE_ROLE,
      email: user.email,
      fullName: user.fullName || '',
      adminId: adminId,
      targetUserId: userId,
      reason: `User role changed to ${newRole} by admin`,
      changes: {
        role: { oldValue: user.role, newValue: UserRole[newRole as keyof typeof UserRole] },
      },
      timestamp: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the user action event to RabbitMQ
    await this.adminUserPublisher.userAction(event);

    // Return the updated user object with the new role
    return updatedUser;
  }

  /**
   * Delete a user by ID
   * - This method deletes the user from the database.
   * - It also publishes a user action event to RabbitMQ for auditing purposes.
   * @param userId The unique ID of the user to delete
   * @param adminId The unique ID of the admin performing the action
   * @param ipAddress The IP address of the admin performing the action (optional)
   * @throws ConflictError if the user is not found
   */
  async deleteUser(userId: string, adminId: string, ipAddress: string = '') {
    // Check if the user exists before attempting to delete
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to delete the user from the database and revoke all their refresh tokens
    await this.transactionService.run(async (tx) => {
      // Revoke all refresh tokens for the banned user
      await this.refreshTokenRepository.revokeAllByUserId(userId, tx);

      // Logic to delete the user from the database
      await this.userRepository.delete(userId, tx);
    });

    // Create a user action event for deleting the user
    const event: UserActionEvent = {
      event: UserAction.USER_ACTION,
      action: UserAction.DELETE,
      email: user.email,
      fullName: user.fullName || '',
      adminId: adminId,
      targetUserId: userId,
      reason: 'User has been deleted by admin',
      changes: {
        status: { oldValue: user.status, newValue: UserStatus.DELETED },
      },
      timestamp: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the user action event to RabbitMQ
    await this.adminUserPublisher.userAction(event);
  }

  /**
   * Restore a deleted user by ID
   * - This method restores the user by updating their status to ACTIVE and clearing the deletedAt timestamp.
   * - It also publishes a user action event to RabbitMQ for auditing purposes.
   * @param userId The unique ID of the user to restore
   * @param adminId The unique ID of the admin performing the action
   * @param ipAddress The IP address of the admin performing the action (optional)
   * @returns The restored user object
   * @throws ConflictError if the user is not found
   */
  async restoreUser(userId: string, adminId: string, ipAddress: string = '') {
    // Check if the user exists before attempting to restore
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to restore the user by updating their status to ACTIVE and clearing the deletedAt timestamp
    const restoredUser = await this.transactionService.run(async (tx) => {
      const restoredUser = await this.userRepository.update(
        userId,
        {
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        tx,
      );

      const oauthAccounts = await this.oauthRepository.findByUserId(userId, tx);

      return { userUpdated: restoredUser, provider: oauthAccounts[0]?.provider || 'LOCAL' };
    });

    // Create a user action event for restoring the user
    const event: UserActionEvent = {
      event: UserAction.USER_ACTION,
      action: UserAction.RESTORE,
      email: user.email,
      fullName: user.fullName || '',
      adminId: adminId,
      targetUserId: userId,
      reason: 'User has been restored by admin',
      changes: {
        status: { oldValue: user.status, newValue: UserStatus.ACTIVE },
      },
      timestamp: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the user action event to RabbitMQ
    await this.adminUserPublisher.userAction(event);

    // Return the restored user object
    return restoredUser;
  }

  /**
   * Fetch a user by their unique ID
   * - This method retrieves the user from the database.
   * @param userId The unique ID of the user to fetch
   * @returns The user object if found
   * @throws ConflictError if the user is not found
   */
  async getUserById(userId: string) {
    // Check if the user exists before attempting to fetch
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    const provider = await this.oauthRepository.findByUserId(userId);

    // Return the user object if found
    return { user, provider: provider[0]?.provider || 'LOCAL' };
  }
}
