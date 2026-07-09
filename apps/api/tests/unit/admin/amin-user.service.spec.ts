import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdminUserService } from "../../../src/modules/admin/service/admin-user.service";
import { ConflictError } from "../../../src/common/errors";
import { UserRole, UserStatus } from "@prisma/client";
import { UserAction } from "../../../src/common/enums/user-action.enum";

describe("AdminUserService", () => {
    let adminUserService: AdminUserService;
    let userRepository: any;
    let refreshTokenRepository: any;
    let adminUserPublisher: any;
    let transactionService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        userRepository = {
            // Mock methods of UserRepository as needed
            findAll: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        };

        refreshTokenRepository = {
            // Mock methods of RefreshTokenRepository as needed
            revokeAllByUserId: vi.fn(),
        };

        adminUserPublisher = {
            // Mock methods of AdminUserPublisher as needed
            userAction: vi.fn(),
        };

        transactionService = {
            // Mock methods of TransactionService as needed
            run: vi.fn(),
        };

        adminUserService = new AdminUserService(
            userRepository,
            refreshTokenRepository,
            adminUserPublisher,
            transactionService
        );
    });

    // Add your test cases here
    describe("getAllUsers", () => {
        it("should return paginated users", async () => {
            const result = {
                data: [{ id: "1" }],
                total: 1,
            };

            userRepository.findAll.mockResolvedValue(result);

            const users = await adminUserService.getAllUsers(1, 10);

            expect(users).toEqual(result);

            expect(userRepository.findAll)
                .toHaveBeenCalledWith(1, 10);
        });
    })
    describe("getUserById", () => {
        it("should return user successfully", async () => {
            const mockUser = {
                id: "1"
            };

            userRepository.findById.mockResolvedValue(mockUser);

            const result = await adminUserService.getUserById("1");

            expect(result).toEqual(mockUser);
            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(adminUserService.getUserById("1")).rejects.toBeInstanceOf(
                ConflictError,
            );

            await expect(adminUserService.getUserById("1")).rejects.toMatchObject({
                message: "user.userNotFound"
            });

            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });

        it("should propagate repository errors", async () => {
            const dbError = new Error("Database error");

            userRepository.findById.mockRejectedValue(dbError);

            await expect(adminUserService.getUserById("1")).rejects.toThrow(
                "Database error",
            );

            expect(userRepository.findById).toHaveBeenCalledWith("1");
        });
    })
    describe("banUser", () => {
        const userId = "user-1";
        const adminId = "admin-1";
        const ipAddress = "127.0.0.1";

        const tx = {} as any;

        const mockUser = {
            id: userId,
            email: "john@example.com",
            fullName: "John Doe",
            status: UserStatus.ACTIVE,
            role: UserRole.USER,
        };

        const suspendedUser = {
            ...mockUser,
            status: UserStatus.SUSPENDED,
        };

        beforeEach(() => {
            vi.clearAllMocks();

            transactionService.run.mockImplementation(async (callback: any) => {
                return callback(tx);
            });
        });

        it("should ban user successfully", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockResolvedValue(suspendedUser);

            refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

            adminUserPublisher.userAction.mockResolvedValue(undefined);

            const result = await adminUserService.banUser(
                userId,
                adminId,
                ipAddress,
            );

            expect(result).toEqual(suspendedUser);

            expect(transactionService.run).toHaveBeenCalledTimes(1);

            expect(userRepository.update).toHaveBeenCalledWith(
                userId,
                {
                    status: UserStatus.SUSPENDED,
                },
                tx,
            );

            expect(refreshTokenRepository.revokeAllByUserId)
                .toHaveBeenCalledWith(
                    userId,
                    tx,
                );

            expect(adminUserPublisher.userAction)
                .toHaveBeenCalledWith({
                    event: UserAction.USER_ACTION,
                    action: UserAction.BAN,
                    email: mockUser.email,
                    fullName: mockUser.fullName,
                    adminId,
                    targetUserId: userId,
                    reason: "User has been banned by admin",
                    changes: {
                        status: {
                            oldValue: UserStatus.ACTIVE,
                            newValue: UserStatus.SUSPENDED,
                        },
                    },
                    timestamp: expect.any(Date),
                    ipAddress,
                });
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(
                adminUserService.banUser(userId, adminId),
            ).rejects.toBeInstanceOf(ConflictError);

            expect(transactionService.run).not.toHaveBeenCalled();

            expect(userRepository.update).not.toHaveBeenCalled();

            expect(refreshTokenRepository.revokeAllByUserId)
                .not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction)
                .not.toHaveBeenCalled();
        });

        it("should rollback when update failed", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                adminUserService.banUser(userId, adminId),
            ).rejects.toThrow("Database error");

            expect(transactionService.run).toHaveBeenCalled();

            expect(refreshTokenRepository.revokeAllByUserId)
                .not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction)
                .not.toHaveBeenCalled();
        });

        it("should rollback when revoke tokens failed", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockResolvedValue(suspendedUser);

            refreshTokenRepository.revokeAllByUserId.mockRejectedValue(
                new Error("Revoke error"),
            );

            await expect(
                adminUserService.banUser(userId, adminId),
            ).rejects.toThrow("Revoke error");

            expect(transactionService.run).toHaveBeenCalled();

            expect(userRepository.update).toHaveBeenCalled();

            expect(refreshTokenRepository.revokeAllByUserId)
                .toHaveBeenCalled();

            expect(adminUserPublisher.userAction)
                .not.toHaveBeenCalled();
        });

        it("should propagate publisher error", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockResolvedValue(suspendedUser);

            refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

            adminUserPublisher.userAction.mockRejectedValue(
                new Error("RabbitMQ error"),
            );

            await expect(
                adminUserService.banUser(userId, adminId),
            ).rejects.toThrow("RabbitMQ error");

            expect(transactionService.run).toHaveBeenCalled();

            expect(userRepository.update).toHaveBeenCalled();

            expect(refreshTokenRepository.revokeAllByUserId)
                .toHaveBeenCalled();

            expect(adminUserPublisher.userAction)
                .toHaveBeenCalledTimes(1);
        });
    });

    describe("unbanUser", () => {
        const userId = "user-1";
        const adminId = "admin-1";
        const ipAddress = "127.0.0.1";

        const suspendedUser = {
            id: userId,
            email: "john@example.com",
            fullName: "John Doe",
            status: UserStatus.SUSPENDED,
            role: UserRole.USER,
        };

        const activeUser = {
            ...suspendedUser,
            status: UserStatus.ACTIVE,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should unban user successfully", async () => {
            userRepository.findById.mockResolvedValue(suspendedUser);

            userRepository.update.mockResolvedValue(activeUser);

            adminUserPublisher.userAction.mockResolvedValue(undefined);

            const result = await adminUserService.unbanUser(
                userId,
                adminId,
                ipAddress,
            );

            expect(result).toEqual(activeUser);

            expect(userRepository.findById).toHaveBeenCalledWith(userId);

            expect(userRepository.update).toHaveBeenCalledWith(
                userId,
                {
                    status: UserStatus.ACTIVE,
                },
            );

            expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
                event: UserAction.USER_ACTION,
                action: UserAction.UNBAN,
                email: suspendedUser.email,
                fullName: suspendedUser.fullName,
                adminId,
                targetUserId: userId,
                reason: "User has been unbanned by admin",
                changes: {
                    status: {
                        oldValue: UserStatus.SUSPENDED,
                        newValue: UserStatus.ACTIVE,
                    },
                },
                timestamp: expect.any(Date),
                ipAddress,
            });
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(
                adminUserService.unbanUser(userId, adminId),
            ).rejects.toBeInstanceOf(ConflictError);

            expect(userRepository.update).not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate repository update errors", async () => {
            userRepository.findById.mockResolvedValue(suspendedUser);

            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                adminUserService.unbanUser(userId, adminId),
            ).rejects.toThrow("Database error");

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate publisher errors", async () => {
            userRepository.findById.mockResolvedValue(suspendedUser);

            userRepository.update.mockResolvedValue(activeUser);

            adminUserPublisher.userAction.mockRejectedValue(
                new Error("RabbitMQ error"),
            );

            await expect(
                adminUserService.unbanUser(userId, adminId),
            ).rejects.toThrow("RabbitMQ error");

            expect(userRepository.update).toHaveBeenCalledWith(
                userId,
                {
                    status: UserStatus.ACTIVE,
                },
            );

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
        });
    });
    describe("changeRole", () => {
        const userId = "user-1";
        const adminId = "admin-1";
        const ipAddress = "127.0.0.1";

        const mockUser = {
            id: userId,
            email: "john@example.com",
            fullName: "John Doe",
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
        };

        const updatedUser = {
            ...mockUser,
            role: UserRole.ADMIN,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should change user role successfully", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockResolvedValue(updatedUser);

            adminUserPublisher.userAction.mockResolvedValue(undefined);

            const result = await adminUserService.changeRole(
                adminId,
                userId,
                "ADMIN",
                ipAddress,
            );

            expect(result).toEqual(updatedUser);

            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);

            expect(userRepository.update).toHaveBeenCalledTimes(1);
            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                role: UserRole.ADMIN,
            });

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);

            expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
                event: UserAction.USER_ACTION,
                action: UserAction.CHANGE_ROLE,
                email: mockUser.email,
                fullName: mockUser.fullName,
                adminId,
                targetUserId: userId,
                reason: "User role changed to ADMIN by admin",
                changes: {
                    role: {
                        oldValue: UserRole.USER,
                        newValue: UserRole.ADMIN,
                    },
                },
                timestamp: expect.any(Date),
                ipAddress,
            });
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            const promise = adminUserService.changeRole(
                adminId,
                userId,
                "ADMIN",
            );

            await expect(promise).rejects.toBeInstanceOf(ConflictError);
            await expect(promise).rejects.toThrow("user.userNotFound");

            expect(userRepository.update).not.toHaveBeenCalled();
            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate repository update errors", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                adminUserService.changeRole(
                    adminId,
                    userId,
                    "ADMIN",
                ),
            ).rejects.toThrow("Database error");

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate publisher errors", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            userRepository.update.mockResolvedValue(updatedUser);

            adminUserPublisher.userAction.mockRejectedValue(
                new Error("RabbitMQ error"),
            );

            await expect(
                adminUserService.changeRole(
                    adminId,
                    userId,
                    "ADMIN",
                ),
            ).rejects.toThrow("RabbitMQ error");

            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                role: UserRole.ADMIN,
            });

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteUser", () => {
        const userId = "user-1";
        const adminId = "admin-1";
        const ipAddress = "127.0.0.1";

        const tx = {} as any;

        const mockUser = {
            id: userId,
            email: "john@example.com",
            fullName: "John Doe",
            status: UserStatus.ACTIVE,
            role: UserRole.USER,
        };

        beforeEach(() => {
            vi.clearAllMocks();

            transactionService.run.mockImplementation(async (callback) => {
                return callback(tx);
            });
        });

        it("should delete user successfully", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            refreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

            userRepository.delete.mockResolvedValue(undefined);

            adminUserPublisher.userAction.mockResolvedValue(undefined);

            await adminUserService.deleteUser(
                userId,
                adminId,
                ipAddress,
            );

            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);

            expect(transactionService.run).toHaveBeenCalledTimes(1);

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).toHaveBeenCalledTimes(1);

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).toHaveBeenCalledWith(userId, tx);

            expect(userRepository.delete).toHaveBeenCalledTimes(1);

            expect(userRepository.delete).toHaveBeenCalledWith(
                userId,
                tx,
            );

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);

            expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
                event: UserAction.USER_ACTION,
                action: UserAction.DELETE,
                email: mockUser.email,
                fullName: mockUser.fullName,
                adminId,
                targetUserId: userId,
                reason: "User has been deleted by admin",
                changes: {
                    status: {
                        oldValue: UserStatus.ACTIVE,
                        newValue: UserStatus.DELETED,
                    },
                },
                timestamp: expect.any(Date),
                ipAddress,
            });
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            const promise = adminUserService.deleteUser(
                userId,
                adminId,
            );

            await expect(promise).rejects.toBeInstanceOf(
                ConflictError,
            );

            await expect(promise).rejects.toThrow(
                "user.userNotFound",
            );

            expect(transactionService.run).not.toHaveBeenCalled();

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).not.toHaveBeenCalled();

            expect(userRepository.delete).not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate refresh token revoke errors", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            refreshTokenRepository.revokeAllByUserId.mockRejectedValue(
                new Error("Revoke failed"),
            );

            await expect(
                adminUserService.deleteUser(
                    userId,
                    adminId,
                ),
            ).rejects.toThrow("Revoke failed");

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).toHaveBeenCalledWith(userId, tx);

            expect(userRepository.delete).not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate repository delete errors", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            refreshTokenRepository.revokeAllByUserId.mockResolvedValue(
                undefined,
            );

            userRepository.delete.mockRejectedValue(
                new Error("Delete failed"),
            );

            await expect(
                adminUserService.deleteUser(
                    userId,
                    adminId,
                ),
            ).rejects.toThrow("Delete failed");

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).toHaveBeenCalledWith(userId, tx);

            expect(userRepository.delete).toHaveBeenCalledWith(
                userId,
                tx,
            );

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate publisher errors", async () => {
            userRepository.findById.mockResolvedValue(mockUser);

            refreshTokenRepository.revokeAllByUserId.mockResolvedValue(
                undefined,
            );

            userRepository.delete.mockResolvedValue(undefined);

            adminUserPublisher.userAction.mockRejectedValue(
                new Error("RabbitMQ error"),
            );

            await expect(
                adminUserService.deleteUser(
                    userId,
                    adminId,
                    ipAddress,
                ),
            ).rejects.toThrow("RabbitMQ error");

            expect(
                refreshTokenRepository.revokeAllByUserId,
            ).toHaveBeenCalledWith(userId, tx);

            expect(userRepository.delete).toHaveBeenCalledWith(
                userId,
                tx,
            );

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
        });
    });

    describe("restoreUser", () => {
        const userId = "user-1";
        const adminId = "admin-1";
        const ipAddress = "127.0.0.1";

        const deletedUser = {
            id: userId,
            email: "john@example.com",
            fullName: "John Doe",
            status: UserStatus.DELETED,
            deletedAt: new Date(),
        };

        const restoredUser = {
            ...deletedUser,
            status: UserStatus.ACTIVE,
            deletedAt: null,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should restore user successfully", async () => {
            userRepository.findById.mockResolvedValue(deletedUser);

            userRepository.update.mockResolvedValue(restoredUser);

            adminUserPublisher.userAction.mockResolvedValue(undefined);

            const result = await adminUserService.restoreUser(
                userId,
                adminId,
                ipAddress,
            );

            expect(result).toEqual(restoredUser);

            expect(userRepository.findById).toHaveBeenCalledTimes(1);
            expect(userRepository.findById).toHaveBeenCalledWith(userId);

            expect(userRepository.update).toHaveBeenCalledTimes(1);

            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                status: UserStatus.ACTIVE,
                deletedAt: null,
            });

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);

            expect(adminUserPublisher.userAction).toHaveBeenCalledWith({
                event: UserAction.USER_ACTION,
                action: UserAction.RESTORE,
                email: deletedUser.email,
                fullName: deletedUser.fullName,
                adminId,
                targetUserId: userId,
                reason: "User has been restored by admin",
                changes: {
                    status: {
                        oldValue: UserStatus.DELETED,
                        newValue: UserStatus.ACTIVE,
                    },
                },
                timestamp: expect.any(Date),
                ipAddress,
            });
        });

        it("should throw ConflictError when user does not exist", async () => {
            userRepository.findById.mockResolvedValue(null);

            const promise = adminUserService.restoreUser(
                userId,
                adminId,
            );

            await expect(promise).rejects.toBeInstanceOf(
                ConflictError,
            );

            await expect(promise).rejects.toThrow(
                "user.userNotFound",
            );

            expect(userRepository.update).not.toHaveBeenCalled();

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate repository update errors", async () => {
            userRepository.findById.mockResolvedValue(deletedUser);

            userRepository.update.mockRejectedValue(
                new Error("Database error"),
            );

            await expect(
                adminUserService.restoreUser(
                    userId,
                    adminId,
                ),
            ).rejects.toThrow("Database error");

            expect(adminUserPublisher.userAction).not.toHaveBeenCalled();
        });

        it("should propagate publisher errors", async () => {
            userRepository.findById.mockResolvedValue(deletedUser);

            userRepository.update.mockResolvedValue(restoredUser);

            adminUserPublisher.userAction.mockRejectedValue(
                new Error("RabbitMQ error"),
            );

            await expect(
                adminUserService.restoreUser(
                    userId,
                    adminId,
                    ipAddress,
                ),
            ).rejects.toThrow("RabbitMQ error");

            expect(userRepository.update).toHaveBeenCalledWith(userId, {
                status: UserStatus.ACTIVE,
                deletedAt: null,
            });

            expect(adminUserPublisher.userAction).toHaveBeenCalledTimes(1);
        });
    });
});