import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";


export const getMyProfileSwagger : FastifySchema = {
    summary: "Get My Profile",
    description: "Retrieve the profile information of the currently authenticated user.",
    tags: ["User Management"],
    security: [
        {
            bearerAuth: [],
        },
    ],
    response: {
        200: {
            description: "Successfully retrieved user profile",
            type: "object",
            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Object({
                    email: Type.String({ format: "email" }),
                    fullName: Type.String(),
                    avatarUrl: Type.String({ format: "uri" }),
                    status: Type.String(),
                    emailVerified: Type.Boolean(),
                    language: Type.String(),
                    timezone: Type.String()
                }),
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