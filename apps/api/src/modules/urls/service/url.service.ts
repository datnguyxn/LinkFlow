import { RedirectType, UrlStatus } from '@prisma/client';
import { UserRepository } from '../../users/index.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';
import { UrlRepository } from '../repositoy/url.repository.ts';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import type { CreateUrlInput, UpdateUrlInput } from '../validator/url.validator.ts';
import { nanoid } from 'nanoid';
import { hashPassword } from '../../../utils/password.util.ts';
import { WorkspaceMemberRepository } from '../../workspace/repository/workspace-member.repository.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { UrlPublisher } from '../../../publishers/urls/url.publisher.ts';
import type { 
  UrlCreatedEvent,
  UrlUpdatedEvent,
  UrlDeletedEvent,
 } from '../../../events/index.ts';

/**
 * UrlService class provides methods to interact with the URL data in the database.
 * It includes methods for finding, creating, updating, and deleting URLs, as well as handling pagination and other URL-related operations.
 */
export class UrlService {
  // The UrlRepository instance is injected into the UrlService class, allowing it to access the repository methods for URL-related database operations.
  constructor(
    private urlRepository = new UrlRepository(),
    private workspaceRepository = new WorkspaceRepository(),
    private workspaceMemberRepository = new WorkspaceMemberRepository(),
    private userRepository = new UserRepository(),
    private urlPublisher = new UrlPublisher(new Publisher())
  ) { }

  /**
   * Creates a new URL in the database.
   * 1. Validates the user's permission to create a URL in the specified workspace.
   * 2. Resolves the short code for the URL, either using a custom code or generating a unique one.
   * 3. Hashes the password if provided.
   * 4. Creates the URL record in the database and publishes a URL created event to RabbitMQ.
   *  
   * @param userId - The ID of the user creating the URL.
   * @param workspaceId - The ID of the workspace where the URL will be created.
   * @param input - The input data for creating the URL, including original URL, title, description, etc.
   * @param ipAddress - Optional IP address of the user creating the URL.
   * @returns The created URL record from the database.
   */
  async createUrl(userId: string, workspaceId: string, input: CreateUrlInput, ipAddress?: string) {

    // Validate the user's permission to create a URL in the specified workspace
    await this.validateWorkspacePermission(workspaceId, userId);

    // Resolve the short code for the URL, either using a custom code or generating a unique one
    const shortCode = await this.resolveShortCode(input.customCode);

    // Hash the password if provided
    const passwordHash = input.password ? await hashPassword(input.password) : null;

    // Create the URL record in the database
    const result = await this.urlRepository.createUrl(
      {
        shortCode: shortCode,
        originalUrl: input.originalUrl,
        title: input.title,
        description: input.description,
        faviconUrl: input.faviconUrl,
        redirectType: input.redirectType as RedirectType,
        passwordHash: passwordHash,
        expiresAt: input.expiresAt,
        maxClicks: input.maxClicks,
        clickCount: input.clickCount,

        user: {
          connect: {
            id: userId,
          },
        },
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      }
    );

    // Prepare the URL created event to be published to RabbitMQ
    const event: UrlCreatedEvent = {
      id: result.id,
      workspaceId: workspaceId,
      userId: userId,
      shortCode: result.shortCode,
      originalUrl: result.originalUrl,
      title: result.title,
      description: result.description,
      faviconUrl: result.faviconUrl,
      redirectType: result.redirectType,
      expiresAt: result.expiresAt,
      maxClicks: result.maxClicks,
      createdAt: result.createdAt,
      ipAddress: ipAddress || null,
    };

    // Publish the URL created event to RabbitMQ for further processing (e.g., caching, auditing)
    await this.urlPublisher.publishUrlCreated(event);

    // Return the created URL record from the database
    return result;
  }

