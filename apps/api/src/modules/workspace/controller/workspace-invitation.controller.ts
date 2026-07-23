import type { FastifyReply, FastifyRequest } from 'fastify';
import { WorkspaceInvitationService } from '../service/workspace-invitation.service.ts';
import type { CreateWorkspaceInvitationInput } from '../validator/workspace-invitation.validator.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';

/**
 * WorkspaceInvitationController handles incoming HTTP requests related to workspace invitations.
 * - It delegates business logic to the WorkspaceInvitationService and formats responses.
 */
export class WorkspaceInvitationController {

    // Initialize the WorkspaceInvitationService to handle business logic related to workspace invitations.
    private workspaceInvitationService: WorkspaceInvitationService;

    // The constructor initializes the WorkspaceInvitationService instance.
    constructor() {
        this.workspaceInvitationService = new WorkspaceInvitationService();
    }

    /**
     * Handles the creation of a new workspace invitation.
     * Flow:
     * 1. Extracts the workspace ID from the request parameters and the inviter's ID from the authenticated user.
     * 2. Validates the invitation data received in the request body.
     * 3. Calls the WorkspaceInvitationService to create the invitation.
     * 4. Returns a success response with the created invitation or an error response if creation fails.
     *
     * @param request - The Fastify request object containing the workspace ID and invitation data.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response with the created invitation or an error response if creation fails.
     */
    async createInvitation(
        request: FastifyRequest<{ Body: CreateWorkspaceInvitationInput, Params: { id: string } }>,
        reply: FastifyReply
    ) {

        // Extract the workspace ID from the request parameters
        const { id } = request.params;

        // Extract the inviter's user ID from the authenticated request user
        const inviterId = request.user.id;

        // Extract the invitation data from the request body
        const data = request.body;

        // Call the WorkspaceInvitationService to create the invitation
        const invitation = await this.workspaceInvitationService.createInvitation(
            id,
            inviterId,
            data,
            request.ip
        );

        // If the invitation creation fails, return an error response
        if (!invitation) {
            return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'workspace.invitationCreationFailed');
        }

