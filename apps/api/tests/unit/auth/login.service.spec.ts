import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../../src/utils/password.util", () => ({
    hashPassword: vi.fn(),
    comparePassword: vi.fn(),
}));

import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { comparePassword } from "../../../src/utils/password.util";
import { UserRole, UserStatus } from "@prisma/client"
import { ERROR_CODE } from "../../../src/common/constants";

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
            updateLastLogin: vi.fn(),
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
            userLoggedIn: vi.fn(),
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

    describe("loginUser", () => {
        const activeUser = {
            id: "user-id",
            email: "dat@gmail.com",
            passwordHash: "hashed-password",
            fullName: "Dat Nguyen",
            language: "en",
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            emailVerified: true,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should login successfully", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

            vi.spyOn(authService, "completeLogin").mockResolvedValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            const result = await authService.loginUser(
                "dat@gmail.com",
                "Password@123",
            );

            expect(userRepository.findByEmail)
                .toHaveBeenCalledWith("dat@gmail.com");

            expect(comparePassword)
                .toHaveBeenCalledWith(
                    "Password@123",
                    "hashed-password",
                );

            expect(authService.completeLogin)
                .toHaveBeenCalledWith(
                    activeUser,
                    undefined,
                    undefined,
                );

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });
        });

        it("should throw INVALID_CREDENTIALS when user does not exist", async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 401,
                code: ERROR_CODE.INVALID_CREDENTIALS,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw when email is not verified", async () => {
            userRepository.findByEmail.mockResolvedValue({
                ...activeUser,
                emailVerified: false,
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 401,
                code: ERROR_CODE.INVALID_CREDENTIALS,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw when user is inactive", async () => {
            userRepository.findByEmail.mockResolvedValue({
                ...activeUser,
                status: UserStatus.INACTIVE,
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: ERROR_CODE.USER_INACTIVE,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw when user is suspended", async () => {
            userRepository.findByEmail.mockResolvedValue({
                ...activeUser,
                status: UserStatus.SUSPENDED,
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: ERROR_CODE.USER_SUSPENDED,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw when user is deleted", async () => {
            userRepository.findByEmail.mockResolvedValue({
                ...activeUser,
                status: UserStatus.DELETED,
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: ERROR_CODE.USER_DELETED,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw INVALID_CREDENTIALS when password is incorrect", async () => {
            const completeLoginSpy = vi.spyOn(authService, "completeLogin");

            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(false);

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "WrongPassword",
                ),
            ).rejects.toMatchObject({
                statusCode: 401,
                code: ERROR_CODE.INVALID_CREDENTIALS,
            });

            expect(completeLoginSpy).not.toHaveBeenCalled();
        });

        it("should throw if completeLogin failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

            vi.spyOn(authService, "completeLogin")
                .mockRejectedValue(new Error("Complete Login Error"));

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("Complete Login Error");
        });
    });

    describe("completeLogin", () => {
        const user = {
            id: "user-id",
            email: "dat@gmail.com",
            fullName: "Dat Nguyen",
            language: "en",
            role: UserRole.USER,
        } as any;

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should complete login successfully", async () => {
            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            userRepository.updateLastLogin.mockResolvedValue(undefined);

            authPublisher.userLoggedIn.mockResolvedValue(undefined);

            const result = await authService.completeLogin(
                user,
                "127.0.0.1",
                "Chrome",
            );

            expect(jwtService.generateTokens).toHaveBeenCalledWith({
                id: user.id,
                email: user.email,
                language: "en",
                role: UserRole.USER,
            });

            expect(jwtService.hashRefreshToken)
                .toHaveBeenCalledWith("refresh-token");

            expect(refreshTokenRepository.create)
                .toHaveBeenCalledWith({
                    userId: user.id,
                    token: expect.objectContaining({
                        tokenHash: "hashed-refresh-token",
                        expiresAt: expect.any(Date),
                        user: {
                            connect: {
                                id: user.id,
                            },
                        },
                    }),
                    ipAddress: "127.0.0.1",
                    userAgent: "Chrome",
                });

            expect(userRepository.updateLastLogin)
                .toHaveBeenCalledWith(user.id);

            expect(authPublisher.userLoggedIn)
                .toHaveBeenCalledWith({
                    userId: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    ipAddress: "127.0.0.1",
                });

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });
        });

        it("should throw if jwt generation failed", async () => {
            jwtService.generateTokens.mockImplementation(() => {
                throw new Error("JWT Error");
            });

            await expect(
                authService.completeLogin(user),
            ).rejects.toThrow("JWT Error");

            expect(refreshTokenRepository.create)
                .not.toHaveBeenCalled();
        });

        it("should throw if hash refresh token failed", async () => {
            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockRejectedValue(
                new Error("Hash Refresh Error"),
            );

            await expect(
                authService.completeLogin(user),
            ).rejects.toThrow("Hash Refresh Error");

            expect(refreshTokenRepository.create)
                .not.toHaveBeenCalled();
        });

        it("should throw if refresh token repository failed", async () => {
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
                authService.completeLogin(user),
            ).rejects.toThrow("Refresh Token Error");

            expect(userRepository.updateLastLogin)
                .not.toHaveBeenCalled();
        });

        it("should throw if update last login failed", async () => {
            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            userRepository.updateLastLogin.mockRejectedValue(
                new Error("Update Last Login Error"),
            );

            await expect(
                authService.completeLogin(user),
            ).rejects.toThrow("Update Last Login Error");

            expect(authPublisher.userLoggedIn)
                .not.toHaveBeenCalled();
        });

        it("should throw if publisher failed", async () => {
            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            userRepository.updateLastLogin.mockResolvedValue(
                undefined,
            );

            authPublisher.userLoggedIn.mockRejectedValue(
                new Error("RabbitMQ Error"),
            );

            await expect(
                authService.completeLogin(user),
            ).rejects.toThrow("RabbitMQ Error");
        });
    });
});