  /**
   * Lists URLs in the specified workspace with pagination and optional search.
   *
   * @param workspaceId - The ID of the workspace to list URLs from.
   * @param page - The page number for pagination.
   * @param limit - The number of URLs to return per page.
   * @param search - Optional search term to filter URLs by original URL or short code.
   * @returns A paginated list of URLs in the specified workspace.
   */
  async listUrls(workspaceId: string, userId: string, page: number, limit: number, search?: string) {
    // Validate the user's permission to list URLs in the specified workspace
    await this.validateWorkspacePermission(workspaceId, userId);
    
    // List URLs in the specified workspace with pagination and optional search
    return this.urlRepository.findAllByWorkspaceIdWithPagination(workspaceId, page, limit, search);
  }

  /**
   * Finds a URL by its unique ID in the specified workspace.
   * 1. Validates the user's permission to access the specified URL in the workspace.
   * 2. Retrieves the URL record from the database by its unique ID.
   * 
   * @param workspaceId - The ID of the workspace where the URL is located.
   * @param userId - The ID of the user requesting the URL.
   * @param id - The unique ID of the URL to find.
   * @returns The URL record from the database if found, otherwise null.
   */
  async findById(workspaceId: string, userId: string, id: string) {
    // Validate the user's permission to access the specified URL in the workspace
    await this.validateWorkspacePermission(workspaceId, userId);

    // Find the URL by its unique ID in the database
    const url = await this.urlRepository.findById(id);

    // Check if the URL exists and belongs to the specified workspace
    if (!url || url.workspaceId !== workspaceId) {
      // If the URL is not found or does not belong to the specified workspace, throw a ForbiddenError
      throw new NotFoundError('url.urlNotFound', ERROR_CODE.URL_NOT_FOUND);
    }

    // Return the URL record from the database if found
    return url;
  }

  /**
   * Updates a URL in the specified workspace.
   * 1. Validates the user's permission to update the specified URL in the workspace.
   * 2. Retrieves the URL record from the database by its unique ID.
   * 3. Updates the URL record with the new input data and publishes a URL updated event to RabbitMQ.
   * 
   * @param workspaceId - The ID of the workspace where the URL is located.
   * @param userId - The ID of the user updating the URL.
   * @param urlId - The unique ID of the URL to update.
   * @param input - The input data for updating the URL, including original URL, title, description, etc.
   * @param ipAddress - Optional IP address of the user updating the URL.
   * @returns The updated URL record from the database if successful.
   */
  async updateUrl(workspaceId: string, userId: string, urlId: string, input: UpdateUrlInput, ipAddress?: string) {
    // Validate the user's permission to update the specified URL in the workspace
    await this.validateWorkspacePermission(workspaceId, userId);

    // Find the URL by its unique ID in the database
    const url = await this.urlRepository.findById(urlId);

    // Check if the URL exists and belongs to the specified workspace
    if (!url || url.workspaceId !== workspaceId) {
      // If the URL is not found or does not belong to the specified workspace, throw a NotFoundError
      throw new NotFoundError('url.urlNotFound', ERROR_CODE.URL_NOT_FOUND);
    }

    const passwordHash = input.password ? await hashPassword(input.password) : null;

    // Update the URL record in the database with the new input data
    const updatedUrl = await this.urlRepository.update(urlId, {
      originalUrl: input.originalUrl,
      title: input.title,
      description: input.description,
      faviconUrl: input.faviconUrl,
      redirectType: input.redirectType as RedirectType,
      passwordHash: passwordHash,
      expiresAt: input.expiresAt,
      maxClicks: input.maxClicks,
      clickCount: input.clickCount,
      updatedAt: new Date(),
    });

    // Prepare the URL updated event to be published to RabbitMQ
    const event: UrlUpdatedEvent = {
          id: updatedUrl.id,
          workspaceId: updatedUrl.workspaceId,
          userId: updatedUrl.userId,
          shortCode: updatedUrl.shortCode,
          originalUrl: updatedUrl.originalUrl,
      
          title: updatedUrl.title,
          description: updatedUrl.description,
          faviconUrl: updatedUrl.faviconUrl,
      
          redirectType: updatedUrl.redirectType,
          urlStatus: updatedUrl.status,
      
          expiresAt: updatedUrl.expiresAt,
          maxClicks: updatedUrl.maxClicks,
      
          updatedAt: updatedUrl.updatedAt,
          deletedAt: updatedUrl.deletedAt,
          expiredAt: updatedUrl.expiresAt,
      
          changedFields: Object.keys(input).filter((key): key is string => !!input[key as keyof CreateUrlInput]),
      
          ipAddress: ipAddress || null,
    };

    // Publish the URL updated event to RabbitMQ for further processing (e.g., caching, auditing)
    await this.urlPublisher.publishUrlUpdated(event);

    // Return the updated URL record from the database
    return updatedUrl;
  }

