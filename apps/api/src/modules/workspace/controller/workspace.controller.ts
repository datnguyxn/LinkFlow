import type { FastifyRequest, FastifyReply } from 'fastify';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';
import { WorkspaceService } from '../service/workspace.service.ts';
import type { WorkspaceInput } from '../validator/workspace.validator.ts';
import { WorkspaceSerializer } from '../../../common/serializers/workspace.serializer.ts';

/**
 * WorkspaceController class handles HTTP requests related to workspaces.
 * It provides methods for creating workspaces and other workspace-related operations.
 */
export class WorkspaceController {
  // The WorkspaceService instance is injected into the WorkspaceController class, allowing it to access the service methods for workspace-related operations.
  private workspaceService: WorkspaceService;

  // The constructor initializes the WorkspaceController class and creates an instance of the WorkspaceService.
  constructor() {
    this.workspaceService = new WorkspaceService();
  }

  /**
   * Handles the creation of a new workspace.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Retrieves the IP address from the request object.
   * 3. Extracts the workspace data from the request body.
   * 4. Calls the WorkspaceService to create a new workspace with the provided data, user ID, and IP address.
   * 5. If workspace creation is successful, returns a success response with the newly created workspace.
   * 6. If workspace creation fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the newly created workspace or an error response if creation fails.
   */
  async createWorkspace(
    request: FastifyRequest<{
      Body: WorkspaceInput;
    }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Retrieve the IP address from the request object
    const ipAddress = request.ip;

    // Extract the workspace data from the request body
    const data = request.body;

    // Call the WorkspaceService to create a new workspace with the provided data, user ID, and IP address
    const newWorkspace = await this.workspaceService.createWorkspace(data, id, ipAddress);

    // If workspace creation fails, return an error response indicating the failure
    if (!newWorkspace) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'workspace.creationFailed',
      );
    }

    // If workspace creation is successful, return a success response with the newly created workspace
    return ResponseHandler.success(reply, newWorkspace, 'workspace.created', HTTP_STATUS.CREATED);
  }

  /**
   * Handles the retrieval of all workspaces for a specific user.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Calls the WorkspaceService to retrieve all workspaces associated with the user ID.
   * 3. If workspace retrieval is successful, returns a success response with the list of workspaces.
   * 4. If workspace retrieval fails, returns an error response indicating the failure.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the list of workspaces or an error response if retrieval fails.
   */
  async getAllWorkspaces(request: FastifyRequest, reply: FastifyReply) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Call the WorkspaceService to retrieve all workspaces associated with the user ID
    const workspaces = await this.workspaceService.getAllWorkspaces(id);

    // If workspace retrieval fails, return an error response indicating the failure
    if (!workspaces) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'workspace.retrievalFailed',
      );
    }

    // Serialize the workspaces to include the user's role in each workspace
    const result = WorkspaceSerializer.serializeMany(workspaces);

    // If workspace retrieval is successful, return a success response with the list of workspaces
    return ResponseHandler.success(reply, result, 'workspace.retrieved', HTTP_STATUS.OK);
  }

  /**
   * Handles the retrieval of a specific workspace by its ID.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Extracts the workspace ID from the request parameters.
   * 3. Calls the WorkspaceService to retrieve the workspace associated with the provided workspace ID and user ID.
   * 4. If the workspace is not found, returns an error response indicating that the workspace was not found.
   * 5. If the workspace is found, serializes the workspace data and returns a success response with the serialized workspace.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the serialized workspace or an error response if the workspace is not found.
   */
  async getWorkspaceById(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Extract the workspace ID from the request parameters
    const workspaceId = request.params.id;

    // Call the WorkspaceService to retrieve the workspace associated with the provided workspace ID and user ID
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId, id);

    // If the workspace is not found, return an error response indicating that the workspace was not found
    if (!workspace) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, 'workspace.notFound');
    }

    // Serialize the workspace data to include the user's role in the workspace
    const result = WorkspaceSerializer.serializeWithMember(workspace);

    // If the workspace is found, return a success response with the serialized workspace
    return ResponseHandler.success(reply, result, 'workspace.retrieved', HTTP_STATUS.OK);
  }

  /**
   * Handles the update of a specific workspace by its ID.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Extracts the workspace ID from the request parameters.
   * 3. Extracts the workspace data from the request body.
   * 4. Calls the WorkspaceService to update the workspace associated with the provided workspace ID and user ID.
   * 5. If the workspace update fails, returns an error response indicating that the update failed.
   * 6. If the workspace update is successful, returns a success response with the updated workspace.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the updated workspace or an error response if the update fails.
   */
  async updateWorkspace(
    request: FastifyRequest<{
      Params: { id: string };
      Body: WorkspaceInput;
    }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Extract the workspace ID from the request parameters
    const workspaceId = request.params.id;

    // Extract the workspace data from the request body
    const data = request.body;

    // Retrieve the IP address from the request object
    const ipAddress = request.ip;

    // Call the WorkspaceService to update the workspace associated with the provided workspace ID and user ID
    const updatedWorkspace = await this.workspaceService.updateWorkspace(
      workspaceId,
      data,
      id,
      ipAddress,
    );

    // If the workspace update fails, return an error response indicating that the update failed
    if (!updatedWorkspace) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'workspace.updateFailed',
      );
    }

    // If the workspace update is successful, return a success response with the updated workspace
    return ResponseHandler.success(reply, updatedWorkspace, 'workspace.updated', HTTP_STATUS.OK);
  }

  /**
   * Handles the deletion of a specific workspace by its ID.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Extracts the workspace ID from the request parameters.
   * 3. Retrieves the IP address from the request object.
   * 4. Calls the WorkspaceService to delete the workspace associated with the provided workspace ID and user ID.
   * 5. If the workspace deletion fails, returns an error response indicating that the deletion failed.
   * 6. If the workspace deletion is successful, returns a success response with the deleted workspace.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the deleted workspace or an error response if the deletion fails.
   */
  async deleteWorkspace(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Extract the workspace ID from the request parameters
    const workspaceId = request.params.id;

    // Retrieve the IP address from the request object
    const ipAddress = request.ip;

    // Call the WorkspaceService to delete the workspace associated with the provided workspace ID and user ID
    const deletedWorkspace = await this.workspaceService.deleteWorkspace(
      workspaceId,
      id,
      ipAddress,
    );

    // If the workspace deletion fails, return an error response indicating that the deletion failed
    if (!deletedWorkspace) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'workspace.deletionFailed',
      );
    }

    // If the workspace deletion is successful, return a success response with the deleted workspace
    return ResponseHandler.success(reply, deletedWorkspace, 'workspace.deleted', HTTP_STATUS.OK);
  }

  /**
   * Handles the restoration of a specific workspace by its ID.
   * Flow:
   * 1. Extracts the user ID from the request object.
   * 2. Extracts the workspace ID from the request parameters.
   * 3. Retrieves the IP address from the request object.
   * 4. Calls the WorkspaceService to restore the workspace associated with the provided workspace ID and user ID.
   * 5. If the workspace restoration fails, returns an error response indicating that the restoration failed.
   * 6. If the workspace restoration is successful, returns a success response with the restored workspace.
   *
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the restored workspace or an error response if the restoration fails.
   */
  async restoreWorkspace(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    // Extract the user ID from the request object
    const id = request.user?.id as string;

    // Extract the workspace ID from the request parameters
    const workspaceId = request.params.id;

    // Retrieve the IP address from the request object
    const ipAddress = request.ip;

    // Call the WorkspaceService to restore the workspace associated with the provided workspace ID and user ID
    const restoredWorkspace = await this.workspaceService.restoreWorkspace(
      workspaceId,
      id,
      ipAddress,
    );

    // If the workspace restoration fails, return an error response indicating that the restoration failed
    if (!restoredWorkspace) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'workspace.restoreFailed',
      );
    }

    // If the workspace restoration is successful, return a success response with the restored workspace
    return ResponseHandler.success(reply, restoredWorkspace, 'workspace.restored', HTTP_STATUS.OK);
  }
}
