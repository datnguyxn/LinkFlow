import { UserRepository } from '../repository/user.repository.ts';
import { Prisma, UserStatus } from '@prisma/client';
import { hashPassword, comparePassword } from '../../../utils/password.util.ts';
import { ConflictError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import type { MultipartFile } from '@fastify/multipart';
import { validateAvatar } from '../validator/image.validator.ts';
import { MinioStorageService, STORAGE_FOLDER } from '../../../infrastructure/storage/index.ts';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { OAuthRepository } from '../repository/oauth.repository.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { UserPublisher } from '../../../publishers/user/user.publisher.ts';
import type { 
  UserProfileUpdatedEvent,
  UserAccountDeletedEvent, 
  UserPasswordChangedEvent,
  UserAvatarUpdatedEvent } from '../../../events/index.ts';

/**
 * UserService class provides methods for managing user profiles,
 * including updating profile information,
 * changing passwords,
 * deleting accounts,
 * and fetching user profiles.
 * It interacts with the UserRepository to perform database operations.  
 */
export class UserService {
  constructor(
    private userRepository: UserRepository = new UserRepository(),
    private storageService: MinioStorageService = new MinioStorageService(),
    private oauthRepository: OAuthRepository = new OAuthRepository(),
    private userPublisher = new UserPublisher(new Publisher()),
  ) {}

  /**
   * Update user profile information
   * @param userId - The unique ID of the user to update
   * @param updateData - The data to update for the user
   * @param ipAddress - The IP address of the user performing the update (optional)
   * @returns The updated user object
   */
  async updateProfile(userId: string, updateData: Prisma.UserUpdateInput, ipAddress: string | null) {
    // Check if the user exists before attempting to update
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to update user profile in the database
    const updatedUser = await this.userRepository.update(userId, updateData);

    // Create an event object to log the profile update action
    const event: UserProfileUpdatedEvent = {
      userId,
      changedFields: Object.keys(updateData),
      updatedAt: new Date(),
      updatedBy: user.fullName || user.email,
      ipAddress: ipAddress || null,
    };

    // Publish the profile update event to RabbitMQ
    await this.userPublisher.userProfileUpdated(event);

    // Return the updated user object
    return updatedUser;
  }

  /**
   * Change user password
   * @param userId - The unique ID of the user changing their password
   * @param oldPassword - The current password of the user
   * @param newPassword - The new password to set for the user
   * @param ipAddress - The IP address of the user performing the password change (optional)
   * @returns The updated user object with the new password
   * @throws ConflictError if the user is not found or if the old password is incorrect
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string, ipAddress: string | null) {
    // Check if the user exists before attempting to change the password
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Verify the old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.passwordHash || '');
    if (!isOldPasswordValid) {
      throw new ConflictError('user.oldPasswordIncorrect', ERROR_CODE.INVALID_CREDENTIALS);
    }

    const isNewPasswordSameAsOld = await comparePassword(newPassword, user.passwordHash || '');
    if (isNewPasswordSameAsOld) {
      throw new ConflictError('user.newPasswordSameAsOld', ERROR_CODE.INVALID_CREDENTIALS);
    }

    // Hash the new password and update it in the database
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    const updatedUser = await this.userRepository.update(userId, {
      passwordHash: hashedNewPassword,
    });

    // Create an event object to log the password change action
    const event: UserPasswordChangedEvent = {
      userId: userId,
      changedBy: user.fullName || user.email,
      changedAt: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the password change event to RabbitMQ
    await this.userPublisher.userPasswordChanged(event);

    // Return the updated user object
    return updatedUser;
  }

  /**
   * Delete user account
   * @param userId - The unique ID of the user to delete
   * @param ipAddress - The IP address of the user performing the deletion (optional)
   * @returns The deleted user object
   * @throws ConflictError if the user is not found
   */
  async deleteMyAccount(userId: string, ipAddress: string | null) {
    // Check if the user exists before attempting to delete
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Logic to delete user account from the database
    const deletedUser = await this.userRepository.update(userId, {
      status: UserStatus.DELETED,
      deletedAt: new Date(),
    });

    // If the user had an avatar, delete it from the storage service
    if (!deletedUser) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Create an event object to log the account deletion action
    const event: UserAccountDeletedEvent = {
      userId: userId,
      deletedBy: user.fullName || user.email,
      deletedAt: deletedUser.deletedAt || new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the account deletion event to RabbitMQ
    await this.userPublisher.userAccountDeleted(event);

    // Return the deleted user object
    return deletedUser;
  }

  /**
   * Fetch user profile information
   * @param userId - The unique ID of the user to fetch
   * @returns The user object containing profile information
   * @throws ConflictError if the user is not found
   */
  async getMyProfile(userId: string) {
    // Check if the user exists before attempting to fetch profile
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    const provider = await this.oauthRepository.findByUserId(userId);

    return { user, provider: provider[0]?.provider || 'LOCAL' };
  }

  /**
   * Upload user avatar
   * @param userId - The unique ID of the user uploading the avatar
   * @param avatarFile - The avatar file to upload
   * @param ipAddress - The IP address of the user performing the upload (optional)
   * @returns An object containing the public URL of the uploaded avatar
   */
  async uploadAvatar(userId: string, avatarFile: MultipartFile, ipAddress: string | null) {
    // Check if the user exists before attempting to upload avatar
    const user = await this.userRepository.findById(userId);

    // If the user does not exist, throw a ConflictError
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // Store the old avatar URL to delete it later if a new avatar is uploaded
    const oldAvatarUrl = user.avatarUrl;

    // Validate the avatar file (e.g., check file type, size)
    const buffer = await validateAvatar(avatarFile);

    // Generate a unique file name and folder path for the avatar
    const fileName = `${randomUUID()}${extname(avatarFile.filename)}`;

    // Upload the avatar file to the storage service
    const folder = `${STORAGE_FOLDER.AVATAR}/${userId}`;

    // Upload the avatar file to the storage service
    const { objectKey } = await this.storageService.uploadFile({
      folder,
      fileName,
      mimeType: avatarFile.mimetype,
      buffer,
    });

    // Update the user's avatar URL in the database
    await this.userRepository.update(userId, { avatarUrl: objectKey });

    // If the user had an old avatar, delete it from the storage service
    if (oldAvatarUrl) {
      try {
        // Delete the old avatar file from the storage service
        await this.storageService.deleteFile(oldAvatarUrl);
      } catch (error) {
        // Log the error and throw a ConflictError if the deletion fails
        console.error(`Failed to delete old avatar: ${error}`);
        throw new ConflictError('user.avatar.deleteFailed', ERROR_CODE.FILE_DELETE_FAILED);
      }
    }

    // Create an event object to log the avatar update action
    const event: UserAvatarUpdatedEvent = {
      userId: userId,
      updatedBy: userId,
      updatedAt: new Date(),
      ipAddress: ipAddress,
    };

    // Publish the avatar update event to RabbitMQ
    await this.userPublisher.userAvatarUpdated(event);

    // Return the public URL of the uploaded avatar
    return {
      objectKey,
    };
  }

  /**
   * Fetch user avatar
   * @param userId - The unique ID of the user whose avatar is to be fetched
   * @returns An object containing the file stream and metadata of the user's avatar
   * @throws ConflictError if the user or avatar is not found
   */
  async getMyAvatar(userId: string) {
    // Check if the user exists before attempting to fetch the avatar
    const user = await this.userRepository.findById(userId);

    // If the user does not exist, throw a ConflictError
    if (!user) {
      throw new ConflictError('user.userNotFound', ERROR_CODE.NOT_FOUND);
    }

    // If the user does not have an avatar, throw a ConflictError
    if (!user.avatarUrl) {
      return null;
    }

    // Fetch the avatar file stream and metadata from the storage service
    const stream = await this.storageService.getFileStream(user.avatarUrl);

    // Fetch the metadata of the avatar file from the storage service
    const metadata = await this.storageService.getFileMetadata(user.avatarUrl);

    // Return the file stream and metadata of the user's avatar
    return { stream, metadata };
  }
}
