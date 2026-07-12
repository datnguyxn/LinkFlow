import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";
import { createSwaggerResponse } from "../../../common/swagger/swagger-response.ts";

export const getUserSchema: FastifySchema = {
    tags: ["Admin"],

    summary: "Get User",

    description: "Retrieve a user by their unique ID.",

    params: {
        type: "object",

        required: ["id"],

        properties: {
            id: Type.String({
                description: "The ID of the user whose role is to be changed",
                format: "uuid"
            })
        }
    },

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
};