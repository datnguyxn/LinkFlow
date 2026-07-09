import type { FastifySchema } from "fastify";
import { Type } from "@sinclair/typebox";

export const loginSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Login",

    description: "Authenticate a user and return tokens.",

    body: {
        type: "object",

        required: ["email", "password"],

        properties: {
            email: Type.String({
                description: "The email address of the user",
                format: "email"
            }),

            password: Type.String({
                description: "The password for the user account",
                minLength: 8,
                maxLength: 100
            })
        }
    },

    response: {
        200: {
            description: "Login successful",

            type: "object",

            properties: {
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