import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";

export class AuditLogRepository {

    create(data: Prisma.AuditLogCreateInput) {
        return prisma.auditLog.create({
            data
        });
    }

    async findByUserId(userId: string) {
        return prisma.auditLog.findMany({
            where: {
                userId
            }
        });
    }

    async findAll() {
        return prisma.auditLog.findMany();
    }

    async deleteOldLogs() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });
    }

}