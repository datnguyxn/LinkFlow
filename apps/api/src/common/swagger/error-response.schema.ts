import { Type } from "@sinclair/typebox";

export const ErrorResponseSchema = Type.Object(
    {
        success: Type.Boolean({
            description: "Indicates whether the request was successful.",
        }),

        statusCode: Type.Number({
            description: "HTTP status code.",
        }),

        message: Type.String({
            description: "Human-readable error message.",
        }),

        errors: Type.Optional(
            Type.Array(
                Type.Object({
                    field: Type.Optional(
                        Type.String({
                            description: "Field associated with the error.",
                        }),
                    ),

                    message: Type.String({
                        description: "Detailed error message.",
                    }),

                    code: Type.String({
                        description: "Application-specific error code.",
                    }),
                }),
            ),
        ),

        meta: Type.Object({
            timestamp: Type.String({
                format: "date-time",
            }),

            requestId: Type.String(),
        }),
    },
    {
        description: "Error response.",
    },
);