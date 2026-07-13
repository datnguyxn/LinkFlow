import { Type, type TSchema } from '@sinclair/typebox';

export function SuccessResponseSchema(data: TSchema, description = 'Successful response') {
  return Type.Object(
    {
      success: Type.Boolean({
        description: 'Indicates whether the request was successful.',
      }),

      statusCode: Type.Number({
        description: 'HTTP status code.',
        examples: [200],
      }),

      message: Type.String({
        description: 'Human-readable response message.',
        examples: ['Operation completed successfully.'],
      }),

      data,

      meta: Type.Object({
        timestamp: Type.String({
          description: 'Response timestamp in ISO 8601 format.',
          format: 'date-time',
        }),

        requestId: Type.String({
          description: 'Unique request identifier for tracing.',
        }),
      }),
    },
    {
      description,
    },
  );
}
