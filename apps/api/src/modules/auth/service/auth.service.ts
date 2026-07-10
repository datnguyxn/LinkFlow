import { UserRepository } from './../../users/index.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';
import { RefreshTokenRepository } from '../../refresh-token/index.ts';
import { EmailVerificationRepository } from '../../email-verification/index.ts';

import type { AuthResponse } from '../types/auth.type.ts';
import { hashPassword, comparePassword } from '../../../utils/password.util.ts';
import { JwtService } from './jwt.service.ts';
import { ERROR_CODE, LANGUAGE } from '../../../common/constants/index.ts';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../../common/errors/index.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { config } from '../../../config/env/index.ts';
import type { UserRegisteredEvent, UserLoginEvent, UserLogoutEvent } from '../../../events/auth/index.ts';
import { randomUUID } from 'crypto';
import { AuthPublisher } from '../../../publishers/auth/auth.publisher.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { UserStatus, type User } from '@prisma/client';
import type { LoginOptions } from '../types/login-option.type.ts';

/**
 * AuthService handles business logic related to authentication.
 * - It interacts with repositories for data access and utilities for token generation.
 * - Keeps controller layer clean by encapsulating complex logic.
 */
export class AuthService {
    constructor(
        private userRepository = new UserRepository(),
        private workspaceRepository = new WorkspaceRepository(),
        private refreshTokenRepository = new RefreshTokenRepository(),
        private jwtService = new JwtService(),
        private transactionService = new TransactionService(),
        private emailVerificationRepository = new EmailVerificationRepository(),
        private authPublisher = new AuthPublisher(new Publisher()),
    ) { }

