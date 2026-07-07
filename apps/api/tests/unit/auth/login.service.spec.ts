import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../../src/modules/auth/utils/password.util", () => ({
    hashPassword: vi.fn(),
    comparePassword: vi.fn(),
}));

import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { comparePassword } from "../../../src/modules/auth/utils/password.util";
import { UserRole } from "@prisma/client"

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

        it("should login successfully", async () => {

            userRepository.findByEmail.mockResolvedValue({
                id: "user-id",
                email: "dat@gmail.com",
                passwordHash: "hashed-password",
                fullName: "Dat Nguyen",
                language: "en",
                role: UserRole.USER
            });

            (comparePassword as any).mockResolvedValue(true);

            jwtService.generateTokens.mockReturnValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            jwtService.hashRefreshToken.mockResolvedValue(
                "hashed-refresh-token",
            );

            refreshTokenRepository.create.mockResolvedValue({});

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
                .toHaveBeenCalled();

            expect(jwtService.hashRefreshToken)
                .toHaveBeenCalledWith("refresh-token");

            expect(refreshTokenRepository.create)
                .toHaveBeenCalled();

            expect(authPublisher.userLoggedIn)
                .toHaveBeenCalled();

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

        });
    });

    it("should throw USER_NOT_FOUND", async () => {

        userRepository.findByEmail.mockResolvedValue(null);

        await expect(
            authService.loginUser(
                "dat@gmail.com",
                "Password@123",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
        });

        expect(comparePassword)
            .not.toHaveBeenCalled();

    });

    it("should throw INVALID_CREDENTIALS", async () => {

        userRepository.findByEmail.mockResolvedValue({
            passwordHash: "hashed-password",
        });

        (comparePassword as any).mockResolvedValue(false);

        await expect(
            authService.loginUser(
                "dat@gmail.com",
                "WrongPassword",
            ),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_CREDENTIALS",
        });

    });

    it("should throw if jwt generation failed", async () => {

        userRepository.findByEmail.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            passwordHash: "hashed-password",
            language: "en",
            role: UserRole.USER,
        });

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

    });

    it("should throw if hash refresh token failed", async () => {

        userRepository.findByEmail.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            passwordHash: "hashed-password",
            language: "en",
            role: UserRole.USER,
        });

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

    });   
    
    it("should throw if refresh token repository failed", async () => {

        userRepository.findByEmail.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            passwordHash: "hashed-password",
            language: "en"
        });

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

    });

    it("should throw if publisher failed", async () => {

        userRepository.findByEmail.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            passwordHash: "hashed-password",
            language: "en",
            role: UserRole.USER,
        });

        (comparePassword as any).mockResolvedValue(true);

        jwtService.generateTokens.mockReturnValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });

        jwtService.hashRefreshToken.mockResolvedValue(
            "hashed-refresh-token",
        );

        refreshTokenRepository.create.mockResolvedValue({});

        authPublisher.userLoggedIn.mockRejectedValue(
            new Error("RabbitMQ Error"),
        );

        await expect(
            authService.loginUser(
                "dat@gmail.com",
                "Password@123",
            ),
        ).rejects.toThrow("RabbitMQ Error");

    });
});
