import { vi } from 'vitest';
import { WorkspaceService } from '../../../src/modules/workspace/service/workspace.service';

export function createWorkspaceServiceFixture() {
  const workspaceRepository = {
    findBySlug: vi.fn(),
    create: vi.fn(),
    findAllByUserId: vi.fn(),
    findWorkspaceAndMemberById: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  };

  const workspaceMemberRepository = {
    findRoleByUserId: vi.fn(),
  };

  const publisher = {
    workspaceCreated: vi.fn(),
    workspaceUpdated: vi.fn(),
    workspaceDeleted: vi.fn(),
  };

  const workspaceService = new WorkspaceService(
    workspaceRepository as any,
    workspaceMemberRepository as any,
    publisher as any,
  );

  return {
    workspaceService,
    workspaceRepository,
    workspaceMemberRepository,
    publisher,
  };
}