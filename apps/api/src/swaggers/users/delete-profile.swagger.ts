import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const deleteProfileSwagger: FastifySchema = {
    summary: "Delete My Profile",
    description: "Delete the profile of the currently authenticated user.",
    tags: ["User Management"],
    security: [
        {
            bearerAuth: [],
        },
    ],
    response: {
        200: {
            description: "Successfully deleted user profile",
            type: "object",
            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Null(),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                }),
            },
        },
        401: {
            description: "Unauthorized - User is not authenticated",
            type: "object",
            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                errors: Type.Array(Type.Object({
                    field: Type.String(),
                    message: Type.String(),
                    code: Type.String(),
                })),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                }),
            },
        },
    },
};      