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

    async create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data
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