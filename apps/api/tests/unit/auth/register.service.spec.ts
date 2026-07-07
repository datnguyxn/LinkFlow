import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../../src/modules/auth/utils/password.util", () => ({
    hashPassword: vi.fn(),
}));

import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { hashPassword } from "../../../src/modules/auth/utils/password.util";
import { ROLE } from "../../../src/common/constants/role.constant";

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

        it("should register successfully", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue("hashed-password");

            transactionService.run.mockImplementation(async (callback: any) => {

                const tx = {};

                userRepository.createUser.mockResolvedValue({
                    id: "user-id",
                    email: "dat@gmail.com",
                    fullName: "Dat Nguyen",
                    language: "en",
                    timezone: "UTC",
                });

                workspaceRepository.create.mockResolvedValue({
                    id: "workspace-id",
                });

                emailVerificationRepository.create.mockResolvedValue({
                    id: "email-verification-id",
                });

                return callback(tx);

            });

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            authPublisher.userRegistered.mockResolvedValue(undefined);

            const result = await authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat Nguyen",
            );

            expect(userRepository.findByEmail)
                .toHaveBeenCalledWith("dat@gmail.com");

            expect(hashPassword)
                .toHaveBeenCalledWith("Password@123");

            expect(userRepository.createUser)
                .toHaveBeenCalledWith({
                    email: "dat@gmail.com",
                    passwordHash: "hashed-password",
                    fullName: "Dat Nguyen",
                    language: "en",
                    timezone: "UTC",
                });

            expect(workspaceRepository.create)
                .toHaveBeenCalledWith(
                    expect.anything(),
                    {
                        name: "Dat Nguyen",
                        ownerId: "user-id",
                    },
                );

            expect(jwtService.generateTokens)
                .toHaveBeenCalledWith({
                    id: "user-id",
                    email: "dat@gmail.com",
                    role: ROLE.OWNER,
                    language: "en",
                });

            expect(jwtService.hashRefreshToken)
                .toHaveBeenCalledWith("refresh-token");

            expect(refreshTokenRepository.create)
                .toHaveBeenCalled();

            expect(authPublisher.userRegistered)
                .toHaveBeenCalled();

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

        });

        it("should throw USER_ALREADY_EXISTS", async () => {

            userRepository.findByEmail.mockResolvedValue({
                id: "1",
                email: "dat@gmail.com",
            });

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toMatchObject({
                statusCode: 409,
                code: "USER_ALREADY_EXISTS",
            });

            expect(hashPassword).not.toHaveBeenCalled();
            expect(transactionService.run).not.toHaveBeenCalled();
            expect(jwtService.generateTokens).not.toHaveBeenCalled();
        });

        it("should throw if hash password failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockRejectedValue(
                new Error("Hash failed"),
            );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Hash failed");

            expect(transactionService.run).not.toHaveBeenCalled();
        });

        it("should throw if transaction failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockRejectedValue(
                new Error("Database Error"),
            );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Database Error");

        });

        it("should throw if jwt generation failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {

                userRepository.createUser.mockResolvedValue({
                    id: "user-id",
                    email: "dat@gmail.com",
                    fullName: "Dat",
                    language: "en",
                    timezone: "UTC",
                });

                workspaceRepository.create.mockResolvedValue({
                    id: "workspace-id",
                });

                emailVerificationRepository.create.mockResolvedValue({
                    id: "email-verification-id",
                });

                return callback({});

            });

            jwtService.generateTokens.mockImplementation(() => {
                throw new Error("JWT Error");
            });

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("JWT Error");

        });

        it("should throw if hash refresh token failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {

                userRepository.createUser.mockResolvedValue({
                    id: "user-id",
                    email: "dat@gmail.com",
                    fullName: "Dat",
                    language: "en",
                    timezone: "UTC",
                });

                workspaceRepository.create.mockResolvedValue({
                    id: "workspace-id",
                });

                emailVerificationRepository.create.mockResolvedValue({
                    id: "email-verification-id",
                });

                return callback({});

            });

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockRejectedValue(
                new Error("Hash Refresh Error"),
            );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Hash Refresh Error");

        });

        it("should throw if refresh token repository failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {

                userRepository.createUser.mockResolvedValue({
                    id: "user-id",
                    email: "dat@gmail.com",
                    fullName: "Dat",
                    language: "en",
                    timezone: "UTC",
                });

                workspaceRepository.create.mockResolvedValue({
                    id: "workspace-id",
                });

                emailVerificationRepository.create.mockResolvedValue({
                    id: "email-verification-id",
                });

                return callback({});

            });

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockRejectedValue(
                new Error("Refresh Token Error"),
            );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("Refresh Token Error");

        });

        it("should throw if publisher failed", async () => {

            userRepository.findByEmail.mockResolvedValue(null);

            (hashPassword as any).mockResolvedValue(
                "hashed-password",
            );

            transactionService.run.mockImplementation(async (callback: any) => {

                userRepository.createUser.mockResolvedValue({
                    id: "user-id",
                    email: "dat@gmail.com",
                    fullName: "Dat",
                    language: "en",
                    timezone: "UTC",
                });

                workspaceRepository.create.mockResolvedValue({
                    id: "workspace-id",
                });

                emailVerificationRepository.create.mockResolvedValue({
                    id: "email-verification-id",
                });

                return callback({});

            });

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            authPublisher.userRegistered.mockRejectedValue(
                new Error("RabbitMQ Error"),
            );

            await expect(
                authService.registerUser(
                    "dat@gmail.com",
                    "Password@123",
                    "Dat",
                ),
            ).rejects.toThrow("RabbitMQ Error");

        });
    });
});
