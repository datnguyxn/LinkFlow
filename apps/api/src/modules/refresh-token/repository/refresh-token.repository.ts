import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma, PrismaClient } from "@prisma/client";

export class RefreshTokenRepository {
    async create(
        data: 
        { 
            token: Prisma.RefreshTokenCreateInput, 
            userId: string, 
            ipAddress?: string, 
            userAgent?: string,
            rememberMe?: boolean
        }, 
        db: Prisma.TransactionClient | PrismaClient = prisma
    ) {
        return db.refreshToken.create({
            data: {
                tokenHash: data.token.tokenHash,
                userId: data.userId,
                expiresAt: data.token.expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                rememberMe: data.rememberMe
            }
        });
    }

    async findByUserIdAndRevoked(
        userId: string, 
        revoked: boolean, 
        db: Prisma.TransactionClient | PrismaClient = prisma
    ) {
        return db.refreshToken.findMany({
            where: {
                userId,
                revoked
            }
        });
    }

    async findByTokenHash(tokenHash: string) {
        return prisma.refreshToken.findFirst({
            where: {
                tokenHash
            }
        });
    }

    async revoke(id: string) {
        return prisma.refreshToken.update({
            where: {
                id
            },
            data: {
                revoked: true,
                revokedAt: new Date()
            }
        });
    }

    async revokeAllByUserId(
        userId: string, 
        db: Prisma.TransactionClient | PrismaClient = prisma
    ) {
        return db.refreshToken.updateMany({
            where: {
                userId
            },
            data: {
                revoked: true,
                revokedAt: new Date()
            }
        });
    }

    async deleteExpired() {
        return prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
    }
}