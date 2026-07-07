import type { FastifySchema } from "fastify";

export const registerSwagger: FastifySchema = {
    tags: ["Authentication"],

    summary: "Register",

    description: "Create a new user account.",

    body: {
        type: "object",

        required: ["fullName", "email", "password"],

        properties: {
            fullName: {
                type: "string"
            },

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
        201: {
            description: "Register successfully",

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