        // If the invitation is created successfully, return a success response with the created invitation
        return ResponseHandler.success(reply, invitation, 'workspace.invitationCreated', HTTP_STATUS.CREATED);
    }

    /**
     * Handles the listing of all invitations for a specific workspace.
     * Flow:
     * 1. Extracts the workspace ID from the request parameters.
     * 2. Calls the WorkspaceInvitationService to retrieve the list of invitations for the specified workspace.
     * 3. Returns a success response with the list of invitations or an error response if retrieval fails.
     *
     * @param request - The Fastify request object containing the workspace ID.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response with the list of invitations or an error response if retrieval fails.
     */
    async listInvitations(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        // Extract the workspace ID from the request parameters
        const { id } = request.params;

        // Call the WorkspaceInvitationService to list invitations for the specified workspace
        const invitations = await this.workspaceInvitationService.listInvitations(id);

        // Return a success response with the list of invitations
        return ResponseHandler.success(reply, invitations, 'workspace.invitationsListed', HTTP_STATUS.OK);
    }

    /**
     * Handles the retrieval of a specific workspace invitation by its ID.
     * Flow:
     * 1. Extracts the invitation ID from the request parameters.
     * 2. Calls the WorkspaceInvitationService to retrieve the invitation by its ID.
     * 3. Returns a success response with the retrieved invitation or an error response if not found.
     *
     * @param request - The Fastify request object containing the invitation ID.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response with the retrieved invitation or an error response if not found.
     */
    async getInvitationById(
        request: FastifyRequest<{ Params: { id: string, invitationId: string } }>,
        reply: FastifyReply
    ) {
        // Extract the invitation ID from the request parameters
        const { invitationId } = request.params;

        // Call the WorkspaceInvitationService to retrieve the invitation by its ID
        const invitation = await this.workspaceInvitationService.getInvitationById(invitationId);

        // If the invitation is not found, return an error response
        if (!invitation) {
            return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, 'workspace.invitationNotFound');
        }

        // Return a success response with the retrieved invitation
        return ResponseHandler.success(reply, invitation, 'workspace.invitationRetrieved', HTTP_STATUS.OK);
    }

    /**
     * Handles the acceptance of a workspace invitation.
     * Flow:
     * 1. Extracts the workspace ID, invitation ID, and token from the request parameters and query string.
     * 2. Extracts the user ID from the authenticated request user.
     * 3. Calls the WorkspaceInvitationService to accept the invitation.
     * 4. Returns a success response if the invitation is accepted or an error response if acceptance fails.
     *
     * @param request - The Fastify request object containing the workspace ID, invitation ID, and token.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response if the invitation is accepted or an error response if acceptance fails.
     */
    async acceptInvitation(
        request: FastifyRequest<{ Params: { id: string, invitationId: string }, Querystring: { token: string } }>,
        reply: FastifyReply
    ) {
        // Extract the workspace ID and invitation ID from the request parameters
        const { id, invitationId } = request.params;

        // Extract the user ID from the authenticated request user
        const userId = request.user.id;

        // Extract the token from the request query parameters
        const { token } = request.query;

        // Extract the IP address from the request object
        const ipAddress = request.ip;

        // Call the WorkspaceInvitationService to accept the invitation
        const result = await this.workspaceInvitationService.acceptInvitation(
            id,
            invitationId,
            userId,
            ipAddress,
            token
        );

        // If the invitation acceptance fails, return an error response
        if (!result) {
            return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'workspace.invitationAcceptanceFailed');
        }

        // Return a success response indicating that the invitation was accepted successfully
        return ResponseHandler.success(reply, result, 'workspace.invitationAccepted', HTTP_STATUS.OK);
    }

    /**
     * Handles the validation of a workspace invitation.
     * Flow:
     * 1. Extracts the token from the request query parameters.
     * 2. Calls the WorkspaceInvitationService to validate the invitation.
     * 3. Returns a success response with the validation result or an error response if validation fails.
     *
     * @param request - The Fastify request object containing the token.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response with the validation result or an error response if validation fails.
     */
    async validateInvitation(
        request: FastifyRequest<{ Querystring: { token: string } }>,
        reply: FastifyReply
    ) {
        // Extract the token from the request query parameters
        const { token } = request.query;

        // Call the WorkspaceInvitationService to validate the invitation
        const result = await this.workspaceInvitationService.validateInvitation(token);

        // If the invitation validation fails, return an error response
        if (!result) {
            return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'workspace.invitationValidationFailed');
        }

        // Return a success response with the validation result
        return ResponseHandler.success(reply, result, 'workspace.invitationValidated', HTTP_STATUS.OK);
    }

    /**
     * Handles the revocation of a workspace invitation.
     * Flow:
     * 1. Extracts the workspace ID and invitation ID from the request parameters.
     * 2. Extracts the IP address from the request object.
     * 3. Calls the WorkspaceInvitationService to revoke the invitation.
     * 4. Returns a success response if the invitation is revoked or an error response if revocation fails.
     *
     * @param request - The Fastify request object containing the workspace ID and invitation ID.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response if the invitation is revoked or an error response if revocation fails.
     */
    async revokeInvitation(
        request: FastifyRequest<{ Params: { id: string, invitationId: string } }>,
        reply: FastifyReply
    ) {
        // Extract the workspace ID and invitation ID from the request parameters
        const { id, invitationId } = request.params;

        // Extract the IP address from the request object
        const ipAddress = request.ip;

        // Call the WorkspaceInvitationService to revoke the invitation
        const result = await this.workspaceInvitationService.revokeInvitation(
            id,
            invitationId,
            ipAddress
        );

        // If the invitation revocation fails, return an error response
        if (!result) {
            return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'workspace.invitationRevocationFailed');
        }

        // Return a success response indicating that the invitation was revoked successfully
        return ResponseHandler.success(reply, result, 'workspace.invitationRevoked', HTTP_STATUS.OK);
    }

    /**
     * Handles the rejection of a workspace invitation.
     * Flow:
     * 1. Extracts the workspace ID and invitation ID from the request parameters.
     * 2. Extracts the user ID from the authenticated request user and the IP address from the request object.
     * 3. Calls the WorkspaceInvitationService to reject the invitation.
     * 4. Returns a success response if the invitation is rejected or an error response if rejection fails.
     *
     * @param request - The Fastify request object containing the workspace ID and invitation ID.
     * @param reply - The Fastify reply object used to send the response back to the client.
     * @returns A success response if the invitation is rejected or an error response if rejection fails.
     */
    async rejectInvitation(
        request: FastifyRequest<{ Querystring: { token: string } }>,
        reply: FastifyReply
    ) {
        // Extract the token from the request query string
        const { token } = request.query;


        // Extract the IP address from the request object
        const ipAddress = request.ip;

        // Call the WorkspaceInvitationService to reject the invitation
        const result = await this.workspaceInvitationService.rejectInvitation(
            token,
            ipAddress
        );

        // If the invitation rejection fails, return an error response
        if (!result) {
            return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'workspace.invitationRejectionFailed');
        }

        // Return a success response indicating that the invitation was rejected successfully
        return ResponseHandler.success(reply, result, 'workspace.invitationRejected', HTTP_STATUS.OK);
    }
}