import { RedirectType } from '@prisma/client';
import { UserRepository } from '../../users/index.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';
import { UrlRepository } from '../repositoy/url.repository.ts';
import { ConflictError, ForbiddenError } from '../../../common/errors/index.ts';
import { ERROR_CODE } from '../../../common/constants/index.ts';
import type { CreateUrlInput } from '../validator/url.validator.ts';
import { nanoid } from 'nanoid';
import { hashPassword } from '../../../utils/password.util.ts';
import { WorkspaceMemberRepository } from '../../workspace/repository/workspace-member.repository.ts';

/**
 * UrlService class provides methods to interact with the URL data in the database.
 * It includes methods for finding, creating, updating, and deleting URLs, as well as
 * handling pagination and other URL-related operations.
 */
export class UrlService {
  // The UrlRepository instance is injected into the UrlService class, allowing it to access the repository methods for URL-related database operations.
  constructor(
    private urlRepository = new UrlRepository(),
    private workspaceRepository = new WorkspaceRepository(),
    private workspaceMemberRepository = new WorkspaceMemberRepository(),
    private userRepository = new UserRepository(),
  ) {}

  async createUrl(userId: string, workspaceId: string, input: CreateUrlInput) {
    await this.validateWorkspacePermission(workspaceId, userId);

    const shortCode = await this.resolveShortCode(input.customCode);

    const passwordHash = input.password ? await hashPassword(input.password) : null;

    // Create the URL record in the database
    const result = await this.urlRepository.createUrl({
      shortCode,
      originalUrl: input.originalUrl,
      title: input.title,
      description: input.description,
      faviconUrl: input.faviconUrl,
      redirectType: input.redirectType as RedirectType,
      passwordHash: passwordHash,
      expiresAt: input.expiresAt,
      maxClicks: input.maxClicks,
      clickCount: input.clickCount,
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    });

    return result;
  }

  private async validateWorkspacePermission(workspaceId: string, userId: string) {
    const member = await this.workspaceMemberRepository.findRoleByUserId(workspaceId, userId);

    if (!member) {
      throw new ForbiddenError(
        'workspace.workspaceMemberNotFound',
        ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      );
    }

    return member;
  }

  private async resolveShortCode(customCode?: string): Promise<string> {
    if (customCode) {
      const exists = await this.urlRepository.findByShortCode(customCode);

      if (exists) {
        throw new ConflictError('url.shortCodeAlreadyExists', ERROR_CODE.SHORT_CODE_ALREADY_EXISTS);
      }

      return customCode;
    }

    while (true) {
      const code = nanoid(7);

      const exists = await this.urlRepository.findByShortCode(code);

      if (!exists) {
        return code;
      }
    }
  }
}
