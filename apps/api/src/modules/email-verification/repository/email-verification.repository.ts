import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

export class EmailVerificationRepository {
    async create(transaction: Prisma.TransactionClient, data: { verifyToken: string, userId: string }) {
        return await prisma.emailVerificationToken.create({
            data: {
                tokenHash: data.verifyToken,
                userId: data.userId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // Token expires in 10 minutes
            }
        });
    }

    async findByToken(verifyToken: string) {
        return await prisma.emailVerificationToken.findMany({
            where: {
                tokenHash: verifyToken
            }
        });
    }

    async delete(id: string) {
        return await prisma.emailVerificationToken.delete({
            where: {
                id: id
            }
        });
    }
}