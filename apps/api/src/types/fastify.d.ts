import "fastify";
import { PrismaClient } from "@prisma/client";
import { TFunction } from "i18next";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;

    authenticate: (
      request: import("fastify").FastifyRequest
    ) => Promise<void>;
  }

  interface FastifyRequest {
    t: TFunction;

    user?: {
      id: string;
      email: string;
      language: string;
      role: string;
    };
  }
}