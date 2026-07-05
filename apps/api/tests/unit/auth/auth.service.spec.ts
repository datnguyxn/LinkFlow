import { describe, it, expect, beforeEach, vi } from "vitest";

// =====================
// MOCK MODULES ĐÚNG PATH
// =====================
vi.mock("../../../src/modules/auth/utils/password.util", () => ({
    hashPassword: vi.fn(),
}));

vi.mock("../../../src/modules/auth/repository/auth.repository", () => {
    return {
        AuthRepository: class {
            findUserByEmail = vi.fn();
            createUser = vi.fn();
        }
    };
});

vi.mock("../../../src/modules/auth/service/jwt.service", () => {
    return {
        JwtService: class {
            generateTokens = vi.fn();
        }
    };
});

// =====================
// IMPORT SAU MOCK
// =====================
import { AuthService } from "../../../src/modules/auth/service/auth.service";
import { hashPassword } from "../../../src/modules/auth/utils/password.util";

describe("AuthService", () => {
    let authService: AuthService;
    let authRepository: any;
    let jwtService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        authRepository = {
            findUserByEmail: vi.fn(),
            createUser: vi.fn(),
        };

        jwtService = {
            generateTokens: vi.fn(),
        };

        authService = new AuthService() as any;

        authService.authRepository = authRepository;
        authService.jwtService = jwtService;
    });

    // =====================
    // SUCCESS
    // =====================
    it("should register successfully", async () => {
        authRepository.findUserByEmail.mockResolvedValue(null);
        (hashPassword as any).mockResolvedValue("hashed-password");

        authRepository.createUser.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            language: "en",
        });

        jwtService.generateTokens.mockReturnValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });

        const result = await authService.registerUser(
            "dat@gmail.com",
            "Password@123",
            "Dat Nguyen"
        );

        expect(result).toEqual({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });
    });

    // =====================
    // EMAIL EXISTS
    // =====================
    it("should throw ConflictError when email already exists", async () => {
        authRepository.findUserByEmail.mockResolvedValue({
            id: "1",
            email: "dat@gmail.com",
        });

        await expect(
            authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat"
            )
        ).rejects.toMatchObject({
            code: "USER_ALREADY_EXISTS",
            statusCode: 409,
        });
        expect(authRepository.createUser).not.toHaveBeenCalled();
        expect(jwtService.generateTokens).not.toHaveBeenCalled();
    });

    // =====================
    // HASH FAIL
    // =====================
    it("should throw if hash password failed", async () => {
        authRepository.findUserByEmail.mockResolvedValue(null);

        (hashPassword as any).mockRejectedValue(new Error("Hash failed"));

        await expect(
            authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat"
            )
        ).rejects.toThrow("Hash failed");
    });

    // =====================
    // REPO FAIL
    // =====================
    it("should throw if repository failed", async () => {
        authRepository.findUserByEmail.mockResolvedValue(null);
        (hashPassword as any).mockResolvedValue("hashed-password");

        authRepository.createUser.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat"
            )
        ).rejects.toThrow("Database Error");
    });

    // =====================
    // JWT FAIL
    // =====================
    it("should throw if jwt generation failed", async () => {
        authRepository.findUserByEmail.mockResolvedValue(null);
        (hashPassword as any).mockResolvedValue("hashed-password");

        authRepository.createUser.mockResolvedValue({
            id: "user-id",
            email: "dat@gmail.com",
            language: "en",
        });

        jwtService.generateTokens.mockImplementation(() => {
            throw new Error("JWT Error");
        });

        await expect(
            authService.registerUser(
                "dat@gmail.com",
                "Password@123",
                "Dat"
            )
        ).rejects.toThrow("JWT Error");
    });
});