import type { FastifyReply } from "fastify/types/reply.js";
import { UrlService } from '../service/url.service.ts';
import type { FastifyRequest } from "fastify/types/request.js";
import type { CreateUrlInput, UpdateUrlInput } from "../validator/url.validator.ts";
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import { HTTP_STATUS } from '../../../common/constants/index.ts';

/**
 * UrlController class handles HTTP requests related to URL operations.
 * - It uses the UrlService to perform business logic and interact with the database.
 */
export class UrlController {

  // The UrlService instance is injected into the UrlController class, allowing it to access the service methods for URL-related operations.
  private urlService: UrlService;

  // The ResponseHandler instance is used to standardize the API responses.
  constructor() {
    this.urlService = new UrlService();
  }

  /**
   * Handles the creation of a new URL.
   * Flow:
   * 1. Extracts the user ID, URL ID, and request data from the request object.
   * 2. Calls the UrlService to create the URL in the database.
   * 3. Returns a success response with the created URL data or an error response if the creation fails.
   * 
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the created URL data or an error response if the creation fails.
   */
  async createUrl(
    request: FastifyRequest<{ Params: { id: string }; Body: CreateUrlInput }>,
    reply: FastifyReply
  ) {
    // Extract the user ID from the request object (assuming authentication middleware has set it)
    const userId = request.user?.id;

    // Extract the workspace ID from the request parameters
    const { id } = request.params;

    // Extract the request body containing the URL data
    const data = request.body;

    // Extract the IP address from the request object
    const ipAddress = request.ip;

    // Call the UrlService to create the URL in the database
    const url = await this.urlService.createUrl(userId, id, data, ipAddress);

    // If the URL creation fails, return an error response
    if (!url) {
      return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'url.urlCreateFailed');
    }

    // If the URL creation is successful, return a success response with the created URL data
    return ResponseHandler.success(reply, url, 'url.urlCreated', HTTP_STATUS.CREATED);
  }

  /**
   * Handles the listing of URLs in a workspace with pagination and optional search.
   * Flow:
   * 1. Extracts the workspace ID, pagination parameters, and search term from the request object.
   * 2. Calls the UrlService to list URLs in the specified workspace.
   * 3. Returns a success response with the list of URLs or an error response if the listing fails.
   * 
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the list of URLs or an error response if the listing fails.
   */
  async listUrls(
    request: FastifyRequest<{
      Params: { id: string };
      Querystring: { page: number; limit: number; search?: string };
    }>,
    reply: FastifyReply
  ) {
    // Extract the workspace ID from the request parameters
    const { id } = request.params;

    // Extract the user ID from the request object (assuming authentication middleware has set it)
    const userId = request.user?.id;

    // Extract pagination and search parameters from the query string
    const { page = 1, limit = 10, search } = request.query;

    // Call the UrlService to list URLs in the specified workspace with pagination and optional search
    const urls = await this.urlService.listUrls(id, userId, page, limit, search);

    // Return a success response with the list of URLs
    return ResponseHandler.success(reply, urls, 'url.retrieved', HTTP_STATUS.OK);
  }

  /**
   * Handles the retrieval of a URL by its unique ID in a workspace.
   * Flow:
   * 1. Extracts the workspace ID and URL ID from the request parameters.
   * 2. Calls the UrlService to find the URL by its unique ID in the specified workspace.
   * 3. Returns a success response with the URL data or an error response if the URL is not found.
   * 
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the URL data or an error response if the URL is not found.
   */
  async findById(
    request: FastifyRequest<{ Params: { id: string; urlId: string } }>,
    reply: FastifyReply
  ) {
    // Extract the workspace ID and URL ID from the request parameters
    const { id, urlId } = request.params;

    // Extract the user ID from the request object (assuming authentication middleware has set it)
    const userId = request.user?.id;

    // Call the UrlService to find the URL by its unique ID in the specified workspace
    const url = await this.urlService.findById(id, userId, urlId);

    // If the URL is not found, return an error response
    if (!url) {
      return ResponseHandler.error(reply, HTTP_STATUS.NOT_FOUND, 'url.urlNotFound');
    }

    // If the URL is found, return a success response with the URL data
    return ResponseHandler.success(reply, url, 'url.retrieved', HTTP_STATUS.OK);
  }

  /**
   * Handles the updating of a URL in a workspace.
   * Flow:
   * 1. Extracts the workspace ID, URL ID, and request data from the request object.
   * 2. Calls the UrlService to update the URL in the database.
   * 3. Returns a success response with the updated URL data or an error response if the update fails.
   * 
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response with the updated URL data or an error response if the update fails.
   */
  async updateUrl(
    request: FastifyRequest<{ Params: { id: string; urlId: string }; Body: UpdateUrlInput }>,
    reply: FastifyReply
  ) {

    // Extract the workspace ID and URL ID from the request parameters
    const { id, urlId } = request.params;
 
    // Extract the user ID from the request object (assuming authentication middleware has set it)
    const userId = request.user?.id;

    // Extract the request body containing the updated URL data
    const data = request.body;

    // Extract the IP address from the request object
    const ipAddress = request.ip;

    // Call the UrlService to update the URL in the database
    const updatedUrl = await this.urlService.updateUrl(id, userId, urlId, data, ipAddress);

    // If the URL update fails, return an error response
    if (!updatedUrl) {
      return ResponseHandler.error(reply, HTTP_STATUS.BAD_REQUEST, 'url.urlUpdateFailed');
    }

    // If the URL update is successful, return a success response with the updated URL data
    return ResponseHandler.success(reply, updatedUrl, 'url.urlUpdated', HTTP_STATUS.OK);
  }

  /**
   * Handles the deletion of a URL in a workspace.
   * Flow:
   * 1. Extracts the workspace ID and URL ID from the request parameters.
   * 2. Calls the UrlService to delete the URL from the database.
   * 3. Returns a success response if the deletion is successful or an error response if it fails.
   * 
   * @param request - The FastifyRequest object containing the request data.
   * @param reply - The FastifyReply object used to send the response.
   * @returns A success response if the deletion is successful or an error response if it fails.
   */
  async deleteUrl(
    request: FastifyRequest<{ Params: { id: string; urlId: string } }>,
    reply: FastifyReply
  ) {
    const { id, urlId } = request.params;
    const userId = request.user?.id;
    const ipAddress = request.ip;

    await this.urlService.deleteUrl(id, userId, urlId, ipAddress);

    return ResponseHandler.success(reply, null, 'url.urlDeleted', HTTP_STATUS.OK);
  }
}
