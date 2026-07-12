import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../../src/utils/password.util", () => ({
    hashPassword: vi.fn(),
}));

import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { hashPassword } from "../../../src/utils/password.util";
import { UserStatus } from "@prisma/client"
import { ERROR_CODE } from "../../../src/common/constants/index";

describe("AuthService", () => {
    let authService: AuthService;

    let userRepository: any;
    let workspaceRepository: any;
    let refreshTokenRepository: any;
    let jwtService: any;
    let transactionService: any;
    let emailVerificationRepository: any;
    let authPublisher: any;

    beforeEach(() => {
        vi.clearAllMocks();

        userRepository = {
            findByEmail: vi.fn(),
            createUser: vi.fn(),
        };

        workspaceRepository = {
            create: vi.fn(),
        };

        refreshTokenRepository = {
            create: vi.fn(),
        };

        jwtService = {
            generateTokens: vi.fn(),
            hashRefreshToken: vi.fn(),
        };

        transactionService = {
            run: vi.fn(),
        };

        emailVerificationRepository = {
            create: vi.fn(),
            deleteByUserId: vi.fn(),
        };

        authPublisher = {
            userRegistered: vi.fn(),
        };

        authService = new AuthService(
            userRepository,
            workspaceRepository,
            refreshTokenRepository,
            jwtService,
            transactionService,
            emailVerificationRepository,
            authPublisher
        );
    });

    describe("registerUser", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should register successfully", async () => {
            const createdUser = {
                id: "user-id",
                email: "dat@gmail.com",
                fullName: "Dat Nguyen",
            };

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue("hashed-password");

            transactionService.run.mockImplementation(async (callback: any) => {
                const tx = {};

                userRepository.createUser.mockResolvedValue(createdUser);

                emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

                emailVerificationRepository.create.mockResolvedValue(undefined);

                return callback(tx);
            });

            authPublisher.userRegistered.mockResolvedValue(undefined);

            await authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat Nguyen",
                "127.0.0.1",
            );

            expect(userRepository.findByEmail)
                .toHaveBeenCalledWith("dat@gmail.com");

            expect(hashPassword)
                .toHaveBeenCalledWith("Password@123");

            expect(transactionService.run)
                .toHaveBeenCalledTimes(1);

            expect(userRepository.createUser)
                .toHaveBeenCalledWith(
                    {
                        email: "dat@gmail.com",
                        passwordHash: "hashed-password",
                        fullName: "Dat Nguyen",
                        status: "PENDING_VERIFICATION",
                        language: "en",
                        timezone: "UTC",
                    },
                    expect.any(Object),
                );

            expect(emailVerificationRepository.deleteByUserId)
                .toHaveBeenCalledWith(
                    "user-id",
                    expect.any(Object),
                );

            expect(emailVerificationRepository.create)
                .toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({
                        userId: "user-id",
                        verifyToken: expect.any(String),
                    }),
                );

            expect(authPublisher.userRegistered)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: "user-id",
                        email: "dat@gmail.com",
                        fullName: "Dat Nguyen",
                        verifyToken: expect.any(String),
                        ipAddress: "127.0.0.1",
                    }),
                );
        });

        it("should throw USER_ALREADY_EXISTS", async () => {

            userRepository.findByEmail.mockResolvedValue({
                emailVerified: true,
                status: UserStatus.ACTIVE,
            });

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "123",
                    "Dat",
                ),
            ).rejects.toMatchObject({
                statusCode: 409,
                code: ERROR_CODE.USER_ALREADY_EXISTS,
            });
        });

        it("should resend verification email", async () => {

            const pendingUser = {
                id: "1",
                email: "dat@gmail.com",
                fullName: "Dat",
                status: UserStatus.PENDING_VERIFICATION,
                emailVerified: false,
            };

            userRepository.findByEmail.mockResolvedValue(
                pendingUser,
            );

            vi.spyOn(authService as any, "sendVerificationEmail")
                .mockResolvedValue(undefined);

            await authService.registerUser(
                "dat@gmail.com",
                "123",
                "Dat",
            );

            expect(authService["sendVerificationEmail"])
                .toHaveBeenCalledWith(
                    pendingUser,
                    undefined,
                );
        });

        it("should throw if createPendingUser failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            vi.spyOn(authService as any, "createPendingUser")
                .mockRejectedValue(
                    new Error("DB Error"),
                );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "123",
                    "Dat",
                ),
            ).rejects.toThrow("DB Error");
        });

        it("should throw if publishVerificationEmail failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            vi.spyOn(authService as any, "createPendingUser")
                .mockResolvedValue({
                    user: {
                        id: "1",
                        email: "dat@gmail.com",
                        fullName: "Dat",
                    },
                    verifyToken: "token",
                });

            authPublisher.userRegistered.mockRejectedValue(new Error("RabbitMQ Error"));

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "123",
                    "Dat",
                ),
            ).rejects.toThrow("RabbitMQ Error");
        });
    });

    describe("createPendingUser", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        const createdUser = {
            id: "user-id",
            email: "dat@gmail.com",
            fullName: "Dat Nguyen",
        };

        it("should create pending user successfully", async () => {
            (hashPassword as any).mockResolvedValue("hashed-password");

            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            userRepository.createUser.mockResolvedValue(createdUser);

            emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

            emailVerificationRepository.create.mockResolvedValue(undefined);

            const result = await authService["createPendingUser"](
                "dat@gmail.com",
                "Password@123",
                "Dat Nguyen",
            );

            expect(hashPassword).toHaveBeenCalledWith("Password@123");

            expect(transactionService.run).toHaveBeenCalled();

            expect(userRepository.createUser).toHaveBeenCalledWith(
                {
                    email: "dat@gmail.com",
                    passwordHash: "hashed-password",
                    fullName: "Dat Nguyen",
                    status: "PENDING_VERIFICATION",
                    language: "en",
                    timezone: "UTC",
                },
                expect.any(Object),
            );

            expect(emailVerificationRepository.deleteByUserId)
                .toHaveBeenCalledWith(
                    "user-id",
                    expect.any(Object),
                );

            expect(emailVerificationRepository.create)
                .toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({
                        userId: "user-id",
                        verifyToken: expect.any(String),
                    }),
                );

            expect(result.user).toEqual(createdUser);
            expect(result.verifyToken).toEqual(expect.any(String));
        });

        it("should throw if hashPassword failed", async () => {
            (hashPassword as any).mockRejectedValue(
                new Error("Hash Error"),
            );

            await expect(
                authService["createPendingUser"](
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Hash Error");

            expect(transactionService.run).not.toHaveBeenCalled();
        });

        it("should throw if transaction failed", async () => {
            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockRejectedValue(
                new Error("Transaction Error"),
            );

            await expect(
                authService["createPendingUser"](
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Transaction Error");
        });

        it("should throw if createUser failed", async () => {
            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            userRepository.createUser.mockRejectedValue(
                new Error("Create User Error"),
            );

            await expect(
                authService["createPendingUser"](
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Create User Error");

            expect(emailVerificationRepository.deleteByUserId)
                .not.toHaveBeenCalled();
        });

        it("should throw if delete verification token failed", async () => {
            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            userRepository.createUser.mockResolvedValue(createdUser);

            emailVerificationRepository.deleteByUserId.mockRejectedValue(
                new Error("Delete Token Error"),
            );

            await expect(
                authService["createPendingUser"](
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Delete Token Error");

            expect(emailVerificationRepository.create)
                .not.toHaveBeenCalled();
        });

        it("should throw if create verification token failed", async () => {
            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            userRepository.createUser.mockResolvedValue(createdUser);

            emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

            emailVerificationRepository.create.mockRejectedValue(
                new Error("Create Token Error"),
            );

            await expect(
                authService["createPendingUser"](
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Create Token Error");
        });
    });

    describe("sendVerificationEmail", () => {
        const user = {
            id: "user-id",
            email: "dat@gmail.com",
            fullName: "Dat Nguyen",
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should resend verification email successfully", async () => {
            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

            emailVerificationRepository.create.mockResolvedValue(undefined);

            authPublisher.userRegistered.mockResolvedValue(undefined);

            await authService["sendVerificationEmail"](
                user,
                "127.0.0.1",
            );

            expect(transactionService.run)
                .toHaveBeenCalledTimes(1);

            expect(emailVerificationRepository.deleteByUserId)
                .toHaveBeenCalledWith(
                    user.id,
                    expect.any(Object),
                );

            expect(emailVerificationRepository.create)
                .toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({
                        userId: user.id,
                        verifyToken: expect.any(String),
                    }),
                );

            expect(authPublisher.userRegistered)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        verifyToken: expect.any(String),
                        ipAddress: "127.0.0.1",
                    }),
                );
        });

        it("should throw if transaction failed", async () => {
            transactionService.run.mockRejectedValue(
                new Error("Transaction Error"),
            );

            await expect(
                authService["sendVerificationEmail"](user, "127.0.0.1"),
            ).rejects.toThrow("Transaction Error");
        });

        it("should throw if delete verification token failed", async () => {
            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            emailVerificationRepository.deleteByUserId.mockRejectedValue(
                new Error("Delete Token Error"),
            );

            await expect(
                authService["sendVerificationEmail"](user, "127.0.0.1"),
            ).rejects.toThrow("Delete Token Error");

            expect(emailVerificationRepository.create)
                .not.toHaveBeenCalled();
        });

        it("should throw if create verification token failed", async () => {
            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

            emailVerificationRepository.create.mockRejectedValue(
                new Error("Create Token Error"),
            );

            await expect(
                authService["sendVerificationEmail"](user, "127.0.0.1"),
            ).rejects.toThrow("Create Token Error");
        });

        it("should throw if publisher failed", async () => {
            transactionService.run.mockImplementation(async (callback: any) => {
                return callback({});
            });

            emailVerificationRepository.deleteByUserId.mockResolvedValue(undefined);

            emailVerificationRepository.create.mockResolvedValue(undefined);

            authPublisher.userRegistered.mockRejectedValue(
                new Error("RabbitMQ Error"),
            );

            await expect(
                authService["sendVerificationEmail"](
                    user,
                    "127.0.0.1",
                ),
            ).rejects.toThrow("RabbitMQ Error");

            expect(authPublisher.userRegistered)
                .toHaveBeenCalledTimes(1);
        });
    });
});
