import { AuthRepository } from '../repository/auth.repository.ts';
import type { AuthResponse } from '../types/auth.type.ts';
import { hashPassword } from '../utils/password.util.ts';
import { JwtService } from './jwt.service.ts';
import { HTTP_STATUS, ROLE } from '../../../common/constants/index.ts';
import { AppError } from '../../../common/errors/index.ts';

/**
 * AuthService handles business logic related to authentication.
 * - It interacts with repositories for data access and utilities for token generation.
 * - Keeps controller layer clean by encapsulating complex logic.
 */
export class AuthService {
    private authRepository: AuthRepository;
    private jwtService: JwtService;

    constructor() {
        // Inject repositories (currently manual instantiation)
        this.authRepository = new AuthRepository();
        this.jwtService = new JwtService();
    }

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
    ): Promise<AuthResponse | null> {

        console.log("Registering user:", { email, fullName }); // Debug log

        // Check duplicate email
        const existingUser = await this.authRepository.findUserByEmail(email);

        console.log("Existing user check:", existingUser); // Debug log

        if (existingUser) {
            throw new AppError(HTTP_STATUS.CONFLICT, "User already exists", "USER_ALREADY_EXISTS");
        }

        // Hash raw password before saving to DB
        const hashedPassword = await hashPassword(password);

        // Create user with assigned role
        const newUser = await this.authRepository.createUser(
            {
                email,
                passwordHash: hashedPassword,
                fullName,
                language: 'en', // default language
            });

        // Generate JWT tokens for authentication
        const tokens = this.jwtService.generateTokens({
            id: newUser.id,
            email: newUser.email,
            role: ROLE.OWNER,
            language: newUser.language || 'en', // default language
        });

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