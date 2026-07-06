import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

export class RefreshTokenRepository {
    async create(data: {token: Prisma.RefreshTokenCreateInput, userId: string}) {
        return prisma.refreshToken.create({
            data: {
                tokenHash: data.token.tokenHash,
                userId: data.userId,
                expiresAt: data.token.expiresAt
            }
        });
    }

    async findByUserIdAndRevoked(userId: string, revoked: boolean) {
        return prisma.refreshToken.findMany({
            where: {
                userId,
                revoked
            }
        });
    }

    async revoke(id: string) {
        return prisma.refreshToken.update({
            where: {
                id
            },
            data: {
                revoked: true
            }
        });
    }

    async revokeAllByUserId(userId: string) {
        return prisma.refreshToken.updateMany({
            where: {
                userId
            },
            data: {
                revoked: true
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