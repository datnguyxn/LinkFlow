import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

/**
 * Repository layer for authentication-related database operations
 * - Handles direct Prisma queries
 * - Keeps service layer clean from DB logic
 */
export class AuthRepository {

    /**
     * Find a user by email
     * Used for:
     * - Checking duplicate registration
     * - Login validation
     */
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Create a new user and assign role inside a transaction
     *
     * Transaction flow:
     * 1. Create user record
     * 2. Create user-role mapping
     * 3. Ensure both operations succeed or both rollback
     */
    async createUser(
        data: Prisma.UserCreateInput 
    ) {
        // Use a transaction to ensure atomicity
        return await prisma.user.create({
                data: {
                    fullName: data.fullName,
                    email: data.email,
                    passwordHash: data.passwordHash,
                    language: data.language,
                }
            });
    }
}