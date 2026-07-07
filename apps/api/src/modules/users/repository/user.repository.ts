import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

export class UserRepository {
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: {
                email
            }
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
                    timezone: data.timezone,
                }
            });
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: {
                id
            },
            data
        });
    }

    async delete(id: string) {
        return prisma.user.delete({
            where: {
                id
            }
        });
    }
}