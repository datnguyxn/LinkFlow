import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { loadEnv } from "../config/env/index.ts";
import type { FastifyRequest } from "fastify";

const env = loadEnv();

export default fp(async (fastify) => {
    await fastify.register(jwt, {
        secret: env.JWT_ACCESS_SECRET,
        sign: {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        },
    });

    fastify.decorate("authenticate", async (request: FastifyRequest) => {
        await request.jwtVerify();
    });
});