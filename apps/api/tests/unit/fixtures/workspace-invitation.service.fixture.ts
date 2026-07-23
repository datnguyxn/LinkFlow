import { vi } from 'vitest';
import { WorkspaceInvitationService } from '../../../src/modules/workspace/service/workspace-invitation.service';

export function createWorkspaceInvitationServiceFixture() {
  const workspaceInvitationRepository = {
    findById: vi.fn(),
    findByToken: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    findNextPendingExpiration: vi.fn(),
    findExpiredPendingInvitations: vi.fn(),
    findPendingByEmail: vi.fn(),
    findAllByWorkspaceId: vi.fn(),
  };

  const workspaceRepository = {
    findById: vi.fn(),
  };

  const workspaceMemberRepository = {
    findRoleByUserId: vi.fn(),
    findByWorkspaceAndUser: vi.fn(),
    create: vi.fn(),
  };

  const roleRepository = {
    findById: vi.fn(),
  };

  const userRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
  };

  const workspaceInvitationPublisher = {
    workspaceInvitationCreated: vi.fn(),
    workspaceInvitationAccepted: vi.fn(),
    workspaceInvitationRejected: vi.fn(),
    workspaceInvitationRevoked: vi.fn(),
    workspaceInvitationExpired: vi.fn(),
  };

  const transactionService = {
    run: vi.fn(),
  };

  const workspaceInvitationService = new WorkspaceInvitationService(
    workspaceRepository as any,
    workspaceInvitationRepository as any,
    workspaceMemberRepository as any,
    roleRepository as any,
    userRepository as any,
    workspaceInvitationPublisher as any,
    transactionService as any,
  );

  return {
    workspaceInvitationService,
    workspaceInvitationRepository,
    workspaceRepository,
    workspaceMemberRepository,
    roleRepository,
    userRepository,
    workspaceInvitationPublisher,
    transactionService,
  };
}
