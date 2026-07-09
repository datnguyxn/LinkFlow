import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const banUserSchema: FastifySchema = {
    tags: ["Admin"],

    summary: "Ban User",

    description: "Ban a user from the system.",

    params: {
        type: "object",

        required: ["userId"],

        properties: {
            userId: Type.String({
                description: "The ID of the user to be banned",
                format: "uuid"
            })
        }
    },

    response: {
        200: {
            description: "User banned successfully",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Object({
                    userId: Type.String(),
                    bannedAt: Type.String({ format: "date-time" }),
                    bannedBy: Type.String()
                }),
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
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                })
            }
        }
    }
};
