import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceStatus } from '@prisma/client';

import { ForbiddenError, ConflictError } from '../../../src/common/errors/index.ts';
import { ERROR_CODE } from '../../../src/common/constants/index';

import { createWorkspaceServiceFixture } from '../fixtures/workspace.service.fixture';

vi.mock('../../../src/modules/users/validator/image.validator', () => ({
  validateImage: vi.fn(),
}));

import { validateImage } from '../../../src/modules/users/validator/image.validator.ts';

describe('WorkspaceService', () => {
  let fixture: ReturnType<typeof createWorkspaceServiceFixture>;

  beforeEach(() => {
    vi.clearAllMocks();

    fixture = createWorkspaceServiceFixture();
  });

  describe('createWorkspace', () => {
    const workspaceData = {
      name: 'My Workspace',
      slug: 'my-workspace',
      logoUrl: 'https://example.com/logo.png',
    };

    const createdWorkspace = {
      id: 'workspace-1',
      name: 'My Workspace',
      slug: 'my-workspace',
      ownerId: 'user-1',
      logoUrl: 'https://example.com/logo.png',
      createdAt: new Date(),
    };

    it('should create workspace successfully', async () => {
      fixture.workspaceRepository.findBySlug.mockResolvedValue(null);

      fixture.workspaceRepository.create.mockResolvedValue(createdWorkspace);

      fixture.publisher.workspaceCreated.mockResolvedValue(undefined);

      const result = await fixture.workspaceService.createWorkspace(
        workspaceData,
        'user-1',
        '127.0.0.1',
      );

      expect(result).toEqual(createdWorkspace);

      expect(fixture.workspaceRepository.findBySlug).toHaveBeenCalledWith('my-workspace');

      expect(fixture.workspaceRepository.create).toHaveBeenCalledWith({
        name: 'My Workspace',
        ownerId: 'user-1',
        logoUrl: 'https://example.com/logo.png',
      });

      expect(fixture.publisher.workspaceCreated).toHaveBeenCalledWith({
        workspaceId: createdWorkspace.id,
        ownerId: createdWorkspace.ownerId,
        name: createdWorkspace.name,
        slug: createdWorkspace.slug,
        createdAt: createdWorkspace.createdAt,
        ipAddress: '127.0.0.1',
      });
    });

    it('should create workspace without checking slug when slug is not provided', async () => {
      const data = {
        name: 'My Workspace',
      };

      fixture.workspaceRepository.create.mockResolvedValue(createdWorkspace);

      const result = await fixture.workspaceService.createWorkspace(data, 'user-1');

      expect(result).toEqual(createdWorkspace);

      expect(fixture.workspaceRepository.findBySlug).not.toHaveBeenCalled();
    });

    it('should throw when workspace slug already exists', async () => {
      fixture.workspaceRepository.findBySlug.mockResolvedValue({
        id: 'existing-workspace',
        slug: 'my-workspace',
      });

      await expect(
        fixture.workspaceService.createWorkspace(workspaceData, 'user-1'),
      ).rejects.toMatchObject({
        message: 'workspace.slugAlreadyExists',
      });

      expect(fixture.workspaceRepository.create).not.toHaveBeenCalled();

      expect(fixture.publisher.workspaceCreated).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      fixture.workspaceRepository.findBySlug.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceService.createWorkspace(workspaceData, 'user-1'),
      ).rejects.toThrow('Database error');
    });

    it('should propagate create errors', async () => {
      fixture.workspaceRepository.findBySlug.mockResolvedValue(null);

      fixture.workspaceRepository.create.mockRejectedValue(new Error('Create error'));

      await expect(
        fixture.workspaceService.createWorkspace(workspaceData, 'user-1'),
      ).rejects.toThrow('Create error');

      expect(fixture.publisher.workspaceCreated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findBySlug.mockResolvedValue(null);

      fixture.workspaceRepository.create.mockResolvedValue(createdWorkspace);

      fixture.publisher.workspaceCreated.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(
        fixture.workspaceService.createWorkspace(workspaceData, 'user-1'),
      ).rejects.toThrow('RabbitMQ error');
    });
  });

  describe('getAllWorkspaces', () => {
    const ownerId = 'user-1';

    beforeEach(() => {
      fixture.storageService.getPresignedUrl.mockResolvedValue(
        'https://cdn.example.com/workspace-logo.png',
      );
    });

    it('should return all workspaces and generate presigned url for logo', async () => {
      const workspaces = [
        {
          id: 'workspace-1',
          name: 'Workspace 1',
          ownerId,
          logoUrl: 'logos/workspace-1.png',
        },
        {
          id: 'workspace-2',
          name: 'Workspace 2',
          ownerId,
          logoUrl: null,
        },
      ];

      fixture.workspaceRepository.findAllByUserId.mockResolvedValue(structuredClone(workspaces));

      const result = await fixture.workspaceService.getAllWorkspaces(ownerId);

      expect(result[0].logoUrl).toBe('https://cdn.example.com/workspace-logo.png');

      expect(result[1].logoUrl).toBeNull();

      expect(fixture.workspaceRepository.findAllByUserId).toHaveBeenCalledWith(ownerId);

      expect(fixture.storageService.getPresignedUrl).toHaveBeenCalledWith(
        'logos/workspace-1.png',
        60 * 60,
      );
    });

    it('should not generate presigned url when logoUrl is already an http url', async () => {
      const workspaces = [
        {
          id: 'workspace-1',
          name: 'Workspace 1',
          ownerId,
          logoUrl: 'https://example.com/logo.png',
        },
      ];

      fixture.workspaceRepository.findAllByUserId.mockResolvedValue(structuredClone(workspaces));

      const result = await fixture.workspaceService.getAllWorkspaces(ownerId);

      expect(result[0].logoUrl).toBe('https://example.com/logo.png');

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no workspaces', async () => {
      fixture.workspaceRepository.findAllByUserId.mockResolvedValue([]);

      const result = await fixture.workspaceService.getAllWorkspaces(ownerId);

      expect(result).toEqual([]);

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      fixture.workspaceRepository.findAllByUserId.mockRejectedValue(new Error('Database error'));

      await expect(fixture.workspaceService.getAllWorkspaces(ownerId)).rejects.toThrow(
        'Database error',
      );

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should propagate storage service errors', async () => {
      const workspaces = [
        {
          id: 'workspace-1',
          name: 'Workspace 1',
          ownerId,
          logoUrl: 'logos/workspace-1.png',
        },
      ];

      fixture.workspaceRepository.findAllByUserId.mockResolvedValue(structuredClone(workspaces));

      fixture.storageService.getPresignedUrl.mockRejectedValue(new Error('Storage error'));

      await expect(fixture.workspaceService.getAllWorkspaces(ownerId)).rejects.toThrow(
        'Storage error',
      );
    });
  });

  describe('getWorkspaceById', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'user-1';

    const workspace = {
      id: workspaceId,
      name: 'My Workspace',
      ownerId,
      logoUrl: 'logos/workspace.png',
    };

    beforeEach(() => {
      vi.clearAllMocks();

      fixture.storageService.getPresignedUrl.mockResolvedValue(
        'https://cdn.example.com/workspace.png',
      );
    });

    it('should return workspace successfully with presigned logo url', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
      });

      const requireMemberSpy = vi
        .spyOn(fixture.workspaceService as any, 'requireMember')
        .mockResolvedValue(undefined);

      const result = await fixture.workspaceService.getWorkspaceById(workspaceId, ownerId);

      expect(result.logoUrl).toBe('https://cdn.example.com/workspace.png');

      expect(fixture.workspaceRepository.findByWorkspaceIdAndUserId).toHaveBeenCalledWith(
        workspaceId,
        ownerId,
      );

      expect(requireMemberSpy).toHaveBeenCalledWith(workspaceId, ownerId);

      expect(fixture.storageService.getPresignedUrl).toHaveBeenCalledWith(
        'logos/workspace.png',
        60 * 60,
      );
    });

    it('should not generate presigned url when logoUrl is already an http url', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
        logoUrl: 'https://example.com/logo.png',
      });

      vi.spyOn(fixture.workspaceService as any, 'requireMember').mockResolvedValue(undefined);

      const result = await fixture.workspaceService.getWorkspaceById(workspaceId, ownerId);

      expect(result.logoUrl).toBe('https://example.com/logo.png');

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should not generate presigned url when logoUrl is null', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
        logoUrl: null,
      });

      vi.spyOn(fixture.workspaceService as any, 'requireMember').mockResolvedValue(undefined);

      const result = await fixture.workspaceService.getWorkspaceById(workspaceId, ownerId);

      expect(result.logoUrl).toBeNull();

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when workspace does not exist', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue(null);

      const requireMemberSpy = vi.spyOn(fixture.workspaceService as any, 'requireMember');

      await expect(
        fixture.workspaceService.getWorkspaceById(workspaceId, ownerId),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
        message: 'workspace.notFound',
      });

      expect(fixture.workspaceRepository.findByWorkspaceIdAndUserId).toHaveBeenCalledWith(
        workspaceId,
        ownerId,
      );

      expect(requireMemberSpy).not.toHaveBeenCalled();

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should throw when user is not a member of the workspace', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
      });

      const requireMemberSpy = vi
        .spyOn(fixture.workspaceService as any, 'requireMember')
        .mockRejectedValue(new ForbiddenError('workspace.accessDenied', ERROR_CODE.FORBIDDEN));

      await expect(
        fixture.workspaceService.getWorkspaceById(workspaceId, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.accessDenied',
      });

      expect(requireMemberSpy).toHaveBeenCalledWith(workspaceId, ownerId);

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(fixture.workspaceService.getWorkspaceById(workspaceId, ownerId)).rejects.toThrow(
        'Database error',
      );
    });

    it('should propagate requireMember errors', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
      });

      vi.spyOn(fixture.workspaceService as any, 'requireMember').mockRejectedValue(
        new Error('Membership validation error'),
      );

      await expect(fixture.workspaceService.getWorkspaceById(workspaceId, ownerId)).rejects.toThrow(
        'Membership validation error',
      );

      expect(fixture.storageService.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('should propagate storage service errors', async () => {
      fixture.workspaceRepository.findByWorkspaceIdAndUserId.mockResolvedValue({
        ...workspace,
      });

      vi.spyOn(fixture.workspaceService as any, 'requireMember').mockResolvedValue(undefined);

      fixture.storageService.getPresignedUrl.mockRejectedValue(new Error('Storage error'));

      await expect(fixture.workspaceService.getWorkspaceById(workspaceId, ownerId)).rejects.toThrow(
        'Storage error',
      );
    });
  });

  describe('updateWorkspace', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'user-1';
    const ipAddress = '127.0.0.1';

    const workspaceData = {
      name: 'Updated Workspace',
      logoUrl: 'new-logo.png',
    };

    const workspace = {
      id: workspaceId,
      name: 'Old Workspace',
    };

    const updatedWorkspace = {
      id: workspaceId,
      name: 'Updated Workspace',
      logoUrl: 'new-logo.png',
      updatedAt: new Date(),
    };

    it('should update workspace successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue('OWNER');

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);

      const result = await fixture.workspaceService.updateWorkspace(
        workspaceId,
        workspaceData,
        ownerId,
        ipAddress,
      );

      expect(result).toEqual(updatedWorkspace);

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(workspaceId, {
        name: 'Updated Workspace',
        logoUrl: 'new-logo.png',
      });

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalledWith({
        id: workspaceId,
        updatedBy: ownerId,
        changedFields: Object.keys(workspaceData),
        updatedAt: updatedWorkspace.updatedAt,
        ipAddress,
      });
    });

    it('should throw when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.updateWorkspace(workspaceId, workspaceData, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.notFound',
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when user is not a member', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.updateWorkspace(workspaceId, workspaceData, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.accessDenied',
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate update errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue('OWNER');

      fixture.workspaceRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceService.updateWorkspace(workspaceId, workspaceData, ownerId),
      ).rejects.toThrow('Database error');

      expect(fixture.publisher.workspaceUpdated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue('OWNER');

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.publisher.workspaceUpdated.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(
        fixture.workspaceService.updateWorkspace(workspaceId, workspaceData, ownerId),
      ).rejects.toThrow('RabbitMQ error');
    });
  });

  describe('deleteWorkspace', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'owner-1';
    const ipAddress = '127.0.0.1';

    const workspace = {
      id: workspaceId,
      name: 'LinkFlow Workspace',
      ownerId,
      status: WorkspaceStatus.ACTIVE,
    };

    const updatedWorkspace = {
      ...workspace,
      status: WorkspaceStatus.SUSPENDED,
    };

    const members = [
      {
        userId: ownerId,
        user: {
          fullName: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        userId: 'user-2',
        user: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();

      vi.spyOn(fixture.workspaceService as any, 'requireOwner').mockResolvedValue(undefined);
    });

    it('should delete workspace successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockResolvedValue(members);

      const result = await fixture.workspaceService.deleteWorkspace(
        workspaceId,
        ownerId,
        ipAddress,
      );

      expect(result).toEqual(updatedWorkspace);

      expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(workspaceId);

      expect(fixture.workspaceService.requireOwner).toHaveBeenCalledWith(workspaceId, ownerId);

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(workspaceId, {
        status: WorkspaceStatus.SUSPENDED,
      });

      expect(fixture.workspaceMemberRepository.findAllByWorkspaceId).toHaveBeenCalledWith(
        workspaceId,
      );

      expect(fixture.publisher.workspaceDeleted).toHaveBeenCalledWith(
        expect.objectContaining({
          id: workspaceId,
          workspaceName: 'LinkFlow Workspace',
          ownerId,
          deletedBy: 'John Doe',
          deletedAt: expect.any(Date),
          ipAddress,
          members: [
            {
              id: ownerId,
              name: 'John Doe',
              email: 'john@example.com',
            },
            {
              id: 'user-2',
              name: 'Jane Doe',
              email: 'jane@example.com',
            },
          ],
        }),
      );
    });

    it('should throw ConflictError when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.deleteWorkspace(workspaceId, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.notFound',
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
      });

      expect(fixture.workspaceService.requireOwner).not.toHaveBeenCalled();

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();

      expect(fixture.publisher.workspaceDeleted).not.toHaveBeenCalled();
    });

    it('should propagate requireOwner errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      vi.spyOn(fixture.workspaceService as any, 'requireOwner').mockRejectedValue(
        new ConflictError('workspace.ownerOnly', ERROR_CODE.WORKSPACE_OWNER_REQUIRED),
      );

      await expect(
        fixture.workspaceService.deleteWorkspace(workspaceId, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.ownerOnly',
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(fixture.workspaceService.deleteWorkspace(workspaceId, ownerId)).rejects.toThrow(
        'Database error',
      );

      expect(fixture.publisher.workspaceDeleted).not.toHaveBeenCalled();
    });

    it('should propagate member repository errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(fixture.workspaceService.deleteWorkspace(workspaceId, ownerId)).rejects.toThrow(
        'Database error',
      );

      expect(fixture.publisher.workspaceDeleted).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockResolvedValue(members);

      fixture.publisher.workspaceDeleted.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(fixture.workspaceService.deleteWorkspace(workspaceId, ownerId)).rejects.toThrow(
        'RabbitMQ error',
      );
    });

    it('should publish null ipAddress when ipAddress is not provided', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.workspaceMemberRepository.findAllByWorkspaceId.mockResolvedValue(members);

      await fixture.workspaceService.deleteWorkspace(workspaceId, ownerId);

      expect(fixture.publisher.workspaceDeleted).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
        }),
      );
    });
  });

  describe('restoreWorkspace', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'owner-1';
    const ipAddress = '127.0.0.1';

    const archivedWorkspace = {
      id: workspaceId,
      ownerId,
      status: WorkspaceStatus.ARCHIVED,
    };

    const restoredWorkspace = {
      ...archivedWorkspace,
      status: WorkspaceStatus.ACTIVE,
      updatedAt: new Date(),
    };

    it('should restore workspace successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(archivedWorkspace);

      fixture.workspaceRepository.update.mockResolvedValue(restoredWorkspace);

      fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);

      const result = await fixture.workspaceService.restoreWorkspace(
        workspaceId,
        ownerId,
        ipAddress,
      );

      expect(result).toEqual(restoredWorkspace);

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(workspaceId, {
        status: WorkspaceStatus.ACTIVE,
      });

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalledWith({
        id: workspaceId,
        updatedBy: ownerId,
        changedFields: ['status'],
        updatedAt: restoredWorkspace.updatedAt,
        ipAddress,
      });
    });

    it('should throw when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.restoreWorkspace(workspaceId, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.notFound',
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when user is not the owner', async () => {
      fixture.workspaceRepository.findById
        .mockResolvedValueOnce(archivedWorkspace)
        .mockResolvedValueOnce({
          ...archivedWorkspace,
          ownerId: 'another-user',
        });

      await expect(
        fixture.workspaceService.restoreWorkspace(workspaceId, ownerId),
      ).rejects.toMatchObject({
        message: 'workspace.ownerOnly',
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate update errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(archivedWorkspace);

      fixture.workspaceRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(fixture.workspaceService.restoreWorkspace(workspaceId, ownerId)).rejects.toThrow(
        'Database error',
      );

      expect(fixture.publisher.workspaceUpdated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(archivedWorkspace);

      fixture.workspaceRepository.update.mockResolvedValue(restoredWorkspace);

      fixture.publisher.workspaceUpdated.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(fixture.workspaceService.restoreWorkspace(workspaceId, ownerId)).rejects.toThrow(
        'RabbitMQ error',
      );
    });
  });

  describe('updateWorkspaceLogo', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'owner-1';
    const ipAddress = '127.0.0.1';

    const workspace = {
      id: workspaceId,
      ownerId,
      logoUrl: 'workspace/logo/old-logo.png',
    };

    const updatedWorkspace = {
      ...workspace,
      logoUrl: 'workspace/logo/new-logo.png',
      updatedAt: new Date(),
    };

    beforeEach(() => {
      vi.spyOn(fixture.workspaceService as any, 'requireOwner').mockResolvedValue(undefined);

      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.storageService.getPresignedUrl.mockResolvedValue('https://cdn.example.com/logo.png');

      fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);
    });

    it('should update logo from url successfully', async () => {
      fixture.workspaceRepository.update.mockResolvedValue({
        ...updatedWorkspace,
        logoUrl: 'https://example.com/logo.png',
      });

      const result = await fixture.workspaceService.updateWorkspaceLogo(
        workspaceId,
        'https://example.com/logo.png',
        null,
        ownerId,
        ipAddress,
      );

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({
          logoUrl: 'https://example.com/logo.png',
        }),
      );

      expect(fixture.storageService.deleteFile).toHaveBeenCalled();

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalled();

      expect(result.logoUrl).toBe('https://cdn.example.com/logo.png');
    });

    it('should upload file and update logo successfully', async () => {
      const file = {
        filename: 'logo.png',
        mimetype: 'image/png',
      } as any;

      vi.mocked(validateImage).mockResolvedValue(Buffer.from('image'));

      fixture.storageService.uploadFile.mockResolvedValue({
        objectKey: 'workspace/logo/new-logo.png',
      });

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      const result = await fixture.workspaceService.updateWorkspaceLogo(
        workspaceId,
        null,
        file,
        ownerId,
        ipAddress,
      );

      expect(validateImage).toHaveBeenCalledWith(file);

      expect(fixture.storageService.uploadFile).toHaveBeenCalled();

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({
          logoUrl: 'workspace/logo/new-logo.png',
        }),
      );

      expect(result.logoUrl).toBe('https://cdn.example.com/logo.png');
    });

    it('should throw when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(workspaceId, null, null, ownerId),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should throw when logoUrl and file are both missing', async () => {
      await expect(
        fixture.workspaceService.updateWorkspaceLogo(workspaceId, null, null, ownerId),
      ).rejects.toMatchObject({
        code: ERROR_CODE.INVALID_REQUEST,
      });

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should not delete old logo when logo is unchanged', async () => {
      fixture.workspaceRepository.update.mockResolvedValue({
        ...workspace,
        updatedAt: new Date(),
      });

      await fixture.workspaceService.updateWorkspaceLogo(
        workspaceId,
        workspace.logoUrl,
        null,
        ownerId,
      );

      expect(fixture.storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should propagate upload errors', async () => {
      const file = {
        filename: 'logo.png',
        mimetype: 'image/png',
      } as any;

      vi.mocked(validateImage).mockResolvedValue(Buffer.from('image'));

      fixture.storageService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(workspaceId, null, file, ownerId),
      ).rejects.toThrow('Upload failed');
    });

    it('should propagate update errors', async () => {
      fixture.workspaceRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(
          workspaceId,
          'https://example.com/logo.png',
          null,
          ownerId,
        ),
      ).rejects.toThrow('Database error');
    });

    it('should propagate delete file errors', async () => {
      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.deleteFile.mockRejectedValue(new Error('Delete error'));

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(
          workspaceId,
          'https://example.com/logo.png',
          null,
          ownerId,
        ),
      ).rejects.toThrow('Delete error');
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.publisher.workspaceUpdated.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(
          workspaceId,
          'https://example.com/logo.png',
          null,
          ownerId,
        ),
      ).rejects.toThrow('RabbitMQ error');
    });

    it('should propagate presigned url errors', async () => {
      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.getPresignedUrl.mockRejectedValue(new Error('Presigned error'));

      await expect(
        fixture.workspaceService.updateWorkspaceLogo(
          workspaceId,
          'https://example.com/logo.png',
          null,
          ownerId,
        ),
      ).rejects.toThrow('Presigned error');
    });
  });

  describe('deleteWorkspaceLogo', () => {
    const workspaceId = 'workspace-1';
    const ownerId = 'owner-1';
    const ipAddress = '127.0.0.1';

    const workspace = {
      id: workspaceId,
      ownerId,
      logoUrl: 'workspace/logo/workspace-1/logo.png',
    };

    const updatedWorkspace = {
      ...workspace,
      logoUrl: null,
      updatedAt: new Date('2026-07-31T10:00:00.000Z'),
    };

    beforeEach(() => {
      vi.clearAllMocks();

      vi.spyOn(fixture.workspaceService as any, 'requireOwner').mockResolvedValue(undefined);
    });

    it('should delete workspace logo successfully', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.deleteFile.mockResolvedValue(undefined);

      fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);

      const result = await fixture.workspaceService.deleteWorkspaceLogo(
        workspaceId,
        ownerId,
        ipAddress,
      );

      expect(result).toEqual(updatedWorkspace);

      expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(workspaceId);

      expect(fixture.workspaceService['requireOwner']).toHaveBeenCalledWith(workspaceId, ownerId);

      expect(fixture.workspaceRepository.update).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({
          logoUrl: null,
          updatedAt: expect.any(Date),
        }),
      );

      expect(fixture.storageService.deleteFile).toHaveBeenCalledWith(workspace.logoUrl);

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: workspaceId,
          updatedBy: ownerId,
          changedFields: ['logoUrl'],
          updatedAt: updatedWorkspace.updatedAt,
          ipAddress,
        }),
      );
    });

    it('should not delete file when logo url is an external http url', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue({
        ...workspace,
        logoUrl: 'https://example.com/logo.png',
      });

      fixture.workspaceRepository.update.mockResolvedValue({
        ...updatedWorkspace,
        logoUrl: null,
      });

      await fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId, ipAddress);

      expect(fixture.storageService.deleteFile).not.toHaveBeenCalled();

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalled();
    });

    it('should not delete file when workspace has no logo', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue({
        ...workspace,
        logoUrl: null,
      });

      fixture.workspaceRepository.update.mockResolvedValue({
        ...updatedWorkspace,
        logoUrl: null,
      });

      await fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId, ipAddress);

      expect(fixture.storageService.deleteFile).not.toHaveBeenCalled();

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalled();
    });

    it('should throw NotFoundError when workspace does not exist', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(null);

      await expect(
        fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId),
      ).rejects.toMatchObject({
        code: ERROR_CODE.WORKSPACE_NOT_FOUND,
        message: 'workspace.workspaceNotFound',
      });

      expect(fixture.workspaceService['requireOwner']).not.toHaveBeenCalled();

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();

      expect(fixture.storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should propagate requireOwner errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      vi.spyOn(fixture.workspaceService as any, 'requireOwner').mockRejectedValue(
        new Error('Forbidden'),
      );

      await expect(
        fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId),
      ).rejects.toThrow('Forbidden');

      expect(fixture.workspaceRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId),
      ).rejects.toThrow('Database error');

      expect(fixture.storageService.deleteFile).not.toHaveBeenCalled();

      expect(fixture.publisher.workspaceUpdated).not.toHaveBeenCalled();
    });

    it('should propagate storage delete errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.deleteFile.mockRejectedValue(new Error('Storage error'));

      await expect(
        fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId),
      ).rejects.toThrow('Storage error');

      expect(fixture.publisher.workspaceUpdated).not.toHaveBeenCalled();
    });

    it('should propagate publisher errors', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.deleteFile.mockResolvedValue(undefined);

      fixture.publisher.workspaceUpdated.mockRejectedValue(new Error('RabbitMQ error'));

      await expect(
        fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId),
      ).rejects.toThrow('RabbitMQ error');
    });

    it('should publish event with null ipAddress when ipAddress is omitted', async () => {
      fixture.workspaceRepository.findById.mockResolvedValue(workspace);

      fixture.workspaceRepository.update.mockResolvedValue(updatedWorkspace);

      fixture.storageService.deleteFile.mockResolvedValue(undefined);

      await fixture.workspaceService.deleteWorkspaceLogo(workspaceId, ownerId);

      expect(fixture.publisher.workspaceUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
        }),
      );
    });
  });
});