    /**
     * Register a new user
     * - Checks for duplicate email
     * - Hashes password
     * - Creates user and default workspace in a transaction
     * - Generates JWT tokens
     * - Publishes user registered event to RabbitMQ
     * 
     * @param email - User's email
     * @param password - User's password
     * @param fullName - User's full name
     * @param ipAddress - Optional IP address of the request
     * @param userAgent - Optional user agent of the request
     * @returns AuthResponse containing access and refresh tokens
     * @throws ConflictError if the email is already registered
     */
    async registerUser(
        email: string,
        password: string,
        fullName: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<AuthResponse | null> {

        console.log("Registering user:", { email, fullName }); // Debug log

        // Check duplicate email
        const existingUser = await this.userRepository.findByEmail(email);

        console.log("Existing user check:", existingUser); // Debug log

        if (existingUser) {
            throw new ConflictError("User already exists", "USER_ALREADY_EXISTS");
        }

        // Hash raw password before saving to DB
        const hashedPassword = await hashPassword(password);

        // Create user with default role and workspace inside a transaction
        const result = await this.transactionService.run(async (tx) => {

            // 1. Create user
            const newUser = await this.userRepository.createUser({
                email,
                passwordHash: hashedPassword,
                fullName,
                language: LANGUAGE.EN, // default language,
                timezone: 'UTC', // default timezone
            });

            // 2. Create default workspace for the new user
            const workspace = await this.workspaceRepository.create(tx, {
                name: fullName,
                ownerId: newUser.id,
            });

            // 3. Generate a verification token for email confirmation
            const verifyToken = randomUUID(); // Generate a unique verification token
            await this.emailVerificationRepository.create(tx, {
                userId: newUser.id,
                verifyToken: verifyToken
            });

            return { newUser, workspace, verifyToken };
        });

        // Generate JWT tokens for authentication
        const tokens = this.jwtService.generateTokens({
            id: result.newUser.id,
            email: result.newUser.email,
            role: result.newUser.role || 'USER', // default role
            language: result.newUser.language || LANGUAGE.EN, // default language
        });

        // Save refresh token
        await this.refreshTokenRepository.create({
            userId: result.newUser.id,
            token: {
                tokenHash: await this.jwtService.hashRefreshToken(tokens.refreshToken),
                expiresAt: new Date(Date.now() + parseInt(config.JWT_REFRESH_EXPIRES_MS.toString() || '604800000')), // default 7 days
                user: {
                    connect: {
                        id: result.newUser.id,
                    },
                },
            },
            ipAddress: ipAddress,
            userAgent: userAgent,
        });


        // Publish user registered event to RabbitMQ
        const event: UserRegisteredEvent = {
            userId: result.newUser.id,
            email: result.newUser.email,
            fullName: result.newUser.fullName || "",
            verifyToken: result.verifyToken, // Using the generated verification token
            ipAddress: ipAddress, // You can set this if you have access to the request IP
        };

        await this.authPublisher.userRegistered(event);

        // Return tokens to the controller for response 
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    /**
     * Get user information by email
     * Used for authentication / profile lookup
     * 
     * @param email - User's email
     * @returns User object or null if not found
     */
    async getCurrentUserByEmail(email: string) {
        return await this.userRepository.findByEmail(email);
    }

    /**
     * Login user with email and password
     * - Validate credentials
     * - Generate access & refresh tokens
     * - Save refresh token in DB
     * - Publish user login event to RabbitMQ
     * @param email - User's email
     * @param password - User's password
     * @param ipAddress - Optional IP address of the request
     * @param userAgent - Optional user agent of the request
     * @returns AuthResponse containing access and refresh tokens or null if login fails
     * @throws UnauthorizedError if credentials are invalid
     * @throws ConflictError if the user is not found
     * @throws Error for any unexpected issues during login
     */
    async loginUser(
        email: string,
        password: string,
        options: LoginOptions
    ): Promise<AuthResponse> {
        // Find user by email
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedError("request.validationFailed", ERROR_CODE.INVALID_CREDENTIALS);
        } else if (!user.emailVerified) {
            throw new UnauthorizedError("auth.login.emailNotVerified", ERROR_CODE.INVALID_CREDENTIALS);
        }

        this.checkUserStatus(user);


        // Validate password
        const isPasswordValid = await comparePassword(password, user.passwordHash || "");
        if (!isPasswordValid) {
            throw new UnauthorizedError("request.validationFailed", ERROR_CODE.INVALID_CREDENTIALS);
        }

        // Complete login process
        return await this.completeLogin(user, options);
    }

    /**
     * Refresh access and refresh tokens using a valid refresh token
     * - Verify the provided refresh token
     * - Check if the token is revoked or expired
     * - Generate new access and refresh tokens
     * - Save the new refresh token and revoke the old one
     * - Publish user logout event for the old token (optional)
     * 
     * @param refreshToken 
     * @param ipAddress 
     * @param userAgent 
     * @returns 
     */
    async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {

        // Verify JWT
        const payload =
            this.jwtService.verifyRefreshToken(refreshToken);

        // Hash token
        const tokenHash =
            await this.jwtService.hashRefreshToken(refreshToken);

        // Find refresh token
        const storedToken =
            await this.refreshTokenRepository.findByTokenHash(
                tokenHash,
            );

        if (!storedToken) {
            throw new UnauthorizedError(
                "auth.middleware.INVALID_REFRESH_TOKEN",
                ERROR_CODE.INVALID_REFRESH_TOKEN,
            );
        }

        // Check revoked
        if (storedToken.revoked) {
            throw new UnauthorizedError(
                "auth.middleware.INVALID_REFRESH_TOKEN",
                ERROR_CODE.INVALID_REFRESH_TOKEN,
            );
        }

        // Check expired
        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedError(
                "auth.middleware.REFRESH_TOKEN_EXPIRED",
                ERROR_CODE.REFRESH_TOKEN_EXPIRED,
            );
        }

        // Find user
        const user =
            await this.userRepository.findById(payload.id);

        if (!user) {
            throw new UnauthorizedError(
                "auth.middleware.INVALID_REFRESH_TOKEN",
                ERROR_CODE.INVALID_REFRESH_TOKEN,
            );
        }

        // Generate new tokens
        const tokens =
            this.jwtService.generateTokens({
                id: user.id,
                email: user.email,
                language: user.language || LANGUAGE.EN, // default language
                role: user.role || 'USER', // default role  
            });

        // Hash new refresh token
        const newRefreshTokenHash =
            await this.jwtService.hashRefreshToken(
                tokens.refreshToken,
            );

        // Save new refresh token
        await this.refreshTokenRepository.create({
            userId: user.id,
            token: {
                tokenHash: newRefreshTokenHash,
                expiresAt: new Date(Date.now() + parseInt(config.JWT_REFRESH_EXPIRES_MS.toString() || '604800000')), // default 7 days
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
            ipAddress: ipAddress,
            userAgent: userAgent,
        });

        // Revoke old token
        await this.refreshTokenRepository.revoke(
            storedToken.id,
        );

        return tokens;

    }

    /**
     * Logout user by revoking the refresh token
     * - Hash the provided refresh token
     * - Find the token in the database
     * - Revoke the token to prevent further use
     * - Publish user logout event to RabbitMQ (optional)
     * 
     * @param refreshToken - The refresh token to revoke
     * @param ipAddress - Optional IP address of the request
     * @returns void
     * @throws UnauthorizedError if the token is invalid or not found
     * @throws Error for any unexpected issues during logout
     */
    async logout(refreshToken: string, ipAddress: string): Promise<void> {
        // Hash token
        const tokenHash =
            await this.jwtService.hashRefreshToken(refreshToken);

        // Find refresh token
        const storedToken =
            await this.refreshTokenRepository.findByTokenHash(
                tokenHash,
            );

        if (!storedToken) {
            throw new UnauthorizedError(
                "auth.middleware.INVALID_REFRESH_TOKEN",
                ERROR_CODE.INVALID_REFRESH_TOKEN,
            );
        }

        // Revoke the refresh token
        await this.refreshTokenRepository.revoke(
            storedToken.id,
        );

        // Create a user logout event to publish to RabbitMQ
        const event: UserLogoutEvent = {
            userId: storedToken.userId,
            ipAddress: ipAddress,
        };

        // Publish the logout event to notify other services or components
        await this.authPublisher.userLoggedOut(event);

    }

    private checkUserStatus(user: { status: UserStatus }) {
        // Check user status
        switch (user.status) {
            case UserStatus.ACTIVE:
                // Continue login flow
                return;

            case UserStatus.INACTIVE:
                throw new ForbiddenError(
                    "auth.login.userInactive",
                    ERROR_CODE.USER_INACTIVE,
                );

            case UserStatus.SUSPENDED:
                throw new ForbiddenError(
                    "auth.login.userSuspended",
                    ERROR_CODE.USER_SUSPENDED,
                );

            case UserStatus.DELETED:
                throw new ForbiddenError(
                    "auth.login.userDeleted",
                    ERROR_CODE.USER_DELETED,
                );

            default:
                throw new ForbiddenError(
                    "auth.login.userUnavailable",
                    ERROR_CODE.USER_UNAVAILABLE,
                );
        }
    }

    /**
     * Complete the login process for a user
     * - Generate access and refresh tokens
     * - Save the refresh token in the database
     * - Update the user's last login timestamp
     * - Publish a user login event to RabbitMQ
     * @param user - The user object for whom the login is being completed
     * @param ipAddress - Optional IP address of the request
     * @param userAgent - Optional user agent of the request
     * @returns A promise that resolves to an AuthResponse containing access and refresh tokens
     */
    async completeLogin(
        user: User,
        options: LoginOptions): Promise<AuthResponse> {
        // Generate access token
        const accessToken = await this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            language: user.language || LANGUAGE.EN, // default language
        });

