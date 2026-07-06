import { prisma } from "./prisma.client.ts";
import type { Prisma } from "@prisma/client";

export class TransactionService {

    async run<T>(
        callback: (tx: Prisma.TransactionClient) => Promise<T>,
    ): Promise<T> {
        return prisma.$transaction(callback);
    }

}