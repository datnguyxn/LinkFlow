import { vi } from 'vitest';
import { WorkspaceMemberService } from '../../../src/modules/workspace/service/workspace-member.service';

export function createWorkspaceMemberServiceFixture() {
  const workspaceRepository = {
    findById: vi.fn(),
    updateOwner: vi.fn(),
  };

  const workspaceMemberRepository = {
    findRoleByUserId: vi.fn(),
    findByWorkspaceAndUser: vi.fn(),
    create: vi.fn(),
    reactivate: vi.fn(),
    updateRole: vi.fn(),
    findAllByWorkspaceId: vi.fn(),
    update: vi.fn(),
    findAllByWorkspaceIdWithPagination: vi.fn(),
  };

  const roleRepository = {
    findById: vi.fn(),
    findByName: vi.fn(),
  };

  const userRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
  };

  const workspaceMemberPublisher = {
    workspaceMemberAdded: vi.fn(),
    workspaceMemberRemoved: vi.fn(),
    workspaceMemberRoleUpdated: vi.fn(),
    workspaceOwnershipTransferred: vi.fn(),
    workspaceMemberLeave: vi.fn(),
    workspaceMemberRemove: vi.fn(),
  };

  const transactionService = {
    run: vi.fn(),
    transferOwnership: vi.fn(),
  };

  const storageService = {
    deleteFile: vi.fn(),
    getPresignedUrl: vi.fn(),
  };

  const workspaceMemberService = new WorkspaceMemberService(
    workspaceRepository as any,
    workspaceMemberRepository as any,
    roleRepository as any,
    userRepository as any,
    transactionService as any,
    workspaceMemberPublisher as any,
    storageService as any,
  );

  return {
    workspaceRepository,
    workspaceMemberService,
    workspaceMemberRepository,
    roleRepository,
    userRepository,
    workspaceMemberPublisher,
    transactionService,
    storageService,
  };
}
