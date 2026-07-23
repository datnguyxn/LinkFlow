import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceStatus } from '@prisma/client';

import { createWorkspaceServiceFixture } from '../fixtures/workspace.service.fixture';

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

            expect(
                fixture.workspaceRepository.findBySlug,
            ).toHaveBeenCalledWith('my-workspace');

            expect(
                fixture.workspaceRepository.create,
            ).toHaveBeenCalledWith({
                name: 'My Workspace',
                ownerId: 'user-1',
                logoUrl: 'https://example.com/logo.png',
            });

            expect(
                fixture.publisher.workspaceCreated,
            ).toHaveBeenCalledWith({
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

            const result = await fixture.workspaceService.createWorkspace(
                data,
                'user-1',
            );

            expect(result).toEqual(createdWorkspace);

            expect(
                fixture.workspaceRepository.findBySlug,
            ).not.toHaveBeenCalled();
        });

        it('should throw when workspace slug already exists', async () => {
            fixture.workspaceRepository.findBySlug.mockResolvedValue({
                id: 'existing-workspace',
                slug: 'my-workspace',
            });

            await expect(
                fixture.workspaceService.createWorkspace(
                    workspaceData,
                    'user-1',
                ),
            ).rejects.toMatchObject({
                message: 'workspace.slugAlreadyExists',
            });

            expect(
                fixture.workspaceRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                fixture.publisher.workspaceCreated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate repository errors', async () => {
            fixture.workspaceRepository.findBySlug.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.createWorkspace(
                    workspaceData,
                    'user-1',
                ),
            ).rejects.toThrow('Database error');
        });

        it('should propagate create errors', async () => {
            fixture.workspaceRepository.findBySlug.mockResolvedValue(null);

            fixture.workspaceRepository.create.mockRejectedValue(
                new Error('Create error'),
            );

            await expect(
                fixture.workspaceService.createWorkspace(
                    workspaceData,
                    'user-1',
                ),
            ).rejects.toThrow('Create error');

            expect(
                fixture.publisher.workspaceCreated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceRepository.findBySlug.mockResolvedValue(null);

            fixture.workspaceRepository.create.mockResolvedValue(createdWorkspace);

            fixture.publisher.workspaceCreated.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceService.createWorkspace(
                    workspaceData,
                    'user-1',
                ),
            ).rejects.toThrow('RabbitMQ error');
        });
    });

    describe('getAllWorkspaces', () => {
        it('should return all user workspaces successfully', async () => {
            const workspaces = [
                {
                    id: 'workspace-1',
                    name: 'Workspace 1',
                    ownerId: 'user-1',
                },
                {
                    id: 'workspace-2',
                    name: 'Workspace 2',
                    ownerId: 'user-1',
                },
            ];

            fixture.workspaceRepository.findAllByUserId.mockResolvedValue(
                workspaces,
            );

            const result =
                await fixture.workspaceService.getAllWorkspaces('user-1');

            expect(result).toEqual(workspaces);

            expect(
                fixture.workspaceRepository.findAllByUserId,
            ).toHaveBeenCalledWith('user-1');
        });

        it('should return empty array when user has no workspaces', async () => {
            fixture.workspaceRepository.findAllByUserId.mockResolvedValue([]);

            const result =
                await fixture.workspaceService.getAllWorkspaces('user-1');

            expect(result).toEqual([]);
        });

        it('should propagate repository errors', async () => {
            fixture.workspaceRepository.findAllByUserId.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.getAllWorkspaces('user-1'),
            ).rejects.toThrow('Database error');
        });
    });

    describe('getWorkspaceById', () => {
        const workspace = {
            id: 'workspace-1',
            name: 'My Workspace',
            ownerId: 'owner-1',
        };

        it('should return workspace successfully for a member', async () => {
            fixture.workspaceRepository.findWorkspaceAndMemberById.mockResolvedValue(
                workspace,
            );

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                'MEMBER',
            );

            const result =
                await fixture.workspaceService.getWorkspaceById(
                    'workspace-1',
                    'user-1',
                );

            expect(result).toEqual(workspace);

            expect(
                fixture.workspaceRepository.findWorkspaceAndMemberById,
            ).toHaveBeenCalledWith(
                'workspace-1',
                'user-1',
            );

            expect(
                fixture.workspaceMemberRepository.findRoleByUserId,
            ).toHaveBeenCalledWith(
                'workspace-1',
                'user-1',
            );
        });

        it('should throw when workspace does not exist', async () => {
            fixture.workspaceRepository.findWorkspaceAndMemberById.mockResolvedValue(
                null,
            );

            await expect(
                fixture.workspaceService.getWorkspaceById(
                    'workspace-1',
                    'user-1',
                ),
            ).rejects.toMatchObject({
                message: 'workspace.notFound',
            });

            expect(
                fixture.workspaceMemberRepository.findRoleByUserId,
            ).not.toHaveBeenCalled();
        });

        it('should throw when user is not a member', async () => {
            fixture.workspaceRepository.findWorkspaceAndMemberById.mockResolvedValue(
                workspace,
            );

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                null,
            );

            await expect(
                fixture.workspaceService.getWorkspaceById(
                    'workspace-1',
                    'user-1',
                ),
            ).rejects.toMatchObject({
                message: 'workspace.accessDenied',
            });
        });

        it('should propagate repository errors', async () => {
            fixture.workspaceRepository.findWorkspaceAndMemberById.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.getWorkspaceById(
                    'workspace-1',
                    'user-1',
                ),
            ).rejects.toThrow('Database error');
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

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                'OWNER',
            );

            fixture.workspaceRepository.update.mockResolvedValue(
                updatedWorkspace,
            );

            fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);

            const result =
                await fixture.workspaceService.updateWorkspace(
                    workspaceId,
                    workspaceData,
                    ownerId,
                    ipAddress,
                );

            expect(result).toEqual(updatedWorkspace);

            expect(
                fixture.workspaceRepository.update,
            ).toHaveBeenCalledWith(
                workspaceId,
                {
                    name: 'Updated Workspace',
                    logoUrl: 'new-logo.png',
                },
            );

            expect(
                fixture.publisher.workspaceUpdated,
            ).toHaveBeenCalledWith({
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
                fixture.workspaceService.updateWorkspace(
                    workspaceId,
                    workspaceData,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.notFound',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw when user is not a member', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(workspace);

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                null,
            );

            await expect(
                fixture.workspaceService.updateWorkspace(
                    workspaceId,
                    workspaceData,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.accessDenied',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should propagate update errors', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(workspace);

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                'OWNER',
            );

            fixture.workspaceRepository.update.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.updateWorkspace(
                    workspaceId,
                    workspaceData,
                    ownerId,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.publisher.workspaceUpdated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(workspace);

            fixture.workspaceMemberRepository.findRoleByUserId.mockResolvedValue(
                'OWNER',
            );

            fixture.workspaceRepository.update.mockResolvedValue(
                updatedWorkspace,
            );

            fixture.publisher.workspaceUpdated.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceService.updateWorkspace(
                    workspaceId,
                    workspaceData,
                    ownerId,
                ),
            ).rejects.toThrow('RabbitMQ error');
        });
    });

    describe('deleteWorkspace', () => {
        const workspaceId = 'workspace-1';
        const ownerId = 'owner-1';
        const ipAddress = '127.0.0.1';

        const workspace = {
            id: workspaceId,
            ownerId,
            status: WorkspaceStatus.ACTIVE,
        };

        const deletedWorkspace = {
            ...workspace,
            status: WorkspaceStatus.ARCHIVED,
        };

        it('should delete workspace successfully', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(workspace);

            fixture.workspaceRepository.update.mockResolvedValue(
                deletedWorkspace,
            );

            fixture.publisher.workspaceDeleted.mockResolvedValue(undefined);

            const result =
                await fixture.workspaceService.deleteWorkspace(
                    workspaceId,
                    ownerId,
                    ipAddress,
                );

            expect(result).toEqual(deletedWorkspace);

            expect(
                fixture.workspaceRepository.update,
            ).toHaveBeenCalledWith(
                workspaceId,
                {
                    status: WorkspaceStatus.ARCHIVED,
                },
            );

            expect(
                fixture.publisher.workspaceDeleted,
            ).toHaveBeenCalledWith({
                id: workspaceId,
                deletedBy: ownerId,
                deletedAt: expect.any(Date),
                ipAddress,
            });
        });

        it('should throw when workspace does not exist', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceService.deleteWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.notFound',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw when user is not the owner', async () => {
            fixture.workspaceRepository.findById
                .mockResolvedValueOnce(workspace)
                .mockResolvedValueOnce({
                    ...workspace,
                    ownerId: 'another-user',
                });

            await expect(
                fixture.workspaceService.deleteWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.ownerOnly',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should propagate update errors', async () => {
            fixture.workspaceRepository.findById
                .mockResolvedValue(workspace);

            fixture.workspaceRepository.update.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.deleteWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.publisher.workspaceDeleted,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(workspace);

            fixture.workspaceRepository.update.mockResolvedValue(
                deletedWorkspace,
            );

            fixture.publisher.workspaceDeleted.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceService.deleteWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toThrow('RabbitMQ error');
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
            fixture.workspaceRepository.findById.mockResolvedValue(
                archivedWorkspace,
            );

            fixture.workspaceRepository.update.mockResolvedValue(
                restoredWorkspace,
            );

            fixture.publisher.workspaceUpdated.mockResolvedValue(undefined);

            const result =
                await fixture.workspaceService.restoreWorkspace(
                    workspaceId,
                    ownerId,
                    ipAddress,
                );

            expect(result).toEqual(restoredWorkspace);

            expect(
                fixture.workspaceRepository.update,
            ).toHaveBeenCalledWith(
                workspaceId,
                {
                    status: WorkspaceStatus.ACTIVE,
                },
            );

            expect(
                fixture.publisher.workspaceUpdated,
            ).toHaveBeenCalledWith({
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
                fixture.workspaceService.restoreWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.notFound',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should throw when user is not the owner', async () => {
            fixture.workspaceRepository.findById
                .mockResolvedValueOnce(archivedWorkspace)
                .mockResolvedValueOnce({
                    ...archivedWorkspace,
                    ownerId: 'another-user',
                });

            await expect(
                fixture.workspaceService.restoreWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toMatchObject({
                message: 'workspace.ownerOnly',
            });

            expect(
                fixture.workspaceRepository.update,
            ).not.toHaveBeenCalled();
        });

        it('should propagate update errors', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                archivedWorkspace,
            );

            fixture.workspaceRepository.update.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceService.restoreWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.publisher.workspaceUpdated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                archivedWorkspace,
            );

            fixture.workspaceRepository.update.mockResolvedValue(
                restoredWorkspace,
            );

            fixture.publisher.workspaceUpdated.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceService.restoreWorkspace(
                    workspaceId,
                    ownerId,
                ),
            ).rejects.toThrow('RabbitMQ error');
        });
    });
});