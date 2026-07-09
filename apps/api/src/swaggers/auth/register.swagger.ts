import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const registerSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Register",

    description: "Create a new user account.",

    body: {
        type: "object",

        required: ["fullName", "email", "password"],

        properties: {
            fullName: Type.String({
                description: "The full name of the user",
                minLength: 1,
                maxLength: 100,
            }),
            email: Type.String({
                description: "The email address of the user",
                format: "email",
            }),
            password: Type.String({
                description: "The password for the user account",
                minLength: 8,
                maxLength: 100,
            }),
        }
    },

    response: {
        201: Type.Object({
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
        400: Type.Object({
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
        }),
        409: Type.Object({
            success: Type.Boolean(),
            statusCode: Type.Number(),
            message: Type.String(),
            errorCode: Type.String(),
            meta: Type.Object({
                timestamp: Type.String(),
                requestId: Type.String(),
            }),
        }),
    }
};