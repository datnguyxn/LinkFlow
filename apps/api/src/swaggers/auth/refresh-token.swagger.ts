import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const refreshTokenSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Refresh Token",

    description: "Refresh the access token using a valid refresh token.",

    response: {
        200: Type.Object({
            success: Type.Boolean(),
            statusCode: Type.Number(),
            message: Type.String(),
            data: Type.Object({
                accessToken: Type.String(),
                refreshToken: Type.String(),
            }),
            meta: Type.Object({
                timestamp: Type.String(),
                requestId: Type.String(),
            }),
        }),

        401:
        {
            description: "Unauthorized - User is not authenticated",
            type: "object",
            properties: {
                success: Type.Boolean(),
                statusCode: Type.Number(),
                message: Type.String(),
                errors: Type.Array(Type.Object({
                    field: Type.Optional(Type.String()),
                    message: Type.String(),
                    code: Type.String(),
                })),
                meta: Type.Object({
                    timestamp: Type.String(),
                    requestId: Type.String(),
                }),
            },
        },
    }
};