        // Generate refresh token
        const refreshExpiresIn = options.rememberMe
            ? config.JWT_REFRESH_REMEMBER_EXPIRES_MS
            : config.JWT_REFRESH_EXPIRES_MS;

        const refreshToken = this.jwtService.generateRefreshToken(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                language: user.language || LANGUAGE.EN, // default language
            },
            refreshExpiresIn,
        );
        // Save refresh token
        await this.refreshTokenRepository.create({
            userId: user.id,
            token: {
                tokenHash: await this.jwtService.hashRefreshToken(refreshToken),
                expiresAt: new Date(Date.now() + parseInt(config.JWT_REFRESH_EXPIRES_MS.toString() || '86400000')), // default 1 day
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            },
            ipAddress: options.ipAddress,
            userAgent: options.userAgent,
            rememberMe: options.rememberMe
        });

        // Update last login timestamp
        await this.userRepository.updateLastLogin(user.id);

        // Publish user login event to RabbitMQ
        const event: UserLoginEvent = {
            userId: user.id,
            email: user.email,
            fullName: user.fullName || "",
            ipAddress: options.ipAddress, // You can set this if you have access to the request IP
        };

        await this.authPublisher.userLoggedIn(event);

        // Return tokens to the controller for response
        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    /**
     * Exchange a valid refresh token for a new access token
     * - Verify the provided refresh token
     * - Check if the token is revoked or expired
     * - Generate a new access token
     * @param refreshToken - The refresh token to exchange
     * @returns An object containing the new access token and user information
     * @throws UnauthorizedError if the refresh token is invalid or the user is not found
     */
    async exchange(refreshToken: string) {

        // Verify the refresh token and get the payload
        const payload =
            await this.jwtService.verifyRefreshToken(refreshToken);

        // Hash the refresh token to find it in the database
        const user =
            await this.userRepository.findById(payload.id);

        // Check if user exists
        if (!user) {
            throw new UnauthorizedError(
                "auth.middleware.INVALID_REFRESH_TOKEN",
                ERROR_CODE.INVALID_REFRESH_TOKEN,
            );
        }

        // Check user status
        const accessToken =
            this.jwtService.generateAccessToken({
                id: user.id,
                email: user.email,
                role: user.role,
                language: user.language || LANGUAGE.EN, // default language
            });

        // Return the new access token and user information
        return {
            accessToken,
            user,
        };
    }
}