  async deleteUrl(workspaceId: string, userId: string, urlId: string, ipAddress?: string) {
    // Validate the user's permission to delete the specified URL in the workspace
    await this.validateWorkspacePermission(workspaceId, userId);

    // Find the URL by its unique ID in the database
    const url = await this.urlRepository.findById(urlId);

    // Check if the URL exists and belongs to the specified workspace
    if (!url || url.workspaceId !== workspaceId) {
      // If the URL is not found or does not belong to the specified workspace, throw a NotFoundError
      throw new NotFoundError('url.urlNotFound', ERROR_CODE.URL_NOT_FOUND);
    }

    // Delete the URL record from the database
    await this.urlRepository.update(urlId, {
      deletedAt: new Date(),
      updatedAt: new Date(),
      status: UrlStatus.DISABLED,
    });

    // Prepare the URL deleted event to be published to RabbitMQ
    const event: UrlDeletedEvent = {
      id: url.id,
      workspaceId: url.workspaceId,
      userId: url.userId,
      deletedBy: userId,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      title: url.title,
      status: UrlStatus.DISABLED,
      deletedAt: new Date(),
      ipAddress: ipAddress || null,
    };

    // Publish the URL deleted event to RabbitMQ for further processing (e.g., caching, auditing)
    await this.urlPublisher.publishUrlDeleted(event);
  }

  /**
   * Validates the user's permission to create a URL in the specified workspace.
   * If the user is not a member of the workspace, a ForbiddenError is thrown.
   * 
   * @param workspaceId - The ID of the workspace to validate.
   * @param userId - The ID of the user to validate.
   * @returns The workspace member record if the user has permission.
   * @throws ForbiddenError if the user is not a member of the workspace.
   */
  private async validateWorkspacePermission(workspaceId: string, userId: string) {

    // Check if the user is a member of the workspace by querying the WorkspaceMemberRepository
    const member = await this.workspaceMemberRepository.findRoleByUserId(workspaceId, userId);

    // If the user is not a member of the workspace, throw a ForbiddenError with an appropriate message and error code
    if (!member) {
      throw new ForbiddenError(
        'workspace.workspaceMemberNotFound',
        ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    // Return the workspace member record if the user has permission to create a URL in the workspace
    return member;
  }

  /**
   * Resolves the short code for the URL, either using a custom code provided by the user or generating a unique one.
   * If a custom code is provided, it checks if the code already exists in the database. If it does, a ConflictError is thrown.
   * If no custom code is provided, it generates a unique short code using the nanoid library and checks for uniqueness in the database.
   * 
   * @param customCode - Optional custom short code provided by the user.
   * @returns The resolved short code for the URL.
   * @throws ConflictError if the custom code already exists in the database.
   */
  private async resolveShortCode(customCode?: string): Promise<string> {

    // If a custom code is provided, check if it already exists in the database
    if (customCode) {
      // Check if the custom code already exists in the database by querying the UrlRepository
      const exists = await this.urlRepository.findByShortCode(customCode);

      // If the custom code already exists, throw a ConflictError with an appropriate message and error code
      if (exists) {
        throw new ConflictError('url.shortCodeAlreadyExists', ERROR_CODE.SHORT_CODE_ALREADY_EXISTS);
      }

      // If the custom code does not exist, return it as the resolved short code
      return customCode;
    }

    // If no custom code is provided, generate a unique short code using the nanoid library
    while (true) {
      // Generate a random short code with a length of 7 characters
      const code = nanoid(7);

      // Check if the generated short code already exists in the database by querying the UrlRepository
      const exists = await this.urlRepository.findByShortCode(code);

      // If the generated short code does not exist, return it as the resolved short code
      if (!exists) {
        return code;
      }
    }
  }
}
