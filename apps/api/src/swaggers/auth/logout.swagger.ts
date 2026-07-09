import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const logoutSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Logout",

    description: "Logout a user and invalidate the refresh token.",

    response: {
        200: {
            description: "Logout successful",

            type: "object",

            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                data: Type.Null(),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                })
            }
        },

        400: {
            description: "Logout failed",

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
                })
            }
        }
    }
};