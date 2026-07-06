import type { CookieSerializeOptions } from "@fastify/cookie";
import { loadEnv } from "../../config/env/index.ts";
import { ROUTE } from "./route.constant.ts";

export function getCookieOptions(): CookieSerializeOptions {
    const env = loadEnv();

    return {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",

        path: env.API_PREFIX + ROUTE.AUTH + "/refresh-token",

        maxAge: 60 * 60 * 24 * 7, // 7 days

        signed: false,
    };
}