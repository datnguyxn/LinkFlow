import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import { config } from "../config/env/index.ts";

export default fp(async (fastify) => {
  await fastify.register(cookie, {
    secret: config.COOKIE_SECRET,
    hook: "onRequest",
  });
});