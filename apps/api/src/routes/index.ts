import type { FastifyInstance } from "fastify";
import { authRoutes } from "../modules/auth/route/auth.route.ts";
import { ROUTE } from "../common/constants/index.ts";

export async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, {
    prefix: ROUTE.AUTH,
  });
}