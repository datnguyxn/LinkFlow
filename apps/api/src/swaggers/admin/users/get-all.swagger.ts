import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const getAllUsersSchema: FastifySchema = {
    tags: ["Admin"],

    summary: "Get All Users",

    description: "Retrieve a list of all users in the system.",

    response: {
        200: {
            description: "Users retrieved successfully",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Array(Type.Object({
                    email: Type.String({ format: "email" }),
                    fullName: Type.String(),
                    avatarUrl: Type.String({ format: "uri" }),
                    status: Type.String(),
                    emailVerified: Type.Boolean(),
                    language: Type.String(),
                    timezone: Type.String()
                })),
                meta: Type.Object({
                    timestamp: Type.String(),
                    pagination: Type.Object({
                        page: Type.Number(),
                        limit: Type.Number(),
                        totalItems: Type.Number(),
                        totalPages: Type.Number(),
                        hasNextPage: Type.Boolean(),
                        hasPreviousPage: Type.Boolean()
                    }),
                    requestId: Type.String(),
                })
            }
        },

        400: {
            description: "Validation failed",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                errors: Type.Array(Type.Object({
                    field: Type.String(),
                    message: Type.String()
                })),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                })
            }
        },

        403: {
            description: "Forbidden",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                errors: Type.Array(Type.Object({
                    field: Type.String(),
                    message: Type.String()
                })),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                })
            }
        }
    }
};