import type { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { UserService } from '../service/user.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';
import { UserSerializer } from '../../../common/serializers/user.serializer.ts';

/**
 * UserController handles incoming HTTP requests related to user management.
 * - It delegates business logic to the UserService and formats responses.
 */
export class UserController {
  private userService: UserService;

  // Initialize service layer
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Handle request to fetch a user by ID
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Call service to fetch user by ID
   * 3. Return error if user not found
   * 4. Return success response with user data
   */
  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.id;
    // Logic to fetch user by ID
    const user = await this.userService.getMyProfile(id);
    if (!user) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }
    return ResponseHandler.success(
      reply,
      UserSerializer.serialize(user),
      request.t('user.userFetchedSuccessfully'),
    );
  }

  /**
   * Handle request to update user profile
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Extract update data from request body
   * 3. Call service to update user profile
   * 4. Return error if user not found
   * 5. Return success response with updated user data
   */
  async updateProfile(
    request: FastifyRequest<{ Body: Prisma.UserUpdateInput }>,
    reply: FastifyReply,
  ) {
    const id = request.user.id;
    const updateData = request.body;
    // Logic to update user by ID
    const updatedUser = await this.userService.updateProfile(id, updateData);
    if (!updatedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }
    return ResponseHandler.success(reply, updatedUser, request.t('user.userUpdatedSuccessfully'));
  }

  /**
   * Handle request to delete user account
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Call service to delete user account
   * 3. Return error if user not found
   * 4. Return success response confirming deletion
   */
  async deleteMyAccount(request: FastifyRequest, reply: FastifyReply) {
    const id = request.user.id;
    // Logic to delete user by ID
    const deletedUser = await this.userService.deleteMyAccount(id);
    if (!deletedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }
    return ResponseHandler.success(reply, deletedUser, request.t('user.userDeletedSuccessfully'));
  }

  /**
   * Handle request to change user password
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Extract old and new passwords from request body
   * 3. Call service to change user password
   * 4. Return error if user not found or old password is incorrect
   * 5. Return success response confirming password change
   */
  async changePassword(
    request: FastifyRequest<{ Body: { oldPassword: string; newPassword: string } }>,
    reply: FastifyReply,
  ) {
    const id = request.user.id;
    const { oldPassword, newPassword } = request.body;
    // Logic to change user password
    const updatedUser = await this.userService.changePassword(id, oldPassword, newPassword);
    if (!updatedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }
    return ResponseHandler.success(
      reply,
      updatedUser,
      request.t('user.passwordChangedSuccessfully'),
    );
  }
}
