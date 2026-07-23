import type { FastifyRequest } from 'fastify';
import { WorkspaceRepository } from '../../modules/workspace/repository/workspace.repository.ts';
import type { WorkspacePermission } from '../enums/workspace-permission.enum.ts';
import { ForbiddenError } from '../errors/forbidden.error.ts';
import { ERROR_CODE } from '../constants/index.ts';

const workspaceRepository = new WorkspaceRepository();

export function requireWorkspacePermission(
  permission: WorkspacePermission,
) {
  return async function (
    request: FastifyRequest,
  ) {
    const { workspaceId } = request.params as {
      workspaceId: string;
    };

    const userId = request.user.id;

    const hasPermission =
      await workspaceRepository.hasPermission(
        workspaceId,
        userId,
        permission,
      );

    if (!hasPermission) {
      throw new ForbiddenError(
        'workspace.permissionDenied',
        ERROR_CODE.FORBIDDEN,
      );
    }
  };
}