import { describe, it, expect, beforeEach, vi } from "vitest";

import { OAuthService } from "../../../src/modules/auth/service/oauth.service";
import { UserRole } from "@prisma/client";
import { LANGUAGE } from "../../../src/common/constants/index.ts";
import { oauthConfig } from "../../../src/config/oauth.config.ts";

describe("OAuthService", () => {
    let oauthService: OAuthService;
    let googleProvider: any;
    let oauthRepository: any;
    let userRepository: any;
    let authService: any;
    let transactionService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        googleProvider = {
            exchangeCode: vi.fn(),
            getUserInfo: vi.fn(),
        };
        oauthRepository = {
            findByProviderAndAccountId: vi.fn(),
            findByProvider: vi.fn(),
            create: vi.fn(),
        };
        userRepository = {
            findByEmail: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
            createOAuthUser: vi.fn(),
        };
        authService = {
            completeLogin: vi.fn(),
        };
        transactionService = {
            run: vi.fn(),
        };

        oauthService = new OAuthService(
            googleProvider,
            oauthRepository,
            userRepository,
            authService,
            transactionService
        );
    });

    describe("loginWithGoogle", () => {

        const profile = {
            provider: "google",
            providerId: "google-123",
            email: "dat@gmail.com",
            fullName: "Dat Nguyen",
            avatarUrl: "avatar.png",
            emailVerified: true,
        };

        const user = {
            id: "user-id",
            email: "dat@gmail.com",
            fullName: "Dat Nguyen",
            avatarUrl: "avatar.png",
            emailVerified: true,
            language: "en",
            role: UserRole.USER,
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should login successfully with existing oauth account", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue({
                userId: user.id,
            });

            userRepository.findById.mockResolvedValue(user);

            authService.completeLogin.mockResolvedValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            const result = await oauthService.loginWithGoogle(
                "google-code",
                {
                    ipAddress: "127.0.0.1",
                    userAgent: "Chrome",
                    rememberMe: true,
                },
            );

            expect(googleProvider.exchangeCode)
                .toHaveBeenCalledWith("google-code");

            expect(googleProvider.getUserInfo)
                .toHaveBeenCalledWith("google-access-token");

            expect(oauthRepository.findByProvider)
                .toHaveBeenCalledWith(
                    "google",
                    "google-123",
                );

            expect(userRepository.findById)
                .toHaveBeenCalledWith(user.id);

            expect(authService.completeLogin)
                .toHaveBeenCalledWith(
                    user,
                    {
                        ipAddress: "127.0.0.1",
                        userAgent: "Chrome",
                        rememberMe: true,
                    },
                );

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

        });

        it("should login successfully with existing email", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue(user);

            oauthRepository.create.mockResolvedValue({});

            authService.completeLogin.mockResolvedValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            const result = await oauthService.loginWithGoogle(
                "google-code",
                {},
            );

            expect(oauthRepository.findByProvider)
                .toHaveBeenCalledWith(
                    "google",
                    "google-123",
                );

            expect(userRepository.findByEmail)
                .toHaveBeenCalledWith(
                    "dat@gmail.com",
                );

            expect(oauthRepository.create)
                .toHaveBeenCalledWith({
                    provider: "google",
                    providerAccountId: "google-123",
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                });

            expect(authService.completeLogin)
                .toHaveBeenCalledWith(
                    user,
                    {},
                );

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

        });

        it("should create new user and login successfully", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue(null);


            transactionService.run.mockImplementation(async (callback: any) => {

                return callback({});

            });

            userRepository.createOAuthUser.mockResolvedValue(user);

            oauthRepository.create.mockResolvedValue({});

            authService.completeLogin.mockResolvedValue({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

            const result = await oauthService.loginWithGoogle(
                "google-code",
                {},
            );

            expect(transactionService.run)
                .toHaveBeenCalled();

            expect(userRepository.createOAuthUser)
                .toHaveBeenCalledWith({
                    email: profile.email,
                    fullName: profile.fullName,
                    avatarUrl: profile.avatarUrl,
                    emailVerified: true,
                    language: LANGUAGE.EN,
                    timezone: "UTC",
                }, expect.any(Object));

            expect(oauthRepository.create)
                .toHaveBeenCalledWith({
                    provider: "google",
                    providerAccountId: "google-123",
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                }, expect.any(Object));

            expect(authService.completeLogin)
                .toHaveBeenCalledWith(
                    user,
                    {},
                );

            expect(result).toEqual({
                accessToken: "access-token",
                refreshToken: "refresh-token",
            });

        });

        it("should throw when exchangeCode failed", async () => {

            googleProvider.exchangeCode.mockRejectedValue(
                new Error("Exchange Code Error"),
            );

            await expect(
                oauthService.loginWithGoogle("google-code"),
            ).rejects.toThrow("Exchange Code Error");

            expect(googleProvider.getUserInfo)
                .not.toHaveBeenCalled();

            expect(authService.completeLogin)
                .not.toHaveBeenCalled();

        });

        it("should throw when getUserInfo failed", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockRejectedValue(
                new Error("Google UserInfo Error"),
            );

            await expect(
                oauthService.loginWithGoogle("google-code", {}),
            ).rejects.toThrow("Google UserInfo Error");

            expect(authService.completeLogin)
                .not.toHaveBeenCalled();

        });

        it("should throw when oauthRepository.create failed for existing email", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue(user);

            oauthRepository.create.mockRejectedValue(
                new Error("Create OAuth Error"),
            );

            await expect(
                oauthService.loginWithGoogle("google-code", {}),
            ).rejects.toThrow("Create OAuth Error");

            expect(authService.completeLogin)
                .not.toHaveBeenCalled();

        });

        it("should throw when transaction failed while creating new user", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue(null);

            userRepository.findByEmail.mockResolvedValue(null);

            transactionService.run.mockRejectedValue(
                new Error("Transaction Error"),
            );

            await expect(
                oauthService.loginWithGoogle("google-code", {}),
            ).rejects.toThrow("Transaction Error");

            expect(authService.completeLogin)
                .not.toHaveBeenCalled();

        });

        it("should throw when completeLogin failed", async () => {

            googleProvider.exchangeCode.mockResolvedValue({
                access_token: "google-access-token",
            });

            googleProvider.getUserInfo.mockResolvedValue(profile);

            oauthRepository.findByProvider.mockResolvedValue({
                userId: user.id,
            });

            userRepository.findById.mockResolvedValue(user);

            authService.completeLogin.mockRejectedValue(
                new Error("Complete Login Error"),
            );

            await expect(
                oauthService.loginWithGoogle(
                    "google-code",
                    {
                        ipAddress: "127.0.0.1",
                        userAgent: "Chrome",
                        rememberMe: true,
                    },
                ),
            ).rejects.toThrow("Complete Login Error");

            expect(authService.completeLogin)
                .toHaveBeenCalledWith(
                    user,
                    {
                        ipAddress: "127.0.0.1",
                        userAgent: "Chrome",
                        rememberMe: true,
                    },
                );

        });

    });

    describe("getGoogleAuthorizationUrl", () => {

        it("should generate google authorization url successfully", () => {

            const result = oauthService.getGoogleAuthorizationUrl();

            expect(result).toHaveProperty("url");
            expect(result).toHaveProperty("state");

            expect(result.state).toBeTypeOf("string");
            expect(result.state.length).toBeGreaterThan(0);

            const url = new URL(result.url);

            expect(url.origin + url.pathname).toBe(
                oauthConfig.google.authorizationUrl,
            );

            expect(url.searchParams.get("client_id"))
                .toBe(oauthConfig.google.clientId);

            expect(url.searchParams.get("redirect_uri"))
                .toBe(oauthConfig.google.redirectUri);

            expect(url.searchParams.get("response_type"))
                .toBe("code");

            expect(url.searchParams.get("scope"))
                .toBe(oauthConfig.google.scopes.join(" "));

            expect(url.searchParams.get("access_type"))
                .toBe("offline");

            expect(url.searchParams.get("prompt"))
                .toBe("consent");

            expect(url.searchParams.get("include_granted_scopes"))
                .toBe("true");

            expect(url.searchParams.get("state"))
                .toBe(result.state);

        });

        it("should generate unique state every time", () => {

            const first = oauthService.getGoogleAuthorizationUrl();

            const second = oauthService.getGoogleAuthorizationUrl();

            expect(first.state).not.toBe(second.state);

            expect(first.url).not.toBe(second.url);

        });

    });
});