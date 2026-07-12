import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSwaggerResponse } from "../../common/swagger/swagger-response.ts";

export const logoutSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Logout",

    description: "Logout a user and invalidate the refresh token.",

    response: createSwaggerResponse(
        200,
        Type.Null(),
        [400, 401, 403, 404, 500]
    ),
};