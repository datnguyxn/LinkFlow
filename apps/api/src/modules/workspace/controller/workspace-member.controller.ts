import type { FastifyReply, FastifyRequest } from 'fastify';
import { WorkspaceMemberService } from '../service/workspace-member.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';

/**
 * Controller class for managing workspace members.
 * This class handles HTTP requests related to workspace member operations,
 * such as transferring ownership of a workspace.
 */
export class WorkspaceMemberController {
  // The WorkspaceMemberService instance used to perform operations related to workspace members.
  private workspaceMemberService: WorkspaceMemberService;

  // The constructor initializes the WorkspaceMemberController and creates an instance of WorkspaceMemberService.
  constructor() {
    this.workspaceMemberService = new WorkspaceMemberService();
  }

  /**
   * Handles the transfer of ownership of a workspace.
   * Flow:
   * 1. Extracts the workspace ID and new owner ID from the request parameters and body.  
   * 2. Retrieves the current user's ID from the request object.
   * 3. Calls the transferOwnership method of the WorkspaceMemberService to perform the ownership transfer.
   * 4. If the transfer is successful, returns a success response with the updated workspace member information.
   * 5. If the transfer fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters and body.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the ownership transfer operation.
   */
  async transferOwnership(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
      Body: {
        newOwnerId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID from the request parameters and the new owner ID from the request body.
    const { id: workspaceId } = request.params;

    // Extract the new owner ID from the request body and the current user's ID from the request object.
    const { newOwnerId } = request.body;

    // Extract the current user's ID from the request object, which is typically set by authentication middleware.
    const currentUserId = request.user?.id;

    // Call the transferOwnership method of the WorkspaceMemberService to perform the ownership transfer.
    const response = await this.workspaceMemberService.transferOwnership(
      workspaceId,
      currentUserId,
      newOwnerId,
    );

    // If the transferOwnership method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.transferOwnershipFailed',
      );
    }

    // If the transferOwnership method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      response,
      'workspace.member.transferOwnershipSuccess',
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handles the listing of workspace members for a specific workspace.
   * Flow:
   * 1. Extracts the workspace ID from the request parameters.
   * 2. Calls the listWorkspaceMembers method of the WorkspaceMemberService to retrieve the list of members for the specified workspace.
   * 3. If the retrieval is successful, returns a success response with the list of workspace members.
   * 4. If the retrieval fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the workspace member listing operation.
   */
  async listWorkspaceMembers(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
      Querystring: {
        page: number;
        limit: number;
        search?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID from the request parameters.
    const { id: workspaceId } = request.params;

    // Extract pagination parameters (page, limit, search) from the request query string.
    const { page = 1, limit = 10, search } = request.query;

    // Call the listWorkspaceMembers method of the WorkspaceMemberService to retrieve the list of members for the specified workspace.
    const response = await this.workspaceMemberService.listWorkspaceMembers(
      workspaceId,
      page,
      limit,
      search,
    );

    // If the listWorkspaceMembers method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.listWorkspaceMembersFailed',
      );
    }

