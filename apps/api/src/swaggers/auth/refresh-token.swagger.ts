import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSwaggerResponse } from "../../common/swagger/swagger-response.ts";
export const refreshTokenSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Refresh Token",

    description: "Refresh the access token using a valid refresh token.",

    response: createSwaggerResponse(
        200,
        Type.Object({
            accessToken: Type.String({
                description: "New access token",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            }),
            refreshToken: Type.String({
                description: "New refresh token",
                example: "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4gZXhhbXBsZQ==",
            }),
        }),
        [400, 401, 403, 404, 500]
    ),
};