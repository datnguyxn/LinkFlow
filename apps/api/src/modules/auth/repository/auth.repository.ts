import { prisma } from "../../../infrastructure/database/index.ts";
import { Prisma } from "@prisma/client";


export class AuthRepository {
    async findUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async createUser(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
        });
    }
}
