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
            data: Type.Null(),
            meta: Type.Object({
                timestamp: Type.String(),
                requestId: Type.String(),
            }),
        }),

        401: Type.Object({
            success: Type.Boolean(),
            statusCode: Type.Number(),
            message: Type.String(),
            errorCode: Type.String(),
        }),
    },
};