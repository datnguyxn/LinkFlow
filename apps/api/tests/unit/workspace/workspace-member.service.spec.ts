import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceMemberStatus } from '@prisma/client';
import { createWorkspaceMemberServiceFixture } from '../fixtures/workspace-member.service.fixture';
import { ERROR_CODE } from '../../../src/common/constants/index';

describe('WorkspaceMemberService', () => {
  let fixture: ReturnType<typeof createWorkspaceMemberServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();
    fixture = createWorkspaceMemberServiceFixture();
  });

  describe('transferOwnership', () => {
    const workspaceId = 'workspace-1';
    const currentOwnerId = 'owner-1';
    const newOwnerId = 'user-2';
    const ipAddress = '127.0.0.1';

    const workspace = {
      id: workspaceId,
      name: 'LinkFlow Workspace',
      ownerId: currentOwnerId,
    };

    const targetMember = {
      id: 'member-2',
      workspaceId,
      userId: newOwnerId,
      status: WorkspaceMemberStatus.ACTIVE,
    };

    const ownerRole = {
      id: 'role-owner',
      name: 'OWNER',
    };

    const memberRole = {
      id: 'role-member',
      name: 'MEMBER',
    };

    const currentOwner = {
      id: currentOwnerId,
      fullName: 'John Doe',
      email: 'john@example.com',
    };

    const newOwner = {
      id: newOwnerId,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
    };

    const updatedPreviousOwnerMember = {
      id: 'member-owner',
      userId: currentOwnerId,
      roleId: memberRole.id,
      status: WorkspaceMemberStatus.ACTIVE,
    };

    const updatedNewOwnerMember = {
      id: targetMember.id,
      userId: newOwnerId,
      roleId: ownerRole.id,
      status: WorkspaceMemberStatus.ACTIVE,
    };

    const updatedWorkspace = {
      ...workspace,
      ownerId: newOwnerId,
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should transfer ownership successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(memberRole);

      fixture.userRepository.findById
        .mockResolvedValueOnce(currentOwner)
        .mockResolvedValueOnce(newOwner);

      fixture.workspaceMemberRepository.updateRole
        .mockResolvedValueOnce(updatedPreviousOwnerMember)
        .mockResolvedValueOnce(updatedNewOwnerMember);

      fixture.workspaceRepository.updateOwner.mockResolvedValue(updatedWorkspace);

      fixture.transactionService.run.mockImplementation(async (callback) => callback({}));

      const result = await fixture.workspaceMemberService.transferOwnership(
        workspaceId,
        currentOwnerId,
        newOwnerId,
        ipAddress,
      );

      expect(result).toEqual({
        previousOwnerMember: updatedPreviousOwnerMember,
        newOwnerMember: updatedNewOwnerMember,
        updatedWorkspace,
      });

      expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(workspaceId);

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).toHaveBeenCalledWith(
        workspaceId,
        newOwnerId,
      );

      expect(fixture.roleRepository.findByName).toHaveBeenNthCalledWith(1, 'OWNER');

      expect(fixture.roleRepository.findByName).toHaveBeenNthCalledWith(2, 'MEMBER');

      expect(fixture.workspaceMemberRepository.updateRole).toHaveBeenNthCalledWith(
        1,
        workspaceId,
        currentOwnerId,
        memberRole.id,
        expect.anything(),
      );

      expect(fixture.workspaceMemberRepository.updateRole).toHaveBeenNthCalledWith(
        2,
        workspaceId,
        newOwnerId,
        ownerRole.id,
        expect.anything(),
      );

      expect(fixture.workspaceRepository.updateOwner).toHaveBeenCalledWith(
        workspaceId,
        newOwnerId,
        expect.anything(),
      );

      expect(fixture.workspaceMemberPublisher.workspaceOwnershipTransferred).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          workspaceName: workspace.name,
          previousOwner: {
            userId: currentOwner.id,
            name: currentOwner.fullName,
            email: currentOwner.email,
            newRole: 'MEMBER',
          },
          newOwner: {
            userId: newOwner.id,
            name: newOwner.fullName,
            email: newOwner.email,
            newRole: 'OWNER',
          },
          ipAddress,
        }),
      );
    });

    it('should throw NotFoundError when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
      });

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when current user is not the workspace owner', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue({
        ...workspace,
        ownerId: 'another-owner',
      });

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_OWNER_REQUIRED,
      });

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when transferring ownership to the current owner', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          currentOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.CANNOT_TRANSFER_OWNERSHIP_TO_SELF,
      });

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when new owner is not a workspace member', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      });
    });

    it('should throw ConflictError when new owner is not active', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({
        ...targetMember,
        status: WorkspaceMemberStatus.LEFT,
      });

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_ACTIVE,
      });

      expect(fixture.roleRepository.findByName).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when OWNER role does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(memberRole);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.ROLE_NOT_FOUND,
      });
    });

    it('should throw NotFoundError when MEMBER role does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(null);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.ROLE_NOT_FOUND,
      });
    });

    it('should throw NotFoundError when current owner does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(memberRole);

      fixture.userRepository.findById.mockResolvedValueOnce(null).mockResolvedValueOnce(newOwner);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.USER_UNAVAILABLE,
      });
    });

    it('should throw NotFoundError when new owner does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(memberRole);

      fixture.userRepository.findById
        .mockResolvedValueOnce(currentOwner)
        .mockResolvedValueOnce(null);

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        code: ERROR_CODE.USER_UNAVAILABLE,
      });
    });

    it('should propagate transaction errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(memberRole);

      fixture.userRepository.findById
        .mockResolvedValueOnce(currentOwner)
        .mockResolvedValueOnce(newOwner);

      fixture.transactionService.run.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toThrow('Database error');

      expect(fixture.workspaceMemberPublisher.workspaceOwnershipTransferred).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(targetMember);

      fixture.roleRepository.findByName
        .mockResolvedValueOnce(ownerRole)
        .mockResolvedValueOnce(memberRole);

      fixture.userRepository.findById
        .mockResolvedValueOnce(currentOwner)
        .mockResolvedValueOnce(newOwner);

      fixture.workspaceMemberRepository.updateRole
        .mockResolvedValueOnce(updatedPreviousOwnerMember)
        .mockResolvedValueOnce(updatedNewOwnerMember);

      fixture.workspaceRepository.updateOwner.mockResolvedValue(updatedWorkspace);

      fixture.transactionService.run.mockImplementation(async (callback) => callback({}));

      fixture.workspaceMemberPublisher.workspaceOwnershipTransferred.mockRejectedValue(
        new Error('RabbitMQ error'),
      );

      await expect(
        fixture.workspaceMemberService.transferOwnership(
          workspaceId,
          currentOwnerId,
          newOwnerId,
          ipAddress,
        ),
      ).rejects.toThrow('RabbitMQ error');
    });
  });

  describe('listWorkspaceMembers', () => {
    const workspaceId = 'workspace-1';

    const workspace = {
      id: workspaceId,
      name: 'LinkFlow Workspace',
    };

    const workspaceMembers = [
      {
        id: 'member-1',
        workspaceId,
        userId: 'user-1',
        role: {
          name: 'OWNER',
        },
      },
      {
        id: 'member-2',
        workspaceId,
        userId: 'user-2',
        role: {
          name: 'MEMBER',
        },
      },
    ];

    it('should return all workspace members successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockResolvedValue(workspaceMembers);

      const result = await fixture.workspaceMemberService.listWorkspaceMembers(workspaceId);

      expect(result).toEqual(workspaceMembers);

      expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(workspaceId);

      expect(fixture.workspaceMemberRepository.findAllByWorkspaceId).toHaveBeenCalledWith(
        workspaceId,
      );
    });

    it('should throw NotFoundError when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.listWorkspaceMembers(workspaceId),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
        message: 'workspace.workspaceNotFound',
      });

      expect(fixture.workspaceMemberRepository.findAllByWorkspaceId).not.toHaveBeenCalled();
    });

    it('should propagate repository errors when fetching workspace', async () => {
      fixture.workspaceRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceMemberService.listWorkspaceMembers(workspaceId),
      ).rejects.toThrow('Database error');

      expect(fixture.workspaceMemberRepository.findAllByWorkspaceId).not.toHaveBeenCalled();
    });

    it('should propagate repository errors when fetching workspace members', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        fixture.workspaceMemberService.listWorkspaceMembers(workspaceId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getWorkspaceMember', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';

    const member = {
      id: 'member-1',
      workspaceId,
      userId,
      status: WorkspaceMemberStatus.ACTIVE,
      role: {
        id: 'role-1',
        name: 'MEMBER',
      },
    };

    it('should return workspace member successfully', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      const result = await fixture.workspaceMemberService.getWorkspaceMember(workspaceId, userId);

      expect(result).toEqual(member);

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );
    });

    it('should throw NotFoundError when workspace member does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.getWorkspaceMember(workspaceId, userId),
      ).rejects.toMatchObject({
        message: 'workspace.memberNotFound',
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      });
    });

    it('should propagate repository errors', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        fixture.workspaceMemberService.getWorkspaceMember(workspaceId, userId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateWorkspaceMemberRole', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';
    const oldRoleId = 'role-member';
    const newRoleId = 'role-admin';
    const ipAddress = '127.0.0.1';

    const member = {
      id: 'member-1',
      workspaceId,
      userId,
      roleId: oldRoleId,

      workspace: {
        id: workspaceId,
        name: 'LinkFlow Workspace',
      },

      user: {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      },

      role: {
        id: oldRoleId,
        name: 'MEMBER',
      },
    };

    const newRole = {
      id: newRoleId,
      name: 'ADMIN',
    };

    const updatedMember = {
      ...member,
      roleId: newRoleId,
      role: newRole,
      updatedAt: new Date('2026-07-25T10:00:00.000Z'),
    };

    it('should update workspace member role successfully', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockResolvedValue(newRole);

      fixture.workspaceMemberRepository.updateRole.mockResolvedValue(updatedMember);

      const result = await fixture.workspaceMemberService.updateWorkspaceMemberRole(
        workspaceId,
        userId,
        newRoleId,
        ipAddress,
      );

      expect(result).toEqual(updatedMember);

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );

      expect(fixture.roleRepository.findById).toHaveBeenCalledWith(newRoleId);

      expect(fixture.workspaceMemberRepository.updateRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        newRoleId,
      );

      expect(fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId,
          workspaceName: member.workspace.name,
          memberId: member.id,
          userId: member.userId,
          memberName: member.user.fullName,
          memberEmail: member.user.email,
          previousRoleId: member.roleId,
          previousRoleName: member.role.name,
          newRoleId: newRole.id,
          newRoleName: newRole.name,
          updatedAt: updatedMember.updatedAt,
          ipAddress,
        }),
      );
    });

    it('should throw when workspace member does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          newRoleId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        message: 'workspace.memberNotFound',
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      });

      expect(fixture.roleRepository.findById).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberRepository.updateRole).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated).not.toHaveBeenCalled();
    });

    it('should throw when new role does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          newRoleId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        message: 'workspace.roleNotFound',
        code: ERROR_CODE.ROLE_NOT_FOUND,
      });

      expect(fixture.workspaceMemberRepository.updateRole).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated).not.toHaveBeenCalled();
    });

    it('should throw when member already has the same role', async () => {
      const sameRole = {
        id: oldRoleId,
        name: 'MEMBER',
      };

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockResolvedValue(sameRole);

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          oldRoleId,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        message: 'workspace.memberAlreadyHasRole',
        code: ERROR_CODE.MEMBER_ALREADY_HAS_ROLE,
      });

      expect(fixture.workspaceMemberRepository.updateRole).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated).not.toHaveBeenCalled();
    });

    it('should throw when trying to assign OWNER role directly', async () => {
      const ownerRole = {
        id: 'role-owner',
        name: 'OWNER',
      };

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockResolvedValue(ownerRole);

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          ownerRole.id,
          ipAddress,
        ),
      ).rejects.toMatchObject({
        message: 'workspace.ownerRoleRequiresTransfer',
        code: ERROR_CODE.OWNER_ROLE_REQUIRES_TRANSFER,
      });

      expect(fixture.workspaceMemberRepository.updateRole).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated).not.toHaveBeenCalled();
    });

    it('should propagate repository error when finding member', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          newRoleId,
          ipAddress,
        ),
      ).rejects.toThrow('Database error');
    });

    it('should propagate repository error when finding role', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          newRoleId,
          ipAddress,
        ),
      ).rejects.toThrow('Database error');

      expect(fixture.workspaceMemberRepository.updateRole).not.toHaveBeenCalled();
    });

    it('should propagate error when publishing event fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.roleRepository.findById.mockResolvedValue(newRole);

      fixture.workspaceMemberRepository.updateRole.mockResolvedValue(updatedMember);

      fixture.workspaceMemberPublisher.workspaceMemberRoleUpdated.mockRejectedValue(
        new Error('Publisher error'),
      );

      await expect(
        fixture.workspaceMemberService.updateWorkspaceMemberRole(
          workspaceId,
          userId,
          newRoleId,
          ipAddress,
        ),
      ).rejects.toThrow('Publisher error');

      expect(fixture.workspaceMemberRepository.updateRole).toHaveBeenCalledWith(
        workspaceId,
        userId,
        newRoleId,
      );
    });
  });

  describe('leaveWorkspace', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';
    const ipAddress = '127.0.0.1';

    const member = {
      id: 'member-1',
      workspaceId,
      userId,

      workspace: {
        id: workspaceId,
        name: 'LinkFlow Workspace',
        ownerId: 'owner-1',
      },

      user: {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      },

      role: {
        id: 'role-member',
        name: 'MEMBER',
      },
    };

    const owner = {
      id: 'owner-1',
      fullName: 'Workspace Owner',
      email: 'owner@example.com',
    };

    const deletedAt = new Date('2026-07-25T10:00:00.000Z');

    const deletedMember = {
      ...member,
      status: WorkspaceMemberStatus.LEFT,
      deletedAt,
    };

    it('should leave workspace successfully', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockResolvedValue(deletedMember);

      const result = await fixture.workspaceMemberService.leaveWorkspace(
        workspaceId,
        userId,
        ipAddress,
      );

      expect(result).toEqual(deletedMember);

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );

      expect(fixture.userRepository.findById).toHaveBeenCalledWith(member.workspace.ownerId);

      expect(fixture.workspaceMemberRepository.update).toHaveBeenCalledWith(
        workspaceId,
        userId,
        expect.objectContaining({
          status: WorkspaceMemberStatus.LEFT,
          deletedAt: expect.any(Date),
        }),
      );

      expect(fixture.workspaceMemberPublisher.workspaceMemberLeave).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: member.workspaceId,
          workspaceName: member.workspace.name,
          userId: member.userId,
          memberId: member.id,
          ownerId: owner.id,
          ownerName: owner.fullName,
          ownerEmail: owner.email,
          email: member.user.email,
          fullName: member.user.fullName,
          role: member.role.name,
          deleteAt: deletedMember.deletedAt,
          ipAddress,
        }),
      );
    });

    it('should throw when workspace member does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'workspace.memberNotFound',
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      });

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberLeave).not.toHaveBeenCalled();
    });

    it('should throw when owner tries to leave the workspace', async () => {
      const ownerMember = {
        ...member,
        role: {
          ...member.role,
          name: 'OWNER',
        },
      };

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(ownerMember);

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'workspace.transferOwnershipBeforeLeaving',
        code: ERROR_CODE.TRANSFER_OWNERSHIP_BEFORE_LEAVING,
      });

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberLeave).not.toHaveBeenCalled();
    });

    it('should throw when workspace owner does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'user.userUnavailable',
        code: ERROR_CODE.USER_UNAVAILABLE,
      });

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberLeave).not.toHaveBeenCalled();
    });

    it('should propagate error when finding member fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Database error');
    });

    it('should propagate error when updating member fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Update failed');

      expect(fixture.workspaceMemberPublisher.workspaceMemberLeave).not.toHaveBeenCalled();
    });

    it('should propagate error when publishing leave event fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockResolvedValue(deletedMember);

      fixture.workspaceMemberPublisher.workspaceMemberLeave.mockRejectedValue(
        new Error('Publisher error'),
      );

      await expect(
        fixture.workspaceMemberService.leaveWorkspace(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Publisher error');

      expect(fixture.workspaceMemberRepository.update).toHaveBeenCalled();
    });
  });

  describe('removeWorkspaceMember', () => {
    const workspaceId = 'workspace-1';
    const userId = 'user-1';
    const ipAddress = '127.0.0.1';

    const member = {
      id: 'member-1',
      workspaceId,
      userId,

      workspace: {
        id: workspaceId,
        name: 'LinkFlow Workspace',
        ownerId: 'owner-1',
      },

      user: {
        id: userId,
        fullName: 'John Doe',
        email: 'john@example.com',
      },

      role: {
        id: 'role-member',
        name: 'MEMBER',
      },
    };

    const owner = {
      id: 'owner-1',
      fullName: 'Workspace Owner',
      email: 'owner@example.com',
    };

    const deletedAt = new Date('2026-07-25T10:00:00.000Z');

    const deletedMember = {
      ...member,
      status: WorkspaceMemberStatus.REMOVED,
      deletedAt,
    };

    it('should remove workspace member successfully', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockResolvedValue(deletedMember);

      const result = await fixture.workspaceMemberService.removeWorkspaceMember(
        workspaceId,
        userId,
        ipAddress,
      );

      expect(result).toEqual(deletedMember);

      expect(fixture.workspaceMemberRepository.findByWorkspaceAndUser).toHaveBeenCalledWith(
        workspaceId,
        userId,
      );

      expect(fixture.userRepository.findById).toHaveBeenCalledWith(member.workspace.ownerId);

      expect(fixture.workspaceMemberRepository.update).toHaveBeenCalledWith(
        workspaceId,
        userId,
        expect.objectContaining({
          status: WorkspaceMemberStatus.REMOVED,
          deletedAt: expect.any(Date),
        }),
      );

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: member.workspaceId,
          workspaceName: member.workspace.name,
          userId: member.userId,
          memberId: member.id,
          ownerName: owner.fullName,
          email: member.user.email,
          fullName: member.user.fullName,
          role: member.role.name,
          deleteAt: deletedMember.deletedAt,
          ipAddress,
        }),
      );
    });

    it('should throw when workspace member does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'workspace.memberNotFound',
        code: ERROR_CODE.WORKSPACE_MEMBER_NOT_FOUND,
      });

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).not.toHaveBeenCalled();
    });

    it('should throw when trying to remove the workspace owner', async () => {
      const ownerMember = {
        ...member,
        role: {
          ...member.role,
          name: 'OWNER',
        },
      };

      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(ownerMember);

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'workspace.transferOwnershipBeforeRemoving',
        code: ERROR_CODE.TRANSFER_OWNERSHIP_BEFORE_REMOVING,
      });

      expect(fixture.userRepository.findById).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).not.toHaveBeenCalled();
    });

    it('should throw when workspace owner does not exist', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toMatchObject({
        message: 'user.userUnavailable',
        code: ERROR_CODE.USER_UNAVAILABLE,
      });

      expect(fixture.workspaceMemberRepository.update).not.toHaveBeenCalled();

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).not.toHaveBeenCalled();
    });

    it('should propagate error when finding member fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Database error');
    });

    it('should propagate error when updating member fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockRejectedValue(new Error('Update failed'));

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Update failed');

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).not.toHaveBeenCalled();
    });

    it('should propagate error when publishing removal event fails', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockResolvedValue(deletedMember);

      fixture.workspaceMemberPublisher.workspaceMemberRemove.mockRejectedValue(
        new Error('Publisher error'),
      );

      await expect(
        fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, ipAddress),
      ).rejects.toThrow('Publisher error');

      expect(fixture.workspaceMemberRepository.update).toHaveBeenCalled();
    });

    it('should set ipAddress to undefined when ipAddress is null', async () => {
      fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(member);

      fixture.userRepository.findById.mockResolvedValue(owner);

      fixture.workspaceMemberRepository.update.mockResolvedValue(deletedMember);

      await fixture.workspaceMemberService.removeWorkspaceMember(workspaceId, userId, null);

      expect(fixture.workspaceMemberPublisher.workspaceMemberRemove).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: undefined,
        }),
      );
    });
  });
});
