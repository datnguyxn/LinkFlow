import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import { loadEnv } from "../config/env/index.ts";

const env = loadEnv();

export default fp(async (fastify) => {
  await fastify.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: "onRequest",
  });
});