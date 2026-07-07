import { describe, it, expect, beforeEach, vi } from "vitest";

import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { UserRole } from "@prisma/client";


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
            findById: vi.fn(),
        };

        workspaceRepository = {
            create: vi.fn(),
        };

        refreshTokenRepository = {
            create: vi.fn(),
            revoke: vi.fn(),
            findByTokenHash: vi.fn(),
        };

        jwtService = {
            generateTokens: vi.fn(),
            hashRefreshToken: vi.fn(),
            verifyRefreshToken: vi.fn(),
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

    describe("refreshToken", () => {
        it("should refresh tokens successfully", async () => {
            const refreshToken = "valid-refresh-token";
            const ipAddress = "127.0.0.1";
            const userAgent = "Chrome";

            const payload = {
                id: "user-id",
            };

            const storedRefreshToken = {
                id: "refresh-id",
                userId: "user-id",
                tokenHash: "old-token-hash",
                revoked: false,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            };

            const mockUser = {
                id: "user-id",
                email: "dat@gmail.com",
                passwordHash: "hashed-password",
                language: "en",
                timezone: "UTC",
                role: UserRole.USER,
            };

            const generatedTokens = {
                accessToken: "new-access-token",
                refreshToken: "new-refresh-token",
            };

            jwtService.verifyRefreshToken = vi.fn().mockReturnValue(payload);

            jwtService.hashRefreshToken = vi
                .fn()
                .mockResolvedValueOnce("old-token-hash")
                .mockResolvedValueOnce("new-token-hash");

            refreshTokenRepository.findByTokenHash = vi
                .fn()
                .mockResolvedValue(storedRefreshToken);

            userRepository.findById = vi
                .fn()
                .mockResolvedValue(mockUser);

            jwtService.generateTokens = vi
                .fn()
                .mockReturnValue(generatedTokens);

            transactionService.run = vi
                .fn()
                .mockImplementation(async (callback) => callback());

            refreshTokenRepository.create = vi.fn();

            refreshTokenRepository.revoke = vi.fn();

            const result = await authService.refresh(
                refreshToken,
                ipAddress,
                userAgent,
            );

            expect(jwtService.verifyRefreshToken).toHaveBeenCalledWith(
                refreshToken,
            );

            expect(jwtService.hashRefreshToken).toHaveBeenNthCalledWith(
                1,
                refreshToken,
            );

            expect(refreshTokenRepository.findByTokenHash)
                .toHaveBeenCalledWith("old-token-hash");

            expect(userRepository.findById)
                .toHaveBeenCalledWith(mockUser.id);

            expect(jwtService.generateTokens)
                .toHaveBeenCalled();

            expect(jwtService.hashRefreshToken)
                .toHaveBeenNthCalledWith(
                    2,
                    generatedTokens.refreshToken,
                );

            expect(refreshTokenRepository.create)
                .toHaveBeenCalled();

            expect(refreshTokenRepository.revoke)
                .toHaveBeenCalledWith(storedRefreshToken.id);

            expect(result).toEqual(generatedTokens);
        });
    });

    it("should throw INVALID_REFRESH_TOKEN when jwt verification failed", async () => {

        jwtService.verifyRefreshToken.mockImplementation(() => {
            throw new Error("Invalid Refresh Token");
        });

        await expect(
            authService.refresh(
                "invalid-token",
                "127.0.0.1",
                "Chrome",
            ),
        ).rejects.toThrow("Invalid Refresh Token");

        expect(refreshTokenRepository.findByTokenHash)
            .not.toHaveBeenCalled();

    });

    it("should throw INVALID_REFRESH_TOKEN when token not found", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken.mockResolvedValue(
            "hashed-token",
        );

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue(null);

        await expect(
            authService.refresh(
                "refresh-token",
                "127.0.0.1",
                "Chrome",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_REFRESH_TOKEN",
        });

    });

    it("should throw when refresh token revoked", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken.mockResolvedValue(
            "hashed-token",
        );

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({

                id: "refresh-id",

                revoked: true,

                expiresAt: new Date(
                    Date.now() + 100000,
                ),

            });

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_REFRESH_TOKEN",
        });

    });

    it("should throw REFRESH_TOKEN_EXPIRED", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken.mockResolvedValue(
            "hashed-token",
        );

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({

                id: "refresh-id",

                revoked: false,

                expiresAt: new Date(
                    Date.now() - 1000,
                ),

            });

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "REFRESH_TOKEN_EXPIRED",
        });

    });

    it("should throw INVALID_REFRESH_TOKEN when user not found", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken.mockResolvedValue(
            "hashed-token",
        );

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({

                id: "refresh-id",

                revoked: false,

                expiresAt: new Date(
                    Date.now() + 100000,
                ),

            });

        userRepository.findById.mockResolvedValue(null);

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_REFRESH_TOKEN",
        });

    });

    it("should throw if generate tokens failed", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken
            .mockResolvedValueOnce("old-hash");

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({

                id: "refresh-id",

                revoked: false,

                expiresAt: new Date(
                    Date.now() + 100000,
                ),

            });

        userRepository.findById.mockResolvedValue({

            id: "user-id",

            email: "dat@gmail.com",

            language: "en",

            role: UserRole.USER,

        });

        jwtService.generateTokens.mockImplementation(() => {
            throw new Error("JWT Error");
        });

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toThrow("JWT Error");

    });

    it("should throw if hash refresh token failed", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken
            .mockResolvedValueOnce("old-hash")
            .mockRejectedValueOnce(
                new Error("Hash Error"),
            );

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({

                id: "refresh-id",

                revoked: false,

                expiresAt: new Date(
                    Date.now() + 100000,
                ),

            });

        userRepository.findById.mockResolvedValue({

            id: "user-id",

            email: "dat@gmail.com",

            language: "en",

            role: UserRole.USER,

        });

        jwtService.generateTokens.mockReturnValue({

            accessToken: "access",

            refreshToken: "refresh",

        });

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toThrow("Hash Error");

    });

    it("should throw if revoke refresh token failed", async () => {

        jwtService.verifyRefreshToken.mockReturnValue({
            id: "user-id",
        });

        jwtService.hashRefreshToken
            .mockResolvedValueOnce("old-hash")
            .mockResolvedValueOnce("new-hash");

        refreshTokenRepository.findByTokenHash
            .mockResolvedValue({
                id: "refresh-id",
                revoked: false,
                expiresAt: new Date(Date.now() + 100000),
            });

        userRepository.findById.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            language: "en",
            role: UserRole.USER,
        });

        jwtService.generateTokens.mockReturnValue({
            accessToken: "access",
            refreshToken: "refresh",
        });

        refreshTokenRepository.create.mockResolvedValue({});

        refreshTokenRepository.revoke.mockRejectedValue(
            new Error("Revoke Error"),
        );

        transactionService.run.mockImplementation(
            async (callback: any) => callback({}),
        );

        await expect(
            authService.refresh(
                "refresh-token",
                "",
                "",
            ),
        ).rejects.toThrow("Revoke Error");

        expect(refreshTokenRepository.create)
            .toHaveBeenCalled();

        expect(refreshTokenRepository.revoke)
            .toHaveBeenCalledWith(
                "refresh-id"
            );

    });
}); 