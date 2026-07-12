import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSwaggerResponse } from "../../common/swagger/swagger-response.ts";


export const getMyProfileSwagger: FastifySchema = {
    summary: "Get My Profile",
    description: "Retrieve the profile information of the currently authenticated user.",
    tags: ["User Management"],
    security: [
        {
            bearerAuth: [],
        },
    ],
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
    )
};