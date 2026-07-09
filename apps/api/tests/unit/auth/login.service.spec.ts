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
            emailVerified: true,
            status: UserStatus.ACTIVE,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should login successfully", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

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

            expect(jwtService.generateTokens)
                .toHaveBeenCalledWith({
                    id: activeUser.id,
                    email: activeUser.email,
                    language: "en",
                    role: UserRole.USER,
                });

            expect(jwtService.hashRefreshToken)
                .toHaveBeenCalledWith("refresh-token");

            expect(refreshTokenRepository.create)
                .toHaveBeenCalledWith({
                    userId: activeUser.id,
                    token: expect.objectContaining({
                        tokenHash: "hashed-refresh-token",
                        expiresAt: expect.any(Date),
                        user: {
                            connect: {
                                id: activeUser.id,
                            },
                        },
                    }),
                    ipAddress: undefined,
                    userAgent: undefined,
                });

            expect(userRepository.updateLastLogin)
                .toHaveBeenCalledWith(activeUser.id);

            expect(authPublisher.userLoggedIn)
                .toHaveBeenCalledWith({
                    userId: activeUser.id,
                    email: activeUser.email,
                    fullName: activeUser.fullName,
                    ipAddress: undefined,
                });

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

        it("should throw when user status is unavailable", async () => {
            userRepository.findByEmail.mockResolvedValue({
                ...activeUser,
                status: "UNKNOWN",
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toMatchObject({
                statusCode: 403,
                code: ERROR_CODE.USER_UNAVAILABLE,
            });

            expect(comparePassword).not.toHaveBeenCalled();
        });

        it("should throw INVALID_CREDENTIALS when password is incorrect", async () => {
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

            expect(jwtService.generateTokens).not.toHaveBeenCalled();

            expect(refreshTokenRepository.create).not.toHaveBeenCalled();

            expect(authPublisher.userLoggedIn).not.toHaveBeenCalled();
        });

        it("should throw if jwt generation failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

            jwtService.generateTokens.mockImplementation(() => {
                throw new Error("JWT Error");
            });

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("JWT Error");

            expect(refreshTokenRepository.create).not.toHaveBeenCalled();

            expect(authPublisher.userLoggedIn).not.toHaveBeenCalled();
        });

        it("should throw if hash refresh token failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockRejectedValue(
                new Error("Hash Refresh Error"),
            );

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("Hash Refresh Error");

            expect(refreshTokenRepository.create).not.toHaveBeenCalled();

            expect(authPublisher.userLoggedIn).not.toHaveBeenCalled();
        });

        it("should throw if refresh token repository failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

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
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("Refresh Token Error");

            expect(userRepository.updateLastLogin).not.toHaveBeenCalled();

            expect(authPublisher.userLoggedIn).not.toHaveBeenCalled();
        });

        it("should throw if update last login failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

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
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("Update Last Login Error");

            expect(authPublisher.userLoggedIn).not.toHaveBeenCalled();
        });

        it("should throw if publisher failed", async () => {
            userRepository.findByEmail.mockResolvedValue(activeUser);

            (comparePassword as any).mockResolvedValue(true);

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

            userRepository.updateLastLogin.mockResolvedValue(undefined);

            authPublisher.userLoggedIn.mockRejectedValue(
                new Error("RabbitMQ Error"),
            );

            await expect(
                authService.loginUser(
                    "dat@gmail.com",
                    "Password@123",
                ),
            ).rejects.toThrow("RabbitMQ Error");

            expect(authPublisher.userLoggedIn).toHaveBeenCalledTimes(1);
        });
    });
});