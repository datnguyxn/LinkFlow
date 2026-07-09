import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const deleteUserSchema: FastifySchema = {
    tags: ["Admin"],

    summary: "Delete User",

    description: "Delete a user from the system.",

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
            description: "User deleted successfully",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Object({}),
                meta: Type.Object({
                    timestamp: Type.String(),
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