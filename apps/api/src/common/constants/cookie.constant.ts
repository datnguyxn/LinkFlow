import type { CookieSerializeOptions } from "@fastify/cookie";
import { loadEnv } from "../../config/env/index.ts";
import { ROUTE } from "./index.ts";
const env = loadEnv();

export const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",

    path: env.API_PREFIX + ROUTE.AUTH + "/refresh-token",

    maxAge: 60 * 60 * 24 * 7, // 7 days (seconds)

    signed: false,
};