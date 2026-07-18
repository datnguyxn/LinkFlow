import type { FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { UserService } from '../service/user.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';
import { UserSerializer } from '../../../common/serializers/user.serializer.ts';
import type { MultipartFile } from '@fastify/multipart';

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
   * 4. Return success response with user data and provider information
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws ConflictError if the user is not found
   */
  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Logic to fetch user by ID
    const result = await this.userService.getMyProfile(id);

    // Check if the user was found; if not, return a not found error
    if (!result.user) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }

    // Return a success response with the user data and provider information
    return ResponseHandler.success(
      reply,
      UserSerializer.serialize(result.user, result.provider),
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
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws ConflictError if the user is not found
   */
  async updateProfile(
    request: FastifyRequest<{ Body: Prisma.UserUpdateInput }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Extract the update data from the request body
    const updateData = request.body;

    // Logic to update user by ID
    const updatedUser = await this.userService.updateProfile(id, updateData);

    // Check if the user was found and updated; if not, return a not found error
    if (!updatedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }

    // Return a success response with the updated user data and a success message
    return ResponseHandler.success(reply, updatedUser, request.t('user.userUpdatedSuccessfully'));
  }

  /**
   * Handle request to delete user account
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Call service to delete user account
   * 3. Return error if user not found
   * 4. Return success response confirming deletion
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws ConflictError if the user is not found
   */
  async deleteMyAccount(request: FastifyRequest, reply: FastifyReply) {
    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Logic to delete user by ID
    const deletedUser = await this.userService.deleteMyAccount(id);

    // Check if the user was found and deleted; if not, return a not found error
    if (!deletedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }

    // Return a success response with the deleted user data and a success message
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
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws ConflictError if the user is not found or if the old password is incorrect
   */
  async changePassword(
    request: FastifyRequest<{ Body: { oldPassword: string; newPassword: string } }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Extract old and new passwords from the request body
    const { oldPassword, newPassword } = request.body;

    // Logic to change user password
    const updatedUser = await this.userService.changePassword(id, oldPassword, newPassword);

    // Check if the user was found and the password was changed; if not, return a not found error
    if (!updatedUser) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t('user.userNotFound'));
    }

    // Return a success response with the updated user data and a success message
    return ResponseHandler.success(
      reply,
      updatedUser,
      request.t('user.passwordChangedSuccessfully'),
    );
  }

  /**
   * Handle request to upload or update user avatar
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Extract avatar file from request
   * 3. Call service to upload or update user avatar
   * 4. Return error if file is not provided
   * 5. Return success response with updated user data
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws BadRequestError if the avatar file is not provided
   */
  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    // Extract the uploaded file from the request
    const file = (request.body as { file: MultipartFile }).file;

    // Check if the file is provided; if not, return a bad request error
    if (!file) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        request.t('user.avatar.fileRequired'),
      );
    }

    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Call the service to handle the avatar upload and update the user's profile
    const updatedUser = await this.userService.uploadAvatar(id, file);

    // Return a success response with the updated user data and a success message
    return ResponseHandler.success(
      reply,
      updatedUser,
      request.t('user.avatar.uploadedSuccessfully'),
    );
  }

  /**
   * Handle request to fetch the user's avatar
   * Flow:
   * 1. Extract user ID from request parameters
   * 2. Call service to fetch user avatar
   * 3. Return error if avatar is not found
   * 4. Return success response with avatar data
   *
   * @param request - FastifyRequest object containing request data
   * @param reply - FastifyReply object for sending responses
   * @returns - A promise that resolves to the HTTP response
   *
   * @throws NotFoundError if the avatar is not found
   */
  async getMyAvatar(request: FastifyRequest, reply: FastifyReply) {
    // Extract the user ID from the authenticated request
    const id = request.user.id;

    // Call the service to fetch the user's avatar data
    const avatarData = await this.userService.getMyAvatar(id);

    // Check if the avatar data is found; if not, return a not found error
    if (!avatarData) {
      return ResponseHandler.success(
        reply,
        null,
        request.t('user.avatar.notFound'),
        HTTP_STATUS.NO_CONTENT,
      );
    }

    reply.header(
      'Content-Type',
      avatarData.metadata.metaData['content-type'] ?? 'application/octet-stream',
    );

    return reply.send(avatarData.stream);
  }
}
