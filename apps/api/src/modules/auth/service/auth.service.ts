import { AuthRepository } from '../repository/auth.repository.ts';
import { WorkspaceRepository } from '../../workspace/repository/workspace.repository.ts';
import { RefreshTokenRepository } from '../../refresh-token/repository/refresh-token.repository.ts';

import type { AuthResponse } from '../types/auth.type.ts';
import { hashPassword } from '../utils/password.util.ts';
import { JwtService } from './jwt.service.ts';
import { HTTP_STATUS, ROLE } from '../../../common/constants/index.ts';
import { AppError } from '../../../common/errors/index.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { loadEnv } from '../../../config/env/index.ts';
import type { UserRegisteredEvent } from '../../../events/auth/user-registered.event.ts';
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
        private authRepository = new AuthRepository(),
        private workspaceRepository = new WorkspaceRepository(),
        private refreshTokenRepository = new RefreshTokenRepository(),
        private jwtService = new JwtService(),
        private transactionService = new TransactionService(),
        private authPublisher = new AuthPublisher(new Publisher()),
        private env = loadEnv(),
    ) {}

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
        fullName: string
    ): Promise < AuthResponse | null > {

        console.log("Registering user:", { email, fullName }); // Debug log

        // Check duplicate email
        const existingUser = await this.authRepository.findUserByEmail(email);

        console.log("Existing user check:", existingUser); // Debug log

        if(existingUser) {
            throw new AppError(HTTP_STATUS.CONFLICT, "User already exists", "USER_ALREADY_EXISTS");
        }

        // Hash raw password before saving to DB
        const hashedPassword = await hashPassword(password);

        // Create user with default role and workspace inside a transaction
        const result = await this.transactionService.run(async (tx) => {

            // 1. Create user
            const newUser = await this.authRepository.createUser({
                email,
                passwordHash: hashedPassword,
                fullName,
                language: 'en', // default language
            });

            // 2. Create default workspace for the new user
            const workspace = await this.workspaceRepository.create(tx, {
                name: fullName,
                ownerId: newUser.id,
            });

            return { newUser, workspace };
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
                expiresAt: new Date(Date.now() + parseInt(this.env.JWT_REFRESH_EXPIRES_MS.toString() || '604800000')), // default 7 days
                user: {
                    connect: {
                        id: result.newUser.id,
                    },
                },
            }
        });

        const verifyToken = randomUUID(); // Generate a unique verification token

        // Publish user registered event to RabbitMQ
        const event: UserRegisteredEvent = {
            userId: result.newUser.id,
            email: result.newUser.email,
            fullName: result.newUser.fullName || "",
            verifyToken: verifyToken, // Using the generated verification token
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
            return await this.authRepository.findUserByEmail(email);
        }
    }