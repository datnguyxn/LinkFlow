import { ResponseHandler } from "../../../common/responses/handler.response.js";
import type { FastifyRequest, FastifyReply } from "fastify";
import { HTTP_STATUS } from "../../../common/constants/index.ts";
import { AdminUserService } from "../service/admin-user.service.ts";
import { UserSerializer } from "../../../common/serializers/user.serializer.ts";

/**
 * AdminUserController handles incoming HTTP requests related to admin user management.
 * - It delegates business logic to the AdminUserService and formats responses.
 */
export class AdminUserController {
    // Initialize service layer
    constructor(
        private adminUserService: AdminUserService = new AdminUserService()
    ) { }

    /**
     * Handle request to fetch all users with pagination
     * Flow:
     * 1. Extract page and limit from query parameters
     * 2. Call service to fetch all users
     * 3. Return success response with serialized user data and pagination info
     */
    async getAllUsers(
        request: FastifyRequest<{
            Querystring: {
                page?: number;
                limit?: number
            }
        }>,
        reply: FastifyReply
    ) {
        const { page = 1, limit = 10 } = request.query;
        // Logic to fetch all users
        const users = await this.adminUserService.getAllUsers(page, limit);
        return ResponseHandler.success(
            reply,
            UserSerializer.serializeMany(users.data),
            request.t("user.usersFetchedSuccessfully"),
            HTTP_STATUS.OK,
            users.pagination
        );
    }

    /**
     * Handle request to fetch a user by ID
     * Flow:
     * 1. Extract user ID from request parameters
     * 2. Call service to fetch user by ID
     * 3. Return error if user not found
     * 4. Return success response with serialized user data
     */
    async banUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;

        const adminId = request.user?.id; // Assuming the admin's ID is available in the request context

        const ipAddress = request.ip; // Capture the IP address of the admin performing the action

        // Logic to ban user
        const bannedUser = await this.adminUserService.banUser(id, adminId, ipAddress);

        if (!bannedUser) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("user.userNotFound"));
        }

        return ResponseHandler.success(reply, UserSerializer.serialize(bannedUser), request.t("user.userUpdatedSuccessfully"));
    }

    /**
     * Handle request to unban a user by ID
     * Flow:
     * 1. Extract user ID from request parameters
     * 2. Call service to unban user by ID
     * 3. Return error if user not found
     * 4. Return success response with serialized user data
     */
    async unbanUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;

        const adminId = request.user?.id; // Assuming the admin's ID is available in the request context

        const ipAddress = request.ip; // Capture the IP address of the admin performing the action

        // Logic to unban user
        const unbannedUser = await this.adminUserService.unbanUser(id, adminId, ipAddress);

        if (!unbannedUser) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("user.userNotFound"));
        }

        return ResponseHandler.success(reply, UserSerializer.serialize(unbannedUser), request.t("user.userUpdatedSuccessfully"));
    }  

    /**
     * Handle request to change a user's role
     * Flow:
     * 1. Extract user ID and new role from request parameters and body
     * 2. Call service to change user role
     * 3. Return error if user not found
     * 4. Return success response with serialized user data
     */
    async changeRole(request: FastifyRequest<{ Params: { id: string }, Body: { newRole: string } }>, reply: FastifyReply) {

        // Extract user ID and new role from request parameters and body
        const { id } = request.params;
        const { newRole } = request.body;

        // Capture the admin ID and IP address from the request context
        const adminId = request.user?.id;
        const ipAddress = request.ip;

        // Logic to change user role
        const updatedUser = await this.adminUserService.changeRole(adminId, id, newRole, ipAddress);

        if (!updatedUser) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("user.userNotFound"));
        }

        return ResponseHandler.success(reply, UserSerializer.serialize(updatedUser), request.t("user.userUpdatedSuccessfully"));
    }

    /**
     * Handle request to delete a user by ID
     * Flow:
     * 1. Extract user ID from request parameters
     * 2. Call service to delete user by ID
     * 3. Return error if user not found
     * 4. Return success response confirming deletion
     */
    async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;

        const adminId = request.user?.id; // Assuming the admin's ID is available in the request context
        const ipAddress = request.ip; // Capture the IP address of the admin performing the action
        // Logic to delete user
        await this.adminUserService.deleteUser(id, adminId, ipAddress);

        return ResponseHandler.success(reply, null, request.t("user.userDeletedSuccessfully"));
    } 

    /**
     * Handle request to restore a deleted user by ID
     * Flow:
     * 1. Extract user ID from request parameters
     * 2. Call service to restore user by ID
     * 3. Return error if user not found
     * 4. Return success response with serialized user data
     */
    async restoreUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;

        const adminId = request.user?.id; // Assuming the admin's ID is available in the request context
        
        const ipAddress = request.ip; // Capture the IP address of the admin performing the action

        // Logic to restore user
        const restoredUser = await this.adminUserService.restoreUser(id, adminId, ipAddress);

        if (!restoredUser) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("user.userNotFound"));
        }

        return ResponseHandler.success(reply, UserSerializer.serialize(restoredUser), request.t("user.userUpdatedSuccessfully"));
    }   

    /**
     * Handle request to fetch a user by ID
     * Flow:
     * 1. Extract user ID from request parameters
     * 2. Call service to fetch user by ID
     * 3. Return error if user not found
     * 4. Return success response with serialized user data
     */
    async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = request.params;
        // Logic to fetch user by ID
        const user = await this.adminUserService.getUserById(id);

        if (!user) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, request.t("user.userNotFound"));
        }

        return ResponseHandler.success(reply, UserSerializer.serialize(user), request.t("user.usersFetchedSuccessfully"));
    }
}