import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSwaggerResponse } from "../../common/swagger/swagger-response.ts";

export const updateProfileSwagger: FastifySchema = {
    summary: "Update My Profile",
    description: "Update the profile information of the currently authenticated user.",
    tags: ["User Management"],
    security: [
        {
            bearerAuth: [],
        },
    ],
    body: Type.Object({
        fullName: Type.Optional(Type.String()),
        avatarUrl: Type.Optional(Type.String({ format: "uri" })),
        theme: Type.Optional(Type.String()),
        language: Type.Optional(Type.String()),
        timezone: Type.Optional(Type.String()),
    }),
    response: createSwaggerResponse(
        200,
        Type.Object({
            email: Type.String({ format: "email" }),
            fullName: Type.String(),
            avatarUrl: Type.String({ format: "uri" }),
            status: Type.String(),
            emailVerified: Type.Boolean(),
            language: Type.String(),
            timezone: Type.String()
        }),
        [400, 401, 403, 404, 500]
    ),
}