    // If the listWorkspaceMembers method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      response,
      'workspace.member.listWorkspaceMembersSuccess',
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handles the retrieval of a specific workspace member's information based on workspace ID and user ID.  
   * Flow:
   * 1. Extracts the workspace ID and user ID from the request parameters.
   * 2. Calls the getWorkspaceMember method of the WorkspaceMemberService to retrieve the member's information.
   * 3. If the retrieval is successful, returns a success response with the member's information.
   * 4. If the retrieval fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the workspace member retrieval operation.
   */
  async getWorkspaceMember(
    request: FastifyRequest<{
      Params: {
        id: string;
        userId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID and user ID from the request parameters.
    const { id, userId } = request.params;

    // Call the getWorkspaceMember method of the WorkspaceMemberService to retrieve the member's information based on the provided workspace ID and user ID.
    const response = await this.workspaceMemberService.getWorkspaceMember(id, userId);

    // If the getWorkspaceMember method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.getWorkspaceMemberFailed',
      );
    }

    // If the getWorkspaceMember method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      response,
      'workspace.member.getWorkspaceMemberSuccess',
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handles the update of a workspace member's role within a specific workspace.  
   * Flow:
   * 1. Extracts the workspace ID and user ID from the request parameters, and the new role ID from the request body.
   * 2. Retrieves the IP address of the request for auditing purposes.
   * 3. Calls the updateWorkspaceMemberRole method of the WorkspaceMemberService to perform the role update.
   * 4. If the update is successful, returns a success response with the updated member information.
   * 5. If the update fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters and body.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the workspace member role update operation.
   */
  async updateWorkspaceMemberRole(
    request: FastifyRequest<{
      Params: {
        id: string;
        userId: string;
      };
      Body: {
        newRoleId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID and user ID from the request parameters, and the new role ID from the request body.
    const { id, userId } = request.params;

    // Extract the new role ID from the request body and the IP address of the request for auditing purposes.
    const { newRoleId } = request.body;

    // Extract the IP address of the request for auditing purposes.
    const ipAddress = request.ip;

    // Call the updateWorkspaceMemberRole method of the WorkspaceMemberService to perform the role update for the specified workspace member.
    const response = await this.workspaceMemberService.updateWorkspaceMemberRole(
      id,
      userId,
      newRoleId,
      ipAddress,
    );

    // If the updateWorkspaceMemberRole method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.updateWorkspaceMemberRoleFailed',
      );
    }

    // If the updateWorkspaceMemberRole method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      response,
      'workspace.member.updateWorkspaceMemberRoleSuccess',
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handles the process of a user leaving a workspace.  
   * Flow:
   * 1. Extracts the workspace ID from the request parameters.
   * 2. Retrieves the current user's ID and IP address from the request object.
   * 3. Calls the leaveWorkspace method of the WorkspaceMemberService to perform the leave operation.
   * 4. If the leave operation is successful, returns a success response with relevant information.
   * 5. If the leave operation fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the workspace member leave operation.
   */
  async leaveWorkspace(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID from the request parameters.
    const { id } = request.params;

    // Extract the current user's ID from the request object, which is typically set by authentication middleware, and the IP address of the request for auditing purposes.
    const userId = request.user?.id;

    // Extract the IP address of the request for auditing purposes.
    const ipAddress = request.ip;

    // Call the leaveWorkspace method of the WorkspaceMemberService to perform the leave operation for the specified workspace member.
    const response = await this.workspaceMemberService.leaveWorkspace(id, userId, ipAddress);

    // If the leaveWorkspace method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.leaveWorkspaceFailed',
      );
    }

    // If the leaveWorkspace method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      null,
      'workspace.member.leaveWorkspaceSuccess',
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handles the removal of a workspace member from a specific workspace.  
   * Flow:
   * 1. Extracts the workspace ID and user ID from the request parameters.
   * 2. Retrieves the IP address of the request for auditing purposes.
   * 3. Calls the leaveWorkspace method of the WorkspaceMemberService to perform the removal operation.
   * 4. If the removal operation is successful, returns a success response with relevant information.
   * 5. If the removal operation fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing request parameters.
   * @param reply - The FastifyReply object used to send responses back to the client.
   * @returns A promise that resolves to the HTTP response indicating the result of the workspace member removal operation.
   */
  async removeWorkspaceMember(
    request: FastifyRequest<{
      Params: {
        id: string;
        userId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the workspace ID and user ID from the request parameters.
    const { id, userId } = request.params;

    // Extract the IP address of the request for auditing purposes.
    const ipAddress = request.ip;

    // Call the removeWorkspaceMember method of the WorkspaceMemberService to perform the removal operation for the specified workspace member.
    const response = await this.workspaceMemberService.removeWorkspaceMember(id, userId, ipAddress);

    // If the removeWorkspaceMember method returns a falsy value (indicating failure), return an error response with a BAD_REQUEST status and an appropriate error message.
    if (!response) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        'workspace.member.removeWorkspaceMemberFailed',
      );
    }

    // If the removeWorkspaceMember method returns a truthy value (indicating success), return a success response with an OK status and an appropriate success message.
    return ResponseHandler.success(
      reply,
      null,
      'workspace.member.removeWorkspaceMemberSuccess',
      HTTP_STATUS.OK,
    );
  }
}
