import { UserRepository } from './../../users/index.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';
import { RefreshTokenRepository } from '../../refresh-token/index.ts';
import { EmailVerificationRepository } from '../../email-verification/index.ts';

import type { AuthResponse } from '../types/auth.type.ts';
import { hashPassword, comparePassword } from '../utils/password.util.ts';
import { JwtService } from './jwt.service.ts';
import { ROLE } from '../../../common/constants/index.ts';
import { ConflictError, UnauthorizedError } from '../../../common/errors/index.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { config } from '../../../config/env/index.ts';
import type { UserRegisteredEvent } from '../../../events/auth/user-registered.event.ts';
import type { UserLoginEvent } from '../../../events/auth/user-login.event.ts';
import { randomUUID } from 'crypto';
import { AuthPublisher } from '../publishers/auth.publisher.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';

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
     * - Check if user already exists
     * - Hash password
     * - Assign default role
     * - Create user
     * - Generate access & refresh tokens
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
                language: 'en', // default language,
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
            role: ROLE.OWNER,
            language: result.newUser.language || 'en', // default language
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
     */
    async getCurrentUserByEmail(email: string) {
        return await this.userRepository.findByEmail(email);
    }

    /**
     * Login user with email and password
     * - Validate credentials
     * - Generate access & refresh tokens
     */
    async loginUser(
        email: string,
        password: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<AuthResponse | null> {
        // Find user by email
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UnauthorizedError("request.validationFailed", "INVALID_CREDENTIALS");
        }

        // Validate password
        const isPasswordValid = await comparePassword(password, user.passwordHash || "");
        if (!isPasswordValid) {
            throw new UnauthorizedError("request.validationFailed", "INVALID_CREDENTIALS");
        }

        // Generate JWT tokens for authentication
        const tokens = this.jwtService.generateTokens({
            id: user.id,
            email: user.email,
            role: ROLE.OWNER, // Assuming role is OWNER for simplicity; adjust as needed,
            language: user.language || 'en', // default language
        });

        // Save refresh token
        await this.refreshTokenRepository.create({
            userId: user.id,
            token: {
                tokenHash: await this.jwtService.hashRefreshToken(tokens.refreshToken),
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

        // Publish user login event to RabbitMQ
        const event: UserLoginEvent = {
            userId: user.id,
            email: user.email,
            fullName: user.fullName || "",
            ipAddress: ipAddress, // You can set this if you have access to the request IP
        };

        await this.authPublisher.userLoggedIn(event);

        // Return tokens to the controller for response
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}