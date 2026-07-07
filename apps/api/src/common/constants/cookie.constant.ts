import type { CookieSerializeOptions } from "@fastify/cookie";
import { config } from "../../config/env/index.ts";
import { ROUTE } from "./route.constant.ts";

export const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",

    path: config.API_PREFIX + ROUTE.AUTH + "/refresh-token",

    maxAge: 60 * 60 * 24 * 7, // 7 days

    signed: false,
};