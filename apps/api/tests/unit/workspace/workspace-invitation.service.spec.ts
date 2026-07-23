import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    UserStatus,
    InvitationStatus,
    WorkspaceMemberStatus,
} from '@prisma/client';

import { NotFoundError, ConflictError, GoneError } from '../../../src/common/errors/index.ts';

import { ERROR_CODE } from '../../../src/common/constants/index.ts';
import { createWorkspaceInvitationServiceFixture } from '../fixtures/workspace-invitation.service.fixture';

describe('WorkspaceInvitationService', () => {
    let fixture: ReturnType<typeof createWorkspaceInvitationServiceFixture>;

    beforeEach(() => {
        vi.clearAllMocks();

        fixture = createWorkspaceInvitationServiceFixture();
    });

    describe('createInvitation', () => {
        const workspaceId = 'workspace-1';
        const inviterId = 'inviter-1';
        const ipAddress = '127.0.0.1';

        const input = {
            email: 'invitee@example.com',
            roleId: 'role-1',
        };

        const mockWorkspace = {
            id: workspaceId,
            name: 'LinkFlow Workspace',
        };

        const mockInviter = {
            id: inviterId,
            email: 'inviter@example.com',
            fullName: 'John Doe',
        };

        const mockInvitee = {
            id: 'invitee-1',
            email: input.email,
            fullName: 'Invitee User',
            status: UserStatus.ACTIVE,
        };

        const mockRole = {
            id: 'role-1',
            name: 'MEMBER',
        };

        const mockInvitation = {
            id: 'invitation-1',
            workspaceId,
            inviterId,
            email: input.email,
            token: 'generated-token',
            expiresAt: new Date('2026-08-01'),
        };

        beforeEach(() => {
            fixture.workspaceRepository.findById.mockResolvedValue(mockWorkspace);

            fixture.userRepository.findById.mockResolvedValue(mockInviter);

            fixture.userRepository.findByEmail.mockResolvedValue(mockInvitee);

            fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(
                null,
            );

            fixture.workspaceInvitationRepository.findPendingByEmail.mockResolvedValue(
                null,
            );

            fixture.roleRepository.findById.mockResolvedValue(mockRole);

            fixture.workspaceInvitationRepository.create.mockResolvedValue(
                mockInvitation,
            );

            fixture.workspaceInvitationPublisher.workspaceInvitationCreated.mockResolvedValue(
                undefined,
            );
        });

        it('should create invitation successfully', async () => {
            const result =
                await fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                );

            expect(result).toEqual(mockInvitation);

            expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(
                workspaceId,
            );

            expect(fixture.userRepository.findById).toHaveBeenCalledWith(inviterId);

            expect(fixture.userRepository.findByEmail).toHaveBeenCalledWith(
                input.email,
            );

            expect(
                fixture.workspaceMemberRepository.findByWorkspaceAndUser,
            ).toHaveBeenCalledWith(workspaceId, mockInvitee.id);

            expect(
                fixture.workspaceInvitationRepository.findPendingByEmail,
            ).toHaveBeenCalledWith(workspaceId, input.email);

            expect(fixture.roleRepository.findById).toHaveBeenCalledWith(
                input.roleId,
            );

            expect(
                fixture.workspaceInvitationRepository.create,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    workspace: {
                        connect: {
                            id: workspaceId,
                        },
                    },
                    inviter: {
                        connect: {
                            id: inviterId,
                        },
                    },
                    role: {
                        connect: {
                            id: input.roleId,
                        },
                    },
                    user: {
                        connect: {
                            id: mockInvitee.id,
                        },
                    },
                    token: expect.any(String),
                    email: input.email,
                    expiresAt: expect.any(Date),
                }),
            );

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    invitationId: mockInvitation.id,
                    workspaceId,
                    workspaceName: mockWorkspace.name,
                    inviterId,
                    inviterName: mockInviter.fullName,
                    inviteeId: mockInvitee.id,
                    inviteeEmail: mockInvitee.email,
                    inviteeName: mockInvitee.fullName,
                    roleId: mockRole.id,
                    roleName: mockRole.name,
                    ipAddress,
                    token: expect.any(String),
                }),
            );
        });

        it('should throw NotFoundError when workspace does not exist', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.WORKSPACE_NOT_FOUND,
            });

            expect(fixture.userRepository.findById).not.toHaveBeenCalled();

            expect(fixture.userRepository.findByEmail).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when inviter does not exist', async () => {
            fixture.userRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.NOT_FOUND,
            });

            expect(fixture.workspaceRepository.findById).toHaveBeenCalledWith(
                workspaceId,
            );

            expect(fixture.userRepository.findById).toHaveBeenCalledWith(
                inviterId,
            );

            expect(fixture.userRepository.findByEmail).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when invitee does not exist', async () => {
            fixture.userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.NOT_FOUND,
            });

            expect(
                fixture.workspaceMemberRepository.findByWorkspaceAndUser,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.findPendingByEmail,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw NotFoundError when invitee is not active', async () => {
            fixture.userRepository.findByEmail.mockResolvedValue({
                ...mockInvitee,
                status: UserStatus.INACTIVE,
            });

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.NOT_FOUND,
            });

            expect(
                fixture.workspaceMemberRepository.findByWorkspaceAndUser,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw ConflictError when invitee is already an active member', async () => {
            fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(
                {
                    id: 'member-1',
                    workspaceId,
                    userId: mockInvitee.id,
                    status: WorkspaceMemberStatus.ACTIVE,
                },
            );

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.WORKSPACE_MEMBER_ALREADY_EXISTS,
            });

            expect(
                fixture.workspaceInvitationRepository.findPendingByEmail,
            ).not.toHaveBeenCalled();

            expect(fixture.roleRepository.findById).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).not.toHaveBeenCalled();
        });

        it('should continue when invitee is not an active member', async () => {
            fixture.workspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(
                {
                    id: 'member-1',
                    workspaceId,
                    userId: mockInvitee.id,
                    status: WorkspaceMemberStatus.INACTIVE,
                },
            );

            const result =
                await fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                );

            expect(result).toEqual(mockInvitation);

            expect(
                fixture.workspaceInvitationRepository.create,
            ).toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).toHaveBeenCalled();
        });

        it('should throw ConflictError when pending invitation already exists', async () => {
            fixture.workspaceInvitationRepository.findPendingByEmail.mockResolvedValue(
                {
                    id: 'invitation-old',
                    workspaceId,
                    inviterId,
                    email: input.email,
                    status: InvitationStatus.PENDING,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    role: {
                        name: mockRole.name,
                    },
                },
            );

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_ALREADY_EXISTS,
            });

            expect(fixture.roleRepository.findById).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).not.toHaveBeenCalled();
        });

        it('should expire existing invitation and throw GoneError when invitation has expired', async () => {
            const existingInvitation = {
                id: 'invitation-old',
                workspaceId,
                inviterId,
                email: input.email,
                status: InvitationStatus.PENDING,
                expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                role: {
                    name: mockRole.name,
                },
            };

            fixture.workspaceInvitationRepository.findPendingByEmail.mockResolvedValue(
                existingInvitation,
            );

            const handleInvitationExpiredSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'handleInvitationExpired',
                )
                .mockResolvedValue(undefined);

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_EXPIRED,
            });

            expect(handleInvitationExpiredSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: existingInvitation.id,
                    workspaceId,
                    workspaceName: mockWorkspace.name,
                    inviterId,
                    inviterName: mockInviter.fullName,
                    inviterEmail: mockInviter.email,
                    inviteeId: mockInvitee.id,
                    inviteeName: mockInvitee.fullName,
                    inviteeEmail: input.email,
                    roleName: mockRole.name,
                    previousStatus: existingInvitation.status,
                }),
                ipAddress,
            );

            expect(fixture.roleRepository.findById).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();
        });

        it('should throw ConflictError when role does not exist', async () => {
            fixture.roleRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.ROLE_NOT_FOUND,
            });

            expect(
                fixture.workspaceInvitationRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate workspace repository errors', async () => {
            fixture.workspaceRepository.findById.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toThrow('Database error');
        });

        it('should propagate invitation creation errors', async () => {
            fixture.workspaceInvitationRepository.create.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceInvitationPublisher.workspaceInvitationCreated.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceInvitationService.createInvitation(
                    workspaceId,
                    inviterId,
                    input,
                    ipAddress,
                ),
            ).rejects.toThrow('RabbitMQ error');

            expect(
                fixture.workspaceInvitationRepository.create,
            ).toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationCreated,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe('listInvitations', () => {
        const workspaceId = 'workspace-1';

        const mockWorkspace = {
            id: workspaceId,
            name: 'LinkFlow Workspace',
        };

        const mockInvitations = [
            {
                id: 'invitation-1',
                workspaceId,
                email: 'user1@example.com',
                status: 'PENDING',
            },
            {
                id: 'invitation-2',
                workspaceId,
                email: 'user2@example.com',
                status: 'ACCEPTED',
            },
        ];

        beforeEach(() => {
            fixture.workspaceRepository.findById.mockResolvedValue(mockWorkspace);
        });

        it('should list workspace invitations successfully', async () => {
            fixture.workspaceInvitationRepository.findAllByWorkspaceId.mockResolvedValue(
                mockInvitations,
            );

            const result =
                await fixture.workspaceInvitationService.listInvitations(workspaceId);

            expect(result).toEqual(mockInvitations);

            expect(
                fixture.workspaceRepository.findById,
            ).toHaveBeenCalledWith(workspaceId);

            expect(
                fixture.workspaceInvitationRepository.findAllByWorkspaceId,
            ).toHaveBeenCalledWith(workspaceId);
        });

        it('should return an empty array when workspace has no invitations', async () => {
            fixture.workspaceInvitationRepository.findAllByWorkspaceId.mockResolvedValue(
                [],
            );

            const result =
                await fixture.workspaceInvitationService.listInvitations(workspaceId);

            expect(result).toEqual([]);

            expect(
                fixture.workspaceInvitationRepository.findAllByWorkspaceId,
            ).toHaveBeenCalledWith(workspaceId);
        });

        it('should throw ConflictError when workspace does not exist', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.listInvitations(workspaceId),
            ).rejects.toMatchObject({
                code: ERROR_CODE.WORKSPACE_NOT_FOUND,
            });

            expect(
                fixture.workspaceInvitationRepository.findAllByWorkspaceId,
            ).not.toHaveBeenCalled();
        });

        it('should propagate repository errors', async () => {
            fixture.workspaceInvitationRepository.findAllByWorkspaceId.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.listInvitations(workspaceId),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationRepository.findAllByWorkspaceId,
            ).toHaveBeenCalledWith(workspaceId);
        });
    });

    describe('getInvitationById', () => {
        const invitationId = 'invitation-1';

        const mockInvitation = {
            id: invitationId,
            workspaceId: 'workspace-1',
            inviterId: 'inviter-1',
            email: 'invitee@example.com',
            status: 'PENDING',
        };

        it('should get invitation successfully', async () => {
            fixture.workspaceInvitationRepository.findById.mockResolvedValue(
                mockInvitation,
            );

            const result =
                await fixture.workspaceInvitationService.getInvitationById(
                    invitationId,
                );

            expect(result).toEqual(mockInvitation);

            expect(
                fixture.workspaceInvitationRepository.findById,
            ).toHaveBeenCalledWith(invitationId);
        });

        it('should throw ConflictError when invitation does not exist', async () => {
            fixture.workspaceInvitationRepository.findById.mockResolvedValue(null);

            await expect(
                fixture.workspaceInvitationService.getInvitationById(
                    invitationId,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_NOT_FOUND,
            });

            expect(
                fixture.workspaceInvitationRepository.findById,
            ).toHaveBeenCalledWith(invitationId);
        });

        it('should propagate repository errors', async () => {
            fixture.workspaceInvitationRepository.findById.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.getInvitationById(
                    invitationId,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationRepository.findById,
            ).toHaveBeenCalledWith(invitationId);
        });
    });

    describe('acceptInvitation', () => {
        const workspaceId = 'workspace-1';
        const invitationId = 'invitation-1';
        const userId = 'user-1';
        const token = 'invitation-token';
        const ipAddress = '127.0.0.1';

        const mockInvitation = {
            id: invitationId,
            workspaceId,
            inviterId: 'inviter-1',
            userId,
            roleId: 'role-1',
            email: 'invitee@example.com',
            status: InvitationStatus.PENDING,
            expiresAt: new Date('2099-01-01'),

            workspace: {
                id: workspaceId,
                name: 'LinkFlow Workspace',
            },

            inviter: {
                id: 'inviter-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },

            user: {
                id: userId,
                fullName: 'Jane Doe',
                email: 'jane@example.com',
            },

            role: {
                id: 'role-1',
                name: 'MEMBER',
            },
        };

        const mockWorkspaceMember = {
            id: 'member-1',
            workspaceId,
            userId,
            roleId: 'role-1',
            status: WorkspaceMemberStatus.ACTIVE,
        };

        const mockUpdatedInvitation = {
            id: invitationId,
            status: InvitationStatus.ACCEPTED,
            updatedAt: new Date(),
            acceptedAt: new Date(),
        };

        let validateInvitationForAcceptSpy: ReturnType<typeof vi.spyOn>;
        let handleInvitationExpiredSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            validateInvitationForAcceptSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'validateInvitationForAccept',
                )
                .mockResolvedValue(mockInvitation);

            handleInvitationExpiredSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'handleInvitationExpired',
                )
                .mockResolvedValue(undefined);

            fixture.workspaceMemberRepository.create.mockResolvedValue(
                mockWorkspaceMember,
            );

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                mockUpdatedInvitation,
            );

            fixture.transactionService.run.mockImplementation(
                async (callback) => callback('transaction'),
            );
        });

        it('should accept invitation successfully', async () => {
            const result =
                await fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                );

            expect(
                validateInvitationForAcceptSpy,
            ).toHaveBeenCalledWith(token);

            expect(
                fixture.workspaceMemberRepository.create,
            ).toHaveBeenCalledWith(
                {
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
                    role: {
                        connect: {
                            id: mockInvitation.roleId,
                        },
                    },
                    status: WorkspaceMemberStatus.ACTIVE,
                },
                'transaction',
            );

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                invitationId,
                InvitationStatus.ACCEPTED,
                'transaction',
            );

            expect(result).toEqual({
                workspaceMember: mockWorkspaceMember,
                updatedInvitation: mockUpdatedInvitation,
            });

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationAccepted,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    invitationId,
                    workspaceId,
                    workspaceName: mockInvitation.workspace.name,
                    inviterId: mockInvitation.inviter.id,
                    inviterName: mockInvitation.inviter.fullName,
                    inviterEmail: mockInvitation.inviter.email,
                    inviteeId: mockInvitation.user.id,
                    inviteeName: mockInvitation.user.fullName,
                    inviteeEmail: mockInvitation.user.email,
                    roleName: mockInvitation.role.name,
                    previousStatus: InvitationStatus.PENDING,
                    status: InvitationStatus.ACCEPTED,
                    ipAddress,
                }),
            );
        });

        it('should throw NotFoundError when invitation is not found', async () => {
            validateInvitationForAcceptSpy.mockRejectedValue(
                new NotFoundError(
                    'workspace.invitationNotFound',
                    ERROR_CODE.INVITATION_NOT_FOUND,
                ),
            );

            await expect(
                fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_NOT_FOUND,
            });

            expect(
                validateInvitationForAcceptSpy,
            ).toHaveBeenCalledWith(token);

            expect(
                fixture.transactionService.run,
            ).not.toHaveBeenCalled();
        });

        it('should throw ConflictError when invitation has already been processed', async () => {
            validateInvitationForAcceptSpy.mockRejectedValue(
                new ConflictError(
                    'workspace.invitationAlreadyProcessed',
                    ERROR_CODE.INVITATION_ALREADY_PROCESSED,
                ),
            );

            await expect(
                fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_ALREADY_PROCESSED,
            });

            expect(
                validateInvitationForAcceptSpy,
            ).toHaveBeenCalledWith(token);

            expect(
                fixture.transactionService.run,
            ).not.toHaveBeenCalled();
        });

        it('should throw GoneError when invitation has expired', async () => {
            validateInvitationForAcceptSpy.mockRejectedValue(
                new GoneError(
                    'workspace.invitationExpired',
                    ERROR_CODE.INVITATION_EXPIRED,
                ),
            );

            await expect(
                fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_EXPIRED,
            });

            expect(
                validateInvitationForAcceptSpy,
            ).toHaveBeenCalledWith(token);

            expect(
                fixture.transactionService.run,
            ).not.toHaveBeenCalled();
        });

        it('should create workspace member and update invitation inside transaction', async () => {
            await fixture.workspaceInvitationService.acceptInvitation(
                workspaceId,
                invitationId,
                userId,
                ipAddress,
                token,
            );

            expect(
                fixture.transactionService.run,
            ).toHaveBeenCalledTimes(1);

            expect(
                fixture.workspaceMemberRepository.create,
            ).toHaveBeenCalledTimes(1);

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledTimes(1);
        });

        it('should propagate transaction errors', async () => {
            fixture.transactionService.run.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationAccepted,
            ).not.toHaveBeenCalled();
        });

        it('should propagate publisher errors', async () => {
            fixture.workspaceInvitationPublisher.workspaceInvitationAccepted.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceInvitationService.acceptInvitation(
                    workspaceId,
                    invitationId,
                    userId,
                    ipAddress,
                    token,
                ),
            ).rejects.toThrow('RabbitMQ error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationAccepted,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe('validateInvitationForAccept', () => {
        const workspaceId = 'workspace-1';
        const invitationId = 'invitation-1';
        const userId = 'user-1';
        const token = 'invitation-token';

        const mockInvitation = {
            id: invitationId,
            workspaceId,
            inviterId: 'inviter-1',
            userId,
            roleId: 'role-1',
            email: 'invitee@example.com',
            status: InvitationStatus.PENDING,
            expiresAt: new Date('2099-01-01'),

            workspace: {
                id: workspaceId,
                name: 'LinkFlow Workspace',
            },

            inviter: {
                id: 'inviter-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },

            user: {
                id: userId,
                fullName: 'Jane Doe',
                email: 'jane@example.com',
            },

            role: {
                id: 'role-1',
                name: 'MEMBER',
            },
        };

        it('should return invitation when token is valid', async () => {
            fixture.workspaceInvitationRepository.findByToken.mockResolvedValue(
                mockInvitation,
            );

            const result = await (
                fixture.workspaceInvitationService as any
            ).validateInvitationForAccept(token);

            expect(result).toEqual(mockInvitation);

            expect(
                fixture.workspaceInvitationRepository.findByToken,
            ).toHaveBeenCalledWith(token);
        });

        it('should throw NotFoundError when invitation does not exist', async () => {
            fixture.workspaceInvitationRepository.findByToken.mockResolvedValue(
                null,
            );

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).validateInvitationForAccept(token),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_NOT_FOUND,
            });

            expect(
                fixture.workspaceInvitationRepository.findByToken,
            ).toHaveBeenCalledWith(token);
        });

        it('should throw ConflictError when invitation is already processed', async () => {
            fixture.workspaceInvitationRepository.findByToken.mockResolvedValue({
                ...mockInvitation,
                status: InvitationStatus.ACCEPTED,
            });

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).validateInvitationForAccept(token),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_ALREADY_PROCESSED,
            });
        });

        it('should call handleInvitationExpired and throw GoneError when invitation is expired', async () => {
            const expiredInvitation = {
                ...mockInvitation,
                expiresAt: new Date('2020-01-01'),
            };

            fixture.workspaceInvitationRepository.findByToken.mockResolvedValue(
                expiredInvitation,
            );

            const handleInvitationExpiredSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'handleInvitationExpired',
                )
                .mockResolvedValue(undefined);

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).validateInvitationForAccept(token),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_EXPIRED,
            });

            expect(
                handleInvitationExpiredSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expiredInvitation.id,
                    workspaceId: expiredInvitation.workspaceId,
                    workspaceName: expiredInvitation.workspace.name,
                    inviterId: expiredInvitation.inviterId,
                    inviterName: expiredInvitation.inviter.fullName,
                    inviterEmail: expiredInvitation.inviter.email,
                    inviteeId: expiredInvitation.userId,
                    inviteeName: expiredInvitation.user.fullName,
                    inviteeEmail: expiredInvitation.email,
                    roleName: expiredInvitation.role.name,
                    previousStatus: expiredInvitation.status,
                }),
                null,
            );
        });

        it('should propagate error when handleInvitationExpired fails', async () => {
            const expiredInvitation = {
                ...mockInvitation,
                expiresAt: new Date('2020-01-01'),
            };

            fixture.workspaceInvitationRepository.findByToken.mockResolvedValue(
                expiredInvitation,
            );

            const handleInvitationExpiredSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'handleInvitationExpired',
                )
                .mockRejectedValue(new Error('Failed to publish expiration event'));

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).validateInvitationForAccept(token),
            ).rejects.toThrow('Failed to publish expiration event');

            expect(
                handleInvitationExpiredSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expiredInvitation.id,
                    workspaceId: expiredInvitation.workspaceId,
                    workspaceName: expiredInvitation.workspace.name,
                    inviterId: expiredInvitation.inviterId,
                    inviterName: expiredInvitation.inviter.fullName,
                    inviterEmail: expiredInvitation.inviter.email,
                    inviteeId: expiredInvitation.userId,
                    inviteeName: expiredInvitation.user.fullName,
                    inviteeEmail: expiredInvitation.email,
                    roleName: expiredInvitation.role.name,
                    previousStatus: expiredInvitation.status,
                }),
                null,
            );
        });
    });

    describe('handleInvitationExpired', () => {
        const expiredEvent = {
            id: 'invitation-1',
            workspaceId: 'workspace-1',
            workspaceName: 'LinkFlow Workspace',
            inviterId: 'inviter-1',
            inviterName: 'John Doe',
            inviterEmail: 'john@example.com',
            inviteeId: 'user-1',
            inviteeName: 'Jane Doe',
            inviteeEmail: 'jane@example.com',
            roleName: 'MEMBER',
            previousStatus: InvitationStatus.PENDING,
        };

        const ipAddress = '127.0.0.1';

        const updatedInvitation = {
            id: expiredEvent.id,
            updatedAt: new Date('2026-07-23T10:00:00.000Z'),
            acceptedAt: null,
            expiresAt: new Date('2026-07-22T10:00:00.000Z'),
            status: InvitationStatus.EXPIRED,
        };

        it('should update invitation status to EXPIRED and publish expiration event', async () => {
            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            const workspaceInvitationUpdatedSpy = vi
                .spyOn(
                    fixture.workspaceInvitationPublisher,
                    'workspaceInvitationExpired',
                )
                .mockResolvedValue(undefined);

            await (
                fixture.workspaceInvitationService as any
            ).handleInvitationExpired(
                expiredEvent,
                ipAddress,
            );

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                expiredEvent.id,
                InvitationStatus.EXPIRED,
            );

            expect(
                workspaceInvitationUpdatedSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    invitationId: updatedInvitation.id,
                    workspaceId: expiredEvent.workspaceId,
                    workspaceName: expiredEvent.workspaceName,
                    inviterId: expiredEvent.inviterId,
                    inviterName: expiredEvent.inviterName,
                    inviterEmail: expiredEvent.inviterEmail,
                    inviteeId: expiredEvent.inviteeId,
                    inviteeName: expiredEvent.inviteeName,
                    inviteeEmail: expiredEvent.inviteeEmail,
                    roleName: expiredEvent.roleName,
                    previousStatus: expiredEvent.previousStatus,
                    status: InvitationStatus.EXPIRED,
                    updatedAt: updatedInvitation.updatedAt,
                    expiresAt: updatedInvitation.expiresAt,
                    ipAddress,
                }),
            );
        });

        it('should propagate error when updating invitation status fails', async () => {
            fixture.workspaceInvitationRepository.updateStatus.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).handleInvitationExpired(
                    expiredEvent,
                    ipAddress,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationExpired,
            ).not.toHaveBeenCalled();
        });

        it('should propagate error when publishing expiration event fails', async () => {
            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            fixture.workspaceInvitationPublisher.workspaceInvitationExpired =
                vi.fn().mockRejectedValue(
                    new Error('RabbitMQ error'),
                );

            await expect(
                (
                    fixture.workspaceInvitationService as any
                ).handleInvitationExpired(
                    expiredEvent,
                    ipAddress,
                ),
            ).rejects.toThrow('RabbitMQ error');

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                expiredEvent.id,
                InvitationStatus.EXPIRED,
            );
        });
    });

    describe('revokeInvitation', () => {
        const workspaceId = 'workspace-1';
        const invitationId = 'invitation-1';
        const ipAddress = '127.0.0.1';

        const mockInvitation = {
            id: invitationId,
            workspaceId,
            inviterId: 'inviter-1',
            userId: 'user-1',
            email: 'jane@example.com',
            status: InvitationStatus.PENDING,

            inviter: {
                id: 'inviter-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },

            user: {
                id: 'user-1',
                fullName: 'Jane Doe',
                email: 'jane@example.com',
            },

            role: {
                id: 'role-1',
                name: 'MEMBER',
            },
        };

        const mockWorkspace = {
            id: workspaceId,
            name: 'LinkFlow Workspace',
        };

        const updatedInvitation = {
            id: invitationId,
            updatedAt: new Date('2026-07-23T10:00:00.000Z'),
            revokedAt: new Date('2026-07-23T10:00:00.000Z'),
        };

        it('should revoke invitation successfully', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                mockWorkspace,
            );

            fixture.workspaceInvitationRepository.findById.mockResolvedValue(
                mockInvitation,
            );

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            const workspaceInvitationRevokedSpy = vi
                .spyOn(
                    fixture.workspaceInvitationPublisher,
                    'workspaceInvitationRevoked',
                )
                .mockResolvedValue(undefined);

            const result =
                await fixture.workspaceInvitationService.revokeInvitation(
                    workspaceId,
                    invitationId,
                    ipAddress,
                );

            expect(result).toEqual(updatedInvitation);

            expect(
                fixture.workspaceRepository.findById,
            ).toHaveBeenCalledWith(workspaceId);

            expect(
                fixture.workspaceInvitationRepository.findById,
            ).toHaveBeenCalledWith(invitationId);

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                invitationId,
                InvitationStatus.REVOKED,
            );

            expect(
                workspaceInvitationRevokedSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    invitationId: mockInvitation.id,
                    workspaceId,
                    workspaceName: mockWorkspace.name,

                    inviterId: mockInvitation.inviter.id,
                    inviterName: mockInvitation.inviter.fullName,
                    inviterEmail: mockInvitation.inviter.email,

                    inviteeId: mockInvitation.userId,
                    inviteeName: mockInvitation.user.fullName,
                    inviteeEmail: mockInvitation.email,

                    roleName: mockInvitation.role.name,
                    previousStatus: mockInvitation.status,
                    status: InvitationStatus.REVOKED,

                    updatedAt: updatedInvitation.updatedAt,
                    revokedAt: updatedInvitation.revokedAt,
                    ipAddress,
                }),
            );
        });

        it('should throw NotFoundError when invitation does not exist', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                mockWorkspace,
            );

            fixture.workspaceInvitationRepository.findById.mockResolvedValue(
                null,
            );

            await expect(
                fixture.workspaceInvitationService.revokeInvitation(
                    workspaceId,
                    invitationId,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_NOT_FOUND,
            });

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationRevoked,
            ).not.toHaveBeenCalled();
        });

        it('should propagate error when updating invitation status fails', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                mockWorkspace,
            );

            fixture.workspaceInvitationRepository.findById.mockResolvedValue(
                mockInvitation,
            );

            fixture.workspaceInvitationRepository.updateStatus.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.revokeInvitation(
                    workspaceId,
                    invitationId,
                    ipAddress,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationRevoked,
            ).not.toHaveBeenCalled();
        });

        it('should propagate error when publishing revoke event fails', async () => {
            fixture.workspaceRepository.findById.mockResolvedValue(
                mockWorkspace,
            );

            fixture.workspaceInvitationRepository.findById.mockResolvedValue(
                mockInvitation,
            );

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            fixture.workspaceInvitationPublisher.workspaceInvitationRevoked.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceInvitationService.revokeInvitation(
                    workspaceId,
                    invitationId,
                    ipAddress,
                ),
            ).rejects.toThrow('RabbitMQ error');

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                invitationId,
                InvitationStatus.REVOKED,
            );
        });
    });

    describe('rejectInvitation', () => {
        const token = 'invitation-token';
        const ipAddress = '127.0.0.1';

        const mockInvitation = {
            id: 'invitation-1',
            workspaceId: 'workspace-1',
            inviterId: 'inviter-1',
            userId: 'user-1',
            roleId: 'role-1',
            email: 'invitee@example.com',
            status: InvitationStatus.PENDING,
            expiresAt: new Date('2099-01-01'),

            workspace: {
                id: 'workspace-1',
                name: 'LinkFlow Workspace',
            },

            inviter: {
                id: 'inviter-1',
                fullName: 'John Doe',
                email: 'john@example.com',
            },

            user: {
                id: 'user-1',
                fullName: 'Jane Doe',
                email: 'jane@example.com',
            },

            role: {
                id: 'role-1',
                name: 'MEMBER',
            },
        };

        const updatedInvitation = {
            id: 'invitation-1',
            updatedAt: new Date('2026-07-23T10:00:00.000Z'),
            rejectedAt: new Date('2026-07-23T10:00:00.000Z'),
        };

        it('should reject invitation successfully', async () => {
            const validateInvitationForAcceptSpy = vi
                .spyOn(
                    fixture.workspaceInvitationService as any,
                    'validateInvitationForAccept',
                )
                .mockResolvedValue(mockInvitation);

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            const workspaceInvitationRejectedSpy = vi
                .spyOn(
                    fixture.workspaceInvitationPublisher,
                    'workspaceInvitationRejected',
                )
                .mockResolvedValue(undefined);

            const result =
                await fixture.workspaceInvitationService.rejectInvitation(
                    token,
                    ipAddress,
                );

            expect(result).toEqual(updatedInvitation);

            expect(
                validateInvitationForAcceptSpy,
            ).toHaveBeenCalledWith(token);

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                mockInvitation.id,
                InvitationStatus.DECLINED,
            );

            expect(
                workspaceInvitationRejectedSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    invitationId: mockInvitation.id,

                    workspaceId: mockInvitation.workspace.id,
                    workspaceName: mockInvitation.workspace.name,

                    inviterId: mockInvitation.inviter.id,
                    inviterName: mockInvitation.inviter.fullName,
                    inviterEmail: mockInvitation.inviter.email,

                    inviteeId: mockInvitation.userId,
                    inviteeName: mockInvitation.user.fullName,
                    inviteeEmail: mockInvitation.user.email,

                    roleName: mockInvitation.role.name,

                    previousStatus: mockInvitation.status,
                    status: InvitationStatus.DECLINED,

                    updatedAt: updatedInvitation.updatedAt,
                    rejectedAt: updatedInvitation.rejectedAt,

                    ipAddress,
                }),
            );
        });

        it('should reject invitation successfully with null ip address', async () => {
            vi.spyOn(
                fixture.workspaceInvitationService as any,
                'validateInvitationForAccept',
            ).mockResolvedValue(mockInvitation);

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            const workspaceInvitationRejectedSpy = vi
                .spyOn(
                    fixture.workspaceInvitationPublisher,
                    'workspaceInvitationRejected',
                )
                .mockResolvedValue(undefined);

            await fixture.workspaceInvitationService.rejectInvitation(
                token,
                null,
            );

            expect(
                workspaceInvitationRejectedSpy,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: InvitationStatus.DECLINED,
                    ipAddress: null,
                }),
            );
        });

        it('should propagate error when invitation validation fails', async () => {
            const error = new GoneError(
                'workspace.invitationExpired',
                ERROR_CODE.INVITATION_EXPIRED,
            );

            vi.spyOn(
                fixture.workspaceInvitationService as any,
                'validateInvitationForAccept',
            ).mockRejectedValue(error);

            await expect(
                fixture.workspaceInvitationService.rejectInvitation(
                    token,
                    ipAddress,
                ),
            ).rejects.toMatchObject({
                code: ERROR_CODE.INVITATION_EXPIRED,
            });

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).not.toHaveBeenCalled();

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationRejected,
            ).not.toHaveBeenCalled();
        });

        it('should propagate error when updating invitation status fails', async () => {
            vi.spyOn(
                fixture.workspaceInvitationService as any,
                'validateInvitationForAccept',
            ).mockResolvedValue(mockInvitation);

            fixture.workspaceInvitationRepository.updateStatus.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(
                fixture.workspaceInvitationService.rejectInvitation(
                    token,
                    ipAddress,
                ),
            ).rejects.toThrow('Database error');

            expect(
                fixture.workspaceInvitationPublisher.workspaceInvitationRejected,
            ).not.toHaveBeenCalled();
        });

        it('should propagate error when publishing rejected event fails', async () => {
            vi.spyOn(
                fixture.workspaceInvitationService as any,
                'validateInvitationForAccept',
            ).mockResolvedValue(mockInvitation);

            fixture.workspaceInvitationRepository.updateStatus.mockResolvedValue(
                updatedInvitation,
            );

            fixture.workspaceInvitationPublisher.workspaceInvitationRejected.mockRejectedValue(
                new Error('RabbitMQ error'),
            );

            await expect(
                fixture.workspaceInvitationService.rejectInvitation(
                    token,
                    ipAddress,
                ),
            ).rejects.toThrow('RabbitMQ error');

            expect(
                fixture.workspaceInvitationRepository.updateStatus,
            ).toHaveBeenCalledWith(
                mockInvitation.id,
                InvitationStatus.DECLINED,
            );
        });
    });
});