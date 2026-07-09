import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const changeRoleSchema: FastifySchema = {
    tags: ["Admin"],

    summary: "Change User Role",

    description: "Change the role of a user in the system.",

    body: {
        type: "object",

        required: ["newRole"],

        properties: {
            newRole: Type.String({
                description: "The new role to be assigned to the user",
                enum: ["user", "admin", "moderator"]
            })
        }
    },

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

    response: {
        200: {
            description: "User role changed successfully",

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