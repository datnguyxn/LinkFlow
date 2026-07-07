import type { FastifySchema } from "fastify";

export const loginSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Login",

    description: "Authenticate a user and return tokens.",

    body: {
        type: "object",

        required: ["email", "password"],

        properties: {
            email: {
                type: "string",
                format: "email"
            },

            password: {
                type: "string",
                format: "password"
            }
        }
    },

    response: {
        200: {
            description: "Login successful",

            type: "object",

            properties: {
                success: {
                    type: "boolean"
                },

                statusCode: {
                    type: "integer"
                },

                message: {
                    type: "string"
                },

                data: {
                    type: "object",

                    properties: {
                        accessToken: {
                            type: "string"
                        },

                        refreshToken: {
                            type: "string"
                        }
                    }
                }
            }
        },

        400: {
            description: "Validation failed",

            type: "object",

            properties: {
                success: {
                    type: "boolean"
                },

                statusCode: {
                    type: "integer"
                },

                message: {
                    type: "string"
                },

                errors: {
                    type: "array",

                    items: {
                        type: "object",

                        properties: {
                            field: {
                                type: "string"
                            },

                            message: {
                                type: "string"
                            },

                            code: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        }